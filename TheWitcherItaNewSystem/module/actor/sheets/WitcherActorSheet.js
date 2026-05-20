import { deathsaveMixin } from './mixins/deathSaveMixin.js';
import { criticalWoundMixin } from './mixins/criticalWoundMixin.js';
import { noteMixin } from './mixins/noteMixin.js';
import { skillModifierMixin } from './mixins/skillModifierMixin.js';
import { skillMixin } from './mixins/skillMixin.js';
import { statMixin } from './mixins/statMixin.js';
import { itemMixin } from './mixins/itemMixin.js';
import { healMixin } from './mixins/healMixin.js';
import { progressionSheetMixin } from './mixins/progressionSheetMixin.js';

import { itemContextMenu } from './interactions/itemContextMenu.js';
import { activeEffectMixin } from './mixins/activeEffectMixin.js';
import { customSkillMixin } from './mixins/customSkillMixin.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

Array.prototype.sum = function (prop) {
    var total = 0;
    for (var i = 0; i < this.length; i++) {
        total += Number(this[i].system[prop] ?? 0);
    }
    return total;
};

Array.prototype.cost = function () {
    var total = 0;
    for (var i = 0; i < this.length; i++) {
        total += Number(this[i].system.quantity ?? 0) * Number(this[i].system.cost ?? 0);
    }
    return Math.ceil(total);
};
export default class WitcherActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    statMap = CONFIG.WITCHER.statMap;
    skillMap = CONFIG.WITCHER.skillMap;

    uniqueTypes = ['profession', 'race', 'homeland'];

    //overwrite in sub-classes
    configuration = undefined;

    /** @override */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
        id: "actor-sheet-{id}",
        tagName: 'form',
        window: {
            resizable: true,
            vertical: false
        },
        position: {
            width: 800
        },
        classes: ['witcher', 'sheet', 'actor'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    });

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        // Fix broken or old image paths for Actors
        let imgPath = this.actor.img || "";
        
        // Handle legacy path migration from Italian version
        if (imgPath.includes('assets/optimized/')) {
            imgPath = imgPath.replace(/assets\/optimized\/images\/monsters\//, 'assets/BESTIARIO/MOSTRI/')
                         .replace(/assets\/optimized\/images\/characters\//, 'assets/CORE/characters/')
                         .replace(/\/optimized\//, '/CORE/');
        }

        // Ensure path remains relative to Foundry system folder if needed, 
        // but often images are relative to Data root.
        context.actorImg = imgPath;

        context.useAdrenaline = game.settings.get('TheWitcherItaNewSystem', 'useOptionalAdrenaline');
        context.displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');
        context.useVerbalCombat = game.settings.get('TheWitcherItaNewSystem', 'useOptionalVerbalCombat');
        context.displayRep = game.settings.get('TheWitcherItaNewSystem', 'displayRep');

        context.config = CONFIG.WITCHER;
        CONFIG.Combat.initiative.formula = '1d10 + @stats.ref.value' + (context.displayRollDetails ? '[REF]' : '');

        context.actor = this.actor;
        context.system = foundry.utils.deepClone(this.actor.system);

        // Apply temporary panel state (for non-editable documents like locked compendiums)
        if (this._tempPannels) {
            for (const [path, value] of Object.entries(this._tempPannels)) {
                foundry.utils.setProperty(context.system, path.replace('system.', ''), value);
            }
        }

        context.systemFields = this.document.system.schema.fields;
        context.items = context.actor.items.filter(i => !i.system.isStored).sort((a, b) => a.sort - b.sort);

        context.system.combatEffects.temporaryEffects.temporaryHpSum =
            context.system.combatEffects.temporaryEffects.temporaryHp.reduce((acc, temp) => acc + temp.value, 0);

        this._prepareGeneralInformation(context);
        this._prepareCustomSkills(context);
        this._prepareWeapons(context);
        this._prepareArmor(context);
        this._prepareSpells(context);
        this._prepareItems(context);
        this._prepareCritWounds(context);

        // Prepare active effects for easier access
        let temporaryItemImprovements = context.items
            .map(item => item.effects.filter(effect => effect.isAppliedTemporaryItemImprovement))
            .flat();

        context.effects = this.prepareActiveEffectCategories(
            Array.from(this.actor.allApplicableEffects()).concat(temporaryItemImprovements)
        );

        context.isGM = game.user.isGM;
        return context;
    }

    async _renderConfigureDialog() {
        this.configuration?.render(true);
    }

    _prepareCustomSkills(context) {
        let customSkills = this.actor.items.filter(item => item.type === 'skill');

        var filteredStats = Object.keys(CONFIG.WITCHER.statMap).reduce(function (stats, index) {
            if (CONFIG.WITCHER.statMap[index].origin === 'stats') {
                stats.push(CONFIG.WITCHER.statMap[index].name);
            }
            return stats;
        }, []);

        context.customSkills = {};
        filteredStats.forEach(stat => {
            context.customSkills[stat] = customSkills.filter(skill => skill.system.attribute === stat);
        });
    }

    _prepareGeneralInformation(context) {
        let actor = context.actor;

        context.oldNotes = actor.getList('note');
        context.notes = actor.system.notes;
    }

    _prepareSpells(context) {
        const spells = context.actor.getList('spell');
        const rituals = context.actor.getList('ritual');
        const hexes = context.actor.getList('hex');

        // 1. Spells (Incantesimi)
        context.noviceSpells = spells.filter(s => s.system.level === 'novice' && (s.system.class === 'Spells' || s.system.class === 'Mage' || s.system.class === 'Necromanzia'));
        context.journeymanSpells = spells.filter(s => (s.system.level === 'journeyman' || (s.system.class === 'Necromanzia' && !s.system.level && s.name.includes("Cadavere"))) && (s.system.class === 'Spells' || s.system.class === 'Mage' || s.system.class === 'Necromanzia'));
        context.masterSpells = spells.filter(s => (s.system.level === 'master' || (s.system.class === 'Necromanzia' && !s.system.level && s.name.includes("Anime"))) && (s.system.class === 'Spells' || s.system.class === 'Mage' || s.system.class === 'Necromanzia'));

        // 2. Invocations (Invocazioni)
        context.noviceInvocations = spells.filter(s => s.system.level === 'novice' && s.system.class === 'Invocations');
        context.journeymanInvocations = spells.filter(s => s.system.level === 'journeyman' && s.system.class === 'Invocations');
        context.masterInvocations = spells.filter(s => s.system.level === 'master' && s.system.class === 'Invocations');

        // 3. Witcher Signs (Segni)
        context.noviceSigns = spells.filter(s => s.system.level === 'novice' && s.system.class === 'Witcher');
        context.journeymanSigns = spells.filter(s => s.system.level === 'journeyman' && s.system.class === 'Witcher');
        context.masterSigns = spells.filter(s => s.system.level === 'master' && s.system.class === 'Witcher');

        // 4. Rituals (Rituali)
        context.rituals = rituals.filter(r => r.system.class === 'ritual' || !r.system.class || r.system.class === 'Goetia' || r.system.class === 'Necromanzia');

        // 5. Hexes (Fatture)
        context.hexes = hexes.filter(h => h.system.class === 'hex' || !h.system.class);

        // 6. Magical Gift (Doni Magici)
        context.magicalgift = spells.filter(s => s.system.class === 'MagicalGift');

        // 9. Curses (Maledizioni)
        context.curses = hexes.filter(h => h.system.class === 'Curses');
    }

    /**
     * Organize and classify Items for Character sheets.
     */
    _prepareItems(context) {
        let items = context.items;

        context.enhancements = items.filter(i => i.type == 'enhancement' && !i.system.applied);
        context.runeItems = context.enhancements.filter(e => e.system.type == 'rune');
        context.glyphItems = context.enhancements.filter(e => e.system.type == 'glyph');
        context.containers = items.filter(i => i.type == 'container');

        context.totalWeight = context.actor.getTotalWeight();
        context.totalCost = context.items.cost();
    }

    _prepareWeapons(context) {
        context.weapons = context.items.filter(function (item) {
            return (
                item.type == 'weapon' ||
                (item.type == 'enhancement' && item.system.type == 'weapon' && item.system.applied == false)
            );
        });

        context.weapons.forEach(weapon => {
            if (
                weapon.system.enhancements > 0 &&
                weapon.system.enhancements != weapon.system.enhancementItemIds.length
            ) {
                let newEnhancementList = [];
                let enhancementItems = weapon.system.enhancementItems ?? [];
                for (let i = 0; i < weapon.system.enhancements; i++) {
                    let element = enhancementItems[i];
                    if (element) {
                        newEnhancementList.push(element);
                    } else {
                        newEnhancementList.push({});
                    }
                }
                let item = context.actor.items.get(weapon._id);
                item.system.enhancementItems = newEnhancementList;
            }
        });
    }

    _prepareArmor(context) {
        context.armors = context.items.filter(function (item) {
            return (
                item.type == 'armor' ||
                (item.type == 'enhancement' && item.system.type == 'armor' && item.system.applied == false)
            );
        });

        context.armors.forEach(armor => {
            if (armor.system.enhancements > 0 && armor.system.enhancements != armor.system.enhancementItemIds.length) {
                let newEnhancementList = [];
                let enhancementItems = armor.system.enhancementItems ?? [];
                for (let i = 0; i < armor.system.enhancements; i++) {
                    let element = enhancementItems[i];
                    if (element && JSON.stringify(element) != '{}') {
                        newEnhancementList.push(element);
                    } else {
                        newEnhancementList.push({});
                    }
                }
                let item = context.actor.items.get(armor._id);
                item.system.enhancementItems = newEnhancementList;
            }
        });
    }

    _prepareCritWounds(context) {
        let wounds = context.system.critWounds;
        if (!wounds) return;

        context.system.critWounds = wounds.map((wound) => {
            const woundData = typeof wound.toObject === 'function' ? wound.toObject() : foundry.utils.deepClone(wound);
            
            // Map 'mod' database string field to helper boolean fields for the template
            woundData.stabilized = (woundData.mod === 'stabilized' || woundData.mod === 'treated');
            woundData.treated = (woundData.mod === 'treated');
            
            const config = CONFIG.WITCHER.Crit[woundData.configEntry];
            if (config) {
                woundData.description = config.description;
                woundData.effect = config.effect?.[woundData.mod] || config.effect?.['none'];
            }
            return woundData;
        });
    }

    /** @override */
    _prepareUpdateData(updateData) {
        // Intercetta e raggruppa gli aggiornamenti alle ferite critiche inseriti tramite form
        const critWoundsUpdates = {};
        for (const [key, value] of Object.entries(updateData)) {
            const match = key.match(/^system\.critWounds\.(\d+)\.(.*)$/);
            if (match) {
                const index = parseInt(match[1]);
                const prop = match[2];
                if (!critWoundsUpdates[index]) critWoundsUpdates[index] = {};
                critWoundsUpdates[index][prop] = value;
                delete updateData[key];
            }
        }

        if (Object.keys(critWoundsUpdates).length > 0) {
            const currentWounds = foundry.utils.deepClone(this.actor.system.critWounds || []);
            
            for (const [index, woundUpdate] of Object.entries(critWoundsUpdates)) {
                const wound = currentWounds[index];
                if (!wound) continue;

                // Applica i campi modificati
                if ('configEntry' in woundUpdate) {
                    // Se cambia il tipo, resetta stato e progresso
                    if (woundUpdate.configEntry !== wound.configEntry) {
                        wound.configEntry = woundUpdate.configEntry;
                        wound.mod = 'none';
                        wound.healingTime = 0;
                        wound.daysHealed = 0;
                    }
                }
                if ('location' in woundUpdate) wound.location = woundUpdate.location;
                if ('daysHealed' in woundUpdate) wound.daysHealed = Number(woundUpdate.daysHealed) || 0;
                if ('healingTime' in woundUpdate) wound.healingTime = Number(woundUpdate.healingTime) || 0;
                if ('notes' in woundUpdate) wound.notes = woundUpdate.notes;

                // Mappa i checkbox stabilized e treated a 'mod'
                if ('stabilized' in woundUpdate || 'treated' in woundUpdate) {
                    const isStabilized = 'stabilized' in woundUpdate ? woundUpdate.stabilized : (wound.mod === 'stabilized' || wound.mod === 'treated');
                    const isTreated = 'treated' in woundUpdate ? woundUpdate.treated : (wound.mod === 'treated');

                    if (isTreated) {
                        wound.mod = 'treated';
                    } else if (isStabilized) {
                        wound.mod = 'stabilized';
                    } else {
                        wound.mod = 'none';
                    }
                }
            }

            updateData['system.critWounds'] = currentWounds;
        }

        return super._prepareUpdateData(updateData);
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        this.activateListeners(this.element);
    }

    activateListeners(html) {
        let jquery = $(html);
        jquery.find('.life-event-display').on('click', this._onLifeEventDisplay.bind(this));

        jquery.find('.init-roll').on('click', this._onInitRoll.bind(this));
        jquery.find('.crit-roll').on('click', this._onCritRoll.bind(this));
        jquery.find('.recover-sta').on('click', this._onRecoverSta.bind(this));
        jquery.find('.verbal-button').on('click', this._onVerbalCombat.bind(this));

        jquery.find('input').focusin(event => event.currentTarget.select());

        jquery.find('.configure-actor').on('click', this._renderConfigureDialog.bind(this));

        //mixins
        this.statListener(html);
        this.skillListener(html);
        this.skillModifierListener(html);
        this.customSkillListener(html);

        this.itemListener(html);
        this.activeEffectListener(html);

        this.deathSaveListener(html);
        this.criticalWoundListener(html);
        this.noteListener(html);
        this.healListeners(html);
        this.progressionListener(html);

        this.itemContextMenu(html);
    }

    async _onInitRoll(event) {
        console.log("WITCHER TRPG | WitcherActorSheet._onInitRoll triggered!", { event });
        const hasActiveCombat = !!game.combat;
        const token = this.actor.token ?? this.actor.getActiveTokens()[0];

        if (hasActiveCombat && token) {
            await this.actor.rollInitiative({ createCombatants: true, rerollInitiative: true });
        } else {
            const refVal = this.actor.system.stats.ref.value || 0;
            const rollFormula = `1d10 + ${refVal}`;
            const roll = await new Roll(rollFormula).evaluate();

            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: `<h2>${game.i18n.localize('WITCHER.Actor.Initiative')}</h2>`
            });
        }
    }

    async _onCritRoll(event) {
        let rollResult = await new Roll('1d10x10').evaluate();
        let messageData = new ChatMessageData(this.actor);
        rollResult.toMessage(messageData);
    }

    async _onRecoverSta(event) {
        const DialogV2 = foundry.applications.api.DialogV2;

        await new DialogV2({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.staDialog')}` },
            modal: true,
            buttons: [
                {
                    action: 'Recovery Action',
                    label: `${game.i18n.localize('WITCHER.Dialog.recoveryAction')}`,
                    callback: async () => {
                        if (this.actor.system.derivedStats.sta.value >= this.actor.system.derivedStats.sta.max) {
                            ui.notifications.info(game.i18n.localize('WITCHER.Dialog.fullStaInfo'));
                            return;
                        }
                        this.actor.update({
                            'system.derivedStats.sta.value':
                                this.actor.system.derivedStats.sta.value + this.actor.system.derivedStats.rec.value
                        });
                    }
                },
                {
                    action: 'Full Recovery',
                    label: `${game.i18n.localize('WITCHER.Dialog.fullRecovery')}`,
                    callback: async () => {
                        if (this.actor.system.derivedStats.sta.value >= this.actor.system.derivedStats.sta.max) {
                            ui.notifications.info(game.i18n.localize('WITCHER.Dialog.fullStaInfo'));
                            return;
                        }
                        this.actor.update({ 'system.derivedStats.sta.value': this.actor.system.derivedStats.sta.max });
                    }
                }
            ]
        }).render({ force: true });
    }

    async _onVerbalCombat() {
        this.actor.verbalCombat();
    }

    _onLifeEventDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.life-events-card');
        this.actor.update({
            [`system.general.lifeEvents.${section.dataset.event}.isOpened`]: !this.actor.system.general.lifeEvents.find(
                event => event.key === section.dataset.event
            ).isOpened
        });
    }
}

Object.assign(WitcherActorSheet.prototype, statMixin);
Object.assign(WitcherActorSheet.prototype, skillMixin);
Object.assign(WitcherActorSheet.prototype, skillModifierMixin);
Object.assign(WitcherActorSheet.prototype, customSkillMixin);

Object.assign(WitcherActorSheet.prototype, itemMixin);
Object.assign(WitcherActorSheet.prototype, activeEffectMixin);

Object.assign(WitcherActorSheet.prototype, deathsaveMixin);
Object.assign(WitcherActorSheet.prototype, criticalWoundMixin);
Object.assign(WitcherActorSheet.prototype, noteMixin);
Object.assign(WitcherActorSheet.prototype, healMixin);
Object.assign(WitcherActorSheet.prototype, progressionSheetMixin);

Object.assign(WitcherActorSheet.prototype, itemContextMenu);
