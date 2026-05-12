import WitcherActorSheet from './WitcherActorSheet.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { alchemyMixin } from './mixins/alchemyMixin.js';
import RewardsSheet from '../rewardsSheet.js';
import WitcherModifiersConfiguration from '../../actor/sheets/configurations/WitcherModifiersConfiguration.js';

const DialogV2 = foundry.applications.api.DialogV2;

export default class WitcherCharacterSheet extends WitcherActorSheet {
    uniqueTypes = ['profession', 'race', 'homeland'];

    rewards = new RewardsSheet({ document: this.actor });

    /** @override */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
        classes: ['witcher', 'sheet', 'actor', 'character-v2'],
        window: {
            vertical: false,
            resizable: true
        },
        position: {
            width: 1150,
            height: 850
        },
        actions: {
            openAttributeDialog: this.#openAttributeDialog,
            openDerivedDialog: this.#openDerivedDialog,
            openModifiers: this.#openModifiers,
            editReputation: this.#editReputation,
            rollInit: function() { return this.actor.rollInitiative({createCombatants: true}); },
            rollVCInit: function() { return this.actor.rollVerbalInitiative(); },
            rollStun: function() { return this.actor.rollStun(); },
            rollSave: function() { return this.actor.rollDeathSave(); }
        }
    });

    static PARTS = {
        sidebar: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character/sidebar.hbs'
        },
        header: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character-header.hbs'
        },
        tabs: {
            // Foundry-provided generic template
            template: 'templates/generic/tab-navigation.hbs'
        },
        stats: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character/tab-stats.hbs',
            scrollable: ['']
        },
        skills: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character/tab-skills.hbs',
            scrollable: ['']
        },
        profession: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character/tab-profession.hbs',
            scrollable: ['']
        },
        inventory: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character/tab-inventory.hbs',
            scrollable: ['']
        },
        magic: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character/tab-magic.hbs',
            scrollable: ['']
        },
        background: {
            template: 'systems/TheWitcherItaNewSystem/templates/partials/character/tab-background.hbs',
            scrollable: ['']
        },
        effects: {
            template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/partials/character/tab-effects.hbs',
            scrollable: ['']
        }
    };

    static TABS = {
        primary: {
            tabs: [
                { id: 'stats', cssClass: 'stats' },
                { id: 'skills', cssClass: 'skills' },
                { id: 'profession', cssClass: 'profession' },
                { id: 'inventory', cssClass: 'inventory' },
                { id: 'magic', cssClass: 'magic' },
                { id: 'background', cssClass: 'background' },
                { id: 'effects', cssClass: 'effects' }
            ],
            initial: 'stats',
            labelPrefix: 'WITCHER.Actor.tabs'
        },
        skillTabs: {
            tabs: [
                { id: 'all', cssClass: 'all', label: 'WITCHER.Button.All' },
                { id: 'int', cssClass: 'int', label: 'WITCHER.Actor.Stat.Int' },
                { id: 'ref', cssClass: 'ref', label: 'WITCHER.Actor.Stat.Ref' },
                { id: 'dex', cssClass: 'dex', label: 'WITCHER.Actor.Stat.Dex' },
                { id: 'body', cssClass: 'body', label: 'WITCHER.Actor.Stat.Body' },
                { id: 'emp', cssClass: 'emp', label: 'WITCHER.Actor.Stat.Emp' },
                { id: 'cra', cssClass: 'cra', label: 'WITCHER.Actor.Stat.Cra' },
                { id: 'will', cssClass: 'will', label: 'WITCHER.Actor.Stat.Will' },
                { id: 'ip', cssClass: 'ip', label: 'WITCHER.Actor.rewards.ip' }
            ],
            initial: 'all'
        },
        magicTabs: {
            tabs: [
                { id: 'all', cssClass: 'all', label: 'WITCHER.Button.All' },
                { id: 'magic', cssClass: 'magic', label: 'WITCHER.Actor.tabs.magic' },
                { id: 'rituals', cssClass: 'rituals', label: 'WITCHER.Spell.Rituals' },
                { id: 'hexes', cssClass: 'hexes', label: 'WITCHER.Spell.Hexes' },
                { id: 'magicalGift', cssClass: 'magicalGift', label: 'WITCHER.Spell.MagicalGift' },
                { id: 'focus', cssClass: 'focus', label: 'WITCHER.Actor.focus.name' }
            ],
            initial: 'all'
        }
    };

    /** Restructure window-content into sidebar + main columns after first render */
    _onRender(context, options) {
        super._onRender(context, options);

        // Prevent Enter key from submitting the form and opening ghost windows
        this.element.querySelectorAll('input').forEach(input => {
            if (input._hasWitcherEnterHandler) return;
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur(); // Triggers change -> submitOnChange
                }
            });
            input._hasWitcherEnterHandler = true;
        });

        const content = this.element.querySelector('.window-content');
        if (!content || content.querySelector('.char-main-wrapper')) return;
        const sidebar = content.querySelector('[data-application-part="sidebar"]');
        if (!sidebar) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'char-main-wrapper';
        Array.from(content.children).forEach(child => {
            if (child !== sidebar && !child.classList.contains('char-main-wrapper')) wrapper.appendChild(child);
        });
        content.appendChild(wrapper);
    }

    activateListeners(html) {
        super.activateListeners(html);
        let jquery = $(html);
        jquery.find('.alchemy-potion').on('click', this._alchemyCraft.bind(this));
        jquery.find('.crafting-craft').on('click', this._craftingCraft.bind(this));
        jquery.find('.item-repair').on('click', this._repairItem.bind(this));
        jquery.find('.manualIpReward').on('click', this._addIpReward.bind(this));
        jquery.find('.saveIpSpending').on('click', this._saveIpSpending.bind(this));

        jquery.find('.open-rewards').on('click', this._renderRewards.bind(this));
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        await this._prepareCharacterData(context);
        this._prepareDiagramFormulas(context);
        this._prepareCrafting(context);
        this._prepareSubstances(context);
        this._prepareAlchemy(context);
        this._prepareValuables(context);
        context.alchemyComponentsList = this._prepareAlchemyComponentsList(context);

        context.system.general.lifeEvents = Object.entries(context.system.general.lifeEvents).map(([key, value]) => ({
            key,
            ...value
        }));
        context.system.lifeEventCounter = context.system.lifeEventCounter || context.system.general.lifeEvents.length;

        context.enrichedText = {
            ...context.enrichedText,
            ...(await this.document.system.enrichedText())
        };

        context.tabs = this._prepareTabs('primary');
        context.skillTabs = this._prepareTabs('skillTabs');
        context.magicTabs = this._prepareTabs('magicTabs');

        return context;
    }

    async _prepareCharacterData(context) {
        let actor = context.actor;

        context.profession = actor.getList('profession')[0];
        context.homeland = actor.getList('homeland')[0];
        context.race = actor.getList('race')[0];

        context.enrichedText = {
            ...context.enrichedText,
            profession: {
                ...(await context.profession?.system.enrichedText())
            },
            race: {
                ...(await context.race?.system.enrichedText())
            }
        };

        context.totalStats = this.calc_total_stats(context);
        context.totalSkills = this.calc_total_skills(context);
        context.totalProfSkills = this.actor.calc_total_skills_profession();
    }

    _prepareDiagramFormulas(context) {
        // Formulae
        context.diagrams = context.actor.getList('diagrams');
        context.alchemicalItemDiagrams = context.diagrams.filter(d => d.system.type == 'alchemical' || !d.system.type);
        context.potionDiagrams = context.diagrams.filter(d => d.system.type == 'potion');
        context.decoctionDiagrams = context.diagrams.filter(d => d.system.type == 'decoction');
        context.oilDiagrams = context.diagrams.filter(d => d.system.type == 'oil');

        // Diagrams
        context.enhancementDiagrams = context.diagrams.filter(d => d.system.type == 'armor-enhancement');
        context.ingredientDiagrams = context.diagrams.filter(d => d.system.type == 'ingredients');
        context.weaponDiagrams = context.diagrams.filter(d => d.system.type == 'weapon');
        context.armorDiagrams = context.diagrams.filter(d => d.system.type == 'armor');
        context.elderfolkWeaponDiagrams = context.diagrams.filter(d => d.system.type == 'elderfolk-weapon');
        context.elderfolkArmorDiagrams = context.diagrams.filter(d => d.system.type == 'elderfolk-armor');
        context.ammunitionDiagrams = context.diagrams.filter(d => d.system.type == 'ammunition');
        context.bombDiagrams = context.diagrams.filter(d => d.system.type == 'bomb');
        context.trapDiagrams = context.diagrams.filter(d => d.system.type == 'traps');
    }

    _prepareCrafting(context) {
        context.allComponents = context.actor.getList('component');
        context.craftingMaterials = context.allComponents.filter(
            i => i.system.type == 'crafting-material' || i.system.type == 'component'
        );
        context.ingotsAndMinerals = context.allComponents.filter(i => i.system.type == 'minerals');
        context.hidesAndAnimalParts = context.allComponents.filter(i => i.system.type == 'animal-parts');
    }

    _prepareAlchemy(context) {
        let items = context.items;
        context.alchemicalItems = items.filter(
            i =>
                (i.type == 'valuable' && i.system.type == 'alchemical-item') ||
                (i.type == 'alchemical' && (i.system.type == '' || i.system.type == 'alchemical'))
        );
        context.witcherPotions = items.filter(
            i => i.type == 'alchemical' && (i.system.type == 'decoction' || i.system.type == 'potion')
        );
        context.oils = items.filter(i => i.type == 'alchemical' && i.system.type == 'oil');
        context.alchemicalTreatments = items.filter(i => i.type == 'component' && i.system.type == 'alchemical');
        context.mutagens = items.filter(i => i.type == 'mutagen');
    }

    _prepareSubstances(context) {
        let actor = context.actor;

        context.substancesVitriol = actor.getSubstance('vitriol');
        context.vitriolCount = context.substancesVitriol.sum('quantity');
        context.substancesRebis = actor.getSubstance('rebis');
        context.rebisCount = context.substancesRebis.sum('quantity');
        context.substancesAether = actor.getSubstance('aether');
        context.aetherCount = context.substancesAether.sum('quantity');
        context.substancesQuebrith = actor.getSubstance('quebrith');
        context.quebrithCount = context.substancesQuebrith.sum('quantity');
        context.substancesHydragenum = actor.getSubstance('hydragenum');
        context.hydragenumCount = context.substancesHydragenum.sum('quantity');
        context.substancesVermilion = actor.getSubstance('vermilion');
        context.vermilionCount = context.substancesVermilion.sum('quantity');
        context.substancesSol = actor.getSubstance('sol');
        context.solCount = context.substancesSol.sum('quantity');
        context.substancesCaelum = actor.getSubstance('caelum');
        context.caelumCount = context.substancesCaelum.sum('quantity');
        context.substancesFulgur = actor.getSubstance('fulgur');
        context.fulgurCount = context.substancesFulgur.sum('quantity');
    }

    _prepareValuables(context) {
        let items = context.items;
        context.valuables = items.filter(i => i.type == 'valuable');

        context.clothingAndContainers = context.valuables.filter(
            i => i.system.type == 'clothing' || i.system.type == 'containers'
        );
        context.general = context.valuables.filter(
            i => i.system.type == 'genera' || i.system.type == 'general' || !i.system.type
        );
        context.foodAndDrinks = context.valuables.filter(i => i.system.type == 'food-drink');
        context.toolkits = context.valuables.filter(i => i.system.type == 'toolkit');
        context.questItems = context.valuables.filter(i => i.system.type == 'quest-item');

        context.mounts = items.filter(i => i.type == 'mount');
        context.mountAccessories = items.filter(i => i.type == 'valuable' && i.system.type == 'mount-accessories');
    }

    async _alchemyCraft(event) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        let content = `<label>${game.i18n.localize('WITCHER.Dialog.Crafting')} ${item.name}</label> <br />`;

        let messageData = new ChatMessageData(this.actor, `<h1>Crafting</h1>`);

        let areCraftComponentsEnough = true;

        content += `<div class="components-display">`;
        let alchemyCraftComponents = item.populateAlchemyCraftComponentsList();
        alchemyCraftComponents
            .filter(a => a.quantity > 0)
            .forEach(a => {
                content += `<div class="flex">${a.content}</div>`;

                let ownedSubstance = this.actor.getSubstance(a.name);
                let ownedSubstanceCount = ownedSubstance.sum('quantity');
                if (ownedSubstanceCount < Number(a.quantity)) {
                    let missing = a.quantity - ownedSubstanceCount;
                    content += `<span class="error-display">${game.i18n.localize('WITCHER.Dialog.NoComponents')}: ${missing} ${a.alias}</span><br />`;
                    areCraftComponentsEnough = false;
                }
            });
        content += `</div>`;

        content += `<label>${game.i18n.localize('WITCHER.Dialog.CraftingDiagram')}: <input type="checkbox" name="hasDiagram"></label> <br />`;
        content += `<label>${game.i18n.localize('WITCHER.Dialog.RealCrafting')}: <input type="checkbox" name="realCraft"></label> <br />`;

        const dialog = new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize('WITCHER.Dialog.AlchemyTitle') },
            content,
            buttons: [{
                action: "craft",
                label: game.i18n.localize('WITCHER.Dialog.ButtonCraft'),
                default: true,
                callback: async (event, button, instance) => {
                    const html = instance.element;
                    let stat = this.actor.system.stats.cra.value;
                    let statName = game.i18n.localize(this.actor.system.stats.cra.label);
                    let skill = this.actor.system.skills.cra.alchemy.value;
                    let skillName = game.i18n.localize(this.actor.system.skills.cra.alchemy.label);
                    let hasDiagram = html.querySelector('[name=hasDiagram]').checked;
                    let realCraft = html.querySelector('[name=realCraft]').checked;
                    skillName = skillName.replace(' (2)', '');
                    (messageData.flavor = `<h1>${game.i18n.localize('WITCHER.Dialog.CraftingAlchemycal')}</h1>`),
                        (messageData.flavor += `<label>${game.i18n.localize('WITCHER.Dialog.Crafting')}:</label> <b>${item.name}</b> <br />`),
                        (messageData.flavor += `<label>${game.i18n.localize('WITCHER.Dialog.after')}:</label> <b>${item.system.craftingTime}</b> <br />`),
                        (messageData.flavor += `${game.i18n.localize('WITCHER.Diagram.alchemyDC')} ${item.system.alchemyDC}`);

                    if (!item.isAlchemicalCraft()) {
                        stat = this.actor.system.stats.cra.value;
                        skill = this.actor.system.skills.cra.crafting.value;
                        messageData.flavor = `${game.i18n.localize('WITCHER.Diagram.craftingDC')} ${item.system.craftingDC}`;
                    }

                    let rollFormula = !displayRollDetails
                        ? `1d10+${stat}+${skill}`
                        : `1d10+${stat}[${statName}]+${skill}[${skillName}]`;

                    if (hasDiagram) {
                        rollFormula += !displayRollDetails
                            ? `+2`
                            : `+2[${game.i18n.localize('WITCHER.Dialog.Diagram')}]`;
                    }

                    rollFormula += this.actor.addAllModifiers('alchemy');

                    let config = new RollConfig();
                    config.showCrit = true;
                    config.showSuccess = true;
                    config.threshold = item.system.alchemyDC;
                    config.thresholdDesc = skillName;
                    config.messageOnSuccess = game.i18n.localize('WITCHER.craft.ItemsSuccessfullyCrafted');
                    config.messageOnFailure = game.i18n.localize('WITCHER.craft.ItemsNotCrafted');

                    if (realCraft) {
                        if (areCraftComponentsEnough) {
                            item.realCraft(rollFormula, messageData, config);
                        } else {
                            return ui.notifications.error(
                                game.i18n.localize('WITCHER.Dialog.NoComponents') +
                                    ' ' +
                                    item.system.associatedItem.name
                            );
                        }
                    } else {
                        // Craft without automatic removal components and without real crafting of an item
                        await extendedRoll(rollFormula, messageData, config);
                    }
                }
            }]
        });
        dialog.render(true);
    }

    async _craftingCraft(event) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        let content = `<label>${game.i18n.localize('WITCHER.Dialog.Crafting')} ${item.name}</label> <br />`;

        let messageData = new ChatMessageData(this.actor, `<h1>Crafting</h1>`);

        let areCraftComponentsEnough = true;
        content += `<div class="components-display">`;
        item.system.craftingComponents.forEach(craftingComponent => {
            content += `<div class="flex"><b>${craftingComponent.name}</b>(${craftingComponent.quantity}) </div>`;

            let ownedComponent = this.actor.findNeededComponent(craftingComponent.name);
            let componentQuantity = ownedComponent.sum('quantity');

            if (componentQuantity < Number(craftingComponent.quantity)) {
                let missing = craftingComponent.quantity - Number(componentQuantity);
                areCraftComponentsEnough = false;
                content += `<span class="error-display">${game.i18n.localize('WITCHER.Dialog.NoComponents')}: ${missing} ${craftingComponent.name}</span><br />`;
            }
        });
        content += `</div>`;

        content += `<label>${game.i18n.localize('WITCHER.Dialog.CraftingDiagram')}: <input type="checkbox" name="hasDiagram"></label> <br />`;
        content += `<label>${game.i18n.localize('WITCHER.Dialog.RealCrafting')}: <input type="checkbox" name="realCraft"></label> <br />`;

        const dialog = new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize('WITCHER.Dialog.CraftingTitle') },
            content,
            buttons: [{
                action: "craft",
                label: game.i18n.localize('WITCHER.Dialog.ButtonCraft'),
                default: true,
                callback: async (event, button, instance) => {
                    const html = instance.element;
                    let stat = this.actor.system.stats.cra.value;
                    let statName = game.i18n.localize(this.actor.system.stats.cra.label);
                    let skill = this.actor.system.skills.cra.crafting.value;
                    let skillName = game.i18n.localize(this.actor.system.skills.cra.crafting.label);
                    let hasDiagram = html.querySelector('[name=hasDiagram]').checked;
                    let realCraft = html.querySelector('[name=realCraft]').checked;
                    skillName = skillName.replace(' (2)', '');
                    (messageData.flavor = `<h1>${game.i18n.localize('WITCHER.Dialog.CraftingItem')}</h1>`),
                        (messageData.flavor += `<label>${game.i18n.localize('WITCHER.Dialog.Crafting')}:</label> <b>${item.name}</b> <br />`),
                        (messageData.flavor += `<label>${game.i18n.localize('WITCHER.Dialog.after')}:</label> <b>${item.system.craftingTime}</b> <br />`),
                        (messageData.flavor += `${game.i18n.localize('WITCHER.Diagram.craftingDC')} ${item.system.craftingDC}`);

                    let rollFormula = '1d10 +';
                    if (game.settings.get('TheWitcherItaNewSystem', 'woundsAffectSkillBase')) {
                        rollFormula += '(';
                    }

                    rollFormula += !displayRollDetails
                        ? `${stat} + ${skill}`
                        : `${stat}[${statName}] + ${skill}[${skillName}]`;

                    if (hasDiagram) {
                        rollFormula += !displayRollDetails
                            ? `+2`
                            : `+2[${game.i18n.localize('WITCHER.Dialog.Diagram')}]`;
                    }

                    rollFormula += this.actor.addAllModifiers('crafting');

                    let config = new RollConfig();
                    config.showCrit = true;
                    config.showSuccess = true;
                    config.threshold = item.system.craftingDC;
                    config.thresholdDesc = skillName;
                    config.messageOnSuccess = game.i18n.localize('WITCHER.craft.ItemsSuccessfullyCrafted');
                    config.messageOnFailure = game.i18n.localize('WITCHER.craft.ItemsNotCrafted');

                    if (realCraft) {
                        if (areCraftComponentsEnough) {
                            item.realCraft(rollFormula, messageData, config);
                        } else {
                            return ui.notifications.error(
                                game.i18n.localize('WITCHER.Dialog.NoComponents') +
                                    ' ' +
                                    item.system.associatedItem.name
                            );
                        }
                    } else {
                        // Craft without automatic removal components and without real crafting of an item
                        await extendedRoll(rollFormula, messageData, config);
                    }
                }
            }]
        });
        dialog.render(true);
    }

    async _repairItem(event) {
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        await item.repair();
    }

    async _addIpReward(event) {
        this.actor.addIpReward();
    }

    async _saveIpSpending(event) {
        let siblings = event.currentTarget.parentElement.children;
        let label = siblings.item(0).value;
        let value = siblings.item(1).value < 0 ? siblings.item(1).value : siblings.item(1).value * -1;

        this.actor.system.logs.addIpReward(label, value);
    }

    async _renderRewards() {
        this.rewards?.render(true);
    }

    static async #openAttributeDialog() {}

    static async #openDerivedDialog() {}

    static async #openModifiers(_, target) {
        _.preventDefault();
        const type = target.dataset.type;
        const skillKey = target.dataset.skillKey;

        new WitcherModifiersConfiguration({
            document: this.document,
            skillKey: skillKey,
            type: type
        })?.render(true);
    }

    static async #editReputation(event, target) {
        const actor = this.document;
        const currentRep = actor.system.reputation.value || 0;
        
        let optionsHtml = '';
        for (let i = 0; i <= 10; i++) {
            const label = game.i18n.localize(`WITCHER.reputationLevels.${i}`);
            const selected = i === currentRep ? 'selected' : '';
            optionsHtml += `<option value="${i}" ${selected}>Livello ${i}: ${label.substring(0, 40)}${label.length > 40 ? '...' : ''}</option>`;
        }

        const content = `
            <div class="reputation-dialog-container" style="display: flex; flex-direction: column; gap: 15px; padding: 10px;">
                <div class="rep-select-group">
                    <label style="font-weight: bold; display: block; margin-bottom: 8px; color: var(--w-gold); text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">${game.i18n.localize('WITCHER.Reputation')} (Grado 0-10):</label>
                    <select name="repLevel" style="width: 100%; height: 36px; padding: 0 10px; background: rgba(0,0,0,0.4); color: white; border: 1px solid var(--w-gold); border-radius: 4px; font-family: 'Goudy Old Style', serif; font-size: 15px; cursor: pointer; outline: none;">
                        ${optionsHtml}
                    </select>
                </div>
                
                <div class="rep-description-box" style="background: rgba(28, 104, 136, 0.1); border-left: 4px solid var(--w-gold); padding: 15px; border-radius: 4px; min-height: 100px; display: flex; flex-direction: column; justify-content: center; box-shadow: inset 0 0 10px rgba(0,0,0,0.2);">
                    <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: var(--w-gold); letter-spacing: 1px; opacity: 0.8;">Chi ti conosce:</h4>
                    <p class="rep-preview-text" style="margin: 0; font-size: 14px; font-style: italic; line-height: 1.4; color: #ddd;">
                        ${game.i18n.localize(`WITCHER.reputationLevels.${currentRep}`)}
                    </p>
                </div>

                ${actor.system.reputation.modifiers.length > 0 ? `
                <div class="rep-modifiers">
                    <label style="font-weight: bold; margin-bottom: 8px; display: block; color: var(--w-gold); font-size: 11px; text-transform: uppercase;">${game.i18n.localize('WITCHER.Apply.Mod')}:</label>
                    <div class="mod-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 120px; overflow-y: auto; padding-right: 5px;">
                        ${actor.system.reputation.modifiers.map(mod => `
                            <label class="checkbox-label" style="display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px 10px; background: rgba(255,255,255,0.05); border-radius: 4px; transition: background 0.2s;">
                                <input class="rep-mod-checkbox" id="${mod.name.replace(/\s/g, '')}" type="checkbox" data-mod-value="${mod.value}" style="width: 16px; height: 16px; accent-color: var(--w-gold);" />
                                <span style="font-size: 13px;">${mod.name} <strong style="color: var(--w-gold);">(${mod.value})</strong></span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        const dialog = new foundry.applications.api.DialogV2({
            window: { 
                title: game.i18n.localize('WITCHER.ReputationTitle'),
                icon: "fas fa-award"
            },
            content,
            buttons: [
                {
                    action: "repUpdate",
                    label: game.i18n.localize('WITCHER.ReputationButton.UpdateLevel'),
                    class: "standard-button gold",
                    callback: async (event, button, dialog) => {
                        const newLevel = parseInt(dialog.element.querySelector('[name="repLevel"]').value);
                        await actor.update({ "system.reputation.unmodifiedMax": newLevel });
                    }
                },
                {
                    action: "repSave",
                    label: game.i18n.localize('WITCHER.ReputationButton.Save'),
                    class: "standard-button blue",
                    callback: async (event, button, dialog) => {
                        const html = dialog.element;
                        let statValue = parseInt(html.querySelector('[name="repLevel"]').value);
                        
                        html.querySelectorAll('.rep-mod-checkbox').forEach(checkbox => {
                            if (checkbox.checked) {
                                statValue += parseInt(checkbox.dataset.modValue);
                            }
                        });

                        const messageData = new ChatMessageData(actor);
                        messageData.flavor = `
                            <h2>${game.i18n.localize('WITCHER.ReputationTitle')}: ${game.i18n.localize('WITCHER.ReputationSave.Title')}</h2>
                            <div class="roll-summary">
                                <div class="dice-formula">${game.i18n.localize('WITCHER.Chat.SaveText')}: <b>${statValue}</b></div>
                            </div>
                            <hr />`;

                        const config = new RollConfig();
                        config.showSuccess = true;
                        config.reversal = true;
                        config.threshold = statValue;

                        await extendedRoll(`1d10`, messageData, config);
                    }
                },
                {
                    action: "repFaceDown",
                    label: game.i18n.localize('WITCHER.ReputationButton.FaceDown'),
                    class: "standard-button red",
                    callback: async (event, button, dialog) => {
                        const html = dialog.element;
                        let repValue = parseInt(html.querySelector('[name="repLevel"]').value);
                        
                        html.querySelectorAll('.rep-mod-checkbox').forEach(checkbox => {
                            if (checkbox.checked) {
                                repValue += parseInt(checkbox.dataset.modValue);
                            }
                        });

                        const messageData = new ChatMessageData(actor);
                        const rollFormula = `1d10 + ${Number(repValue)}[${game.i18n.localize('WITCHER.Reputation')}] + ${Number(actor.system.stats.will.value)}[${game.i18n.localize('WITCHER.StWill')}]`;
                        messageData.flavor = `
                            <h2>${game.i18n.localize('WITCHER.ReputationTitle')}: ${game.i18n.localize('WITCHER.ReputationFaceDown.Title')}</h2>
                            <div class="roll-summary">
                                <div class="dice-formula">${game.i18n.localize('WITCHER.Context.Result')}: <b>${rollFormula}</b></div>
                            </div>
                            <hr />`;

                        await extendedRoll(rollFormula, messageData, new RollConfig());
                    }
                }
            ],
            render: (instance) => {
                const select = instance.element.querySelector('[name="repLevel"]');
                const preview = instance.element.querySelector('.rep-preview-text');
                select.addEventListener('change', (e) => {
                    preview.innerText = game.i18n.localize(`WITCHER.reputationLevels.${e.target.value}`);
                });

                // Add tooltips to buttons in the footer (after a small delay to ensure rendering)
                setTimeout(() => {
                    const footer = instance.element.closest('.window-content')?.parentElement.querySelector('footer.window-footer');
                    if (footer) {
                        const btnUpdate = footer.querySelector('[data-button-action="repUpdate"]');
                        const btnSave = footer.querySelector('[data-button-action="repSave"]');
                        const btnFaceDown = footer.querySelector('[data-button-action="repFaceDown"]');

                        if (btnUpdate) btnUpdate.dataset.tooltip = game.i18n.localize('WITCHER.ReputationButton.UpdateLevelTooltip');
                        if (btnSave) btnSave.dataset.tooltip = game.i18n.localize('WITCHER.ReputationButton.SaveTooltip');
                        if (btnFaceDown) btnFaceDown.dataset.tooltip = game.i18n.localize('WITCHER.ReputationButton.FaceDownTooltip');
                    }
                }, 100);
            }
        });
        dialog.render(true);
    }
}

Object.assign(WitcherCharacterSheet.prototype, alchemyMixin);
