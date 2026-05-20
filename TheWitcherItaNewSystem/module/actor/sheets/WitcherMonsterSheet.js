import WitcherMonsterConfigurationSheet from './configurations/WitcherMonsterConfigurationSheet.js';
import WitcherActorSheet from './WitcherActorSheet.js';

const { DialogV2 } = foundry.applications.api;

/**
 * Monster sheet implementation for ApplicationV2.
 */
export default class WitcherMonsterSheet extends WitcherActorSheet {

    /** @override */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
        classes: ['witcher', 'sheet', 'actor', 'monster', 'monster-v2'],
        window: {
            vertical: false
        },
        position: {
            width: 1150,
            height: 680
        },
        actions: {
            exportLoot:       function(event, target) { return this._onExportLoot(event, target); },
            rollStat:         function(event, target) { return this._onRollStat(event, target); },
            rollSkill:        function(event, target) { return this._onRollSkill(event, target); },
            rollCustomSkill:  function(event, target) { return this._onRollCustomSkill(event, target); },
            rollInit:         function(event, target) { return this._onInitRoll(event, target); },
            toggleDeathState: function(event, target) { return this._onToggleDeathState(event, target); },
            createNote:       function(event, target) { return this._onCreateNote(event, target); },
            deleteNote:       function(event, target) { return this._onDeleteNote(event, target); }
        }
    });

    /** @override */
    static PARTS = {
        sidebar: { template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/sidebar.hbs' },
        header:  { template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/header.hbs' },
        stats:   { template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/stats.hbs' },
        tabs:    { template: 'templates/generic/tab-navigation.hbs' },
        skills:  {
            template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/tabs/tab-skills.hbs',
            scrollable: ['']
        },
        inventory: {
            template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/tabs/tab-inventory.hbs',
            scrollable: ['']
        },
        details: {
            template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/tabs/tab-details.hbs',
            scrollable: ['']
        },
        spells: {
            template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/tabs/tab-spells.hbs',
            scrollable: ['']
        },
        effects: {
            template: 'systems/TheWitcherItaNewSystem/templates/sheets/actor/monster/tabs/tab-effects.hbs',
            scrollable: ['']
        }
    };

    /** @override */
    static TABS = {
        primary: {
            tabs: [
                { id: 'skills',    label: 'WITCHER.Actor.tabs.skills',    icon: 'fas fa-list-ul' },
                { id: 'inventory', label: 'WITCHER.Actor.tabs.inventory',  icon: 'fas fa-backpack' },
                { id: 'details',   label: 'WITCHER.Actor.tabs.stats',      icon: 'fas fa-book-open' },
                { id: 'spells',    label: 'WITCHER.Actor.tabs.magic',      icon: 'fas fa-magic' },
                { id: 'effects',   label: 'WITCHER.Actor.tabs.effects',    icon: 'fas fa-sparkles' }
            ],
            initial: 'skills',
            labelPrefix: ''
        }
    };

    /** @override */
    configuration = new WitcherMonsterConfigurationSheet({ document: this.actor });

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        
        // Use monster-specific labels for Luck -> Focus
        context.config = foundry.utils.deepClone(context.config || CONFIG.WITCHER);
        if (context.config.statMap?.luck) {
            context.config.statMap.luck.label = "WITCHER.Actor.DerStat.Focus";
            context.config.statMap.luck.labelShort = "WITCHER.Actor.DerStat.Focus";
            
            // Map Focus value to Luck stat for monsters to ensure visibility in the stats grid
            if (context.system.stats.luck) {
                context.system.stats.luck.value = context.system.derivedStats.focus.value || context.system.derivedStats.focus.unmodifiedMax;
                context.system.stats.luck.max = context.system.derivedStats.focus.unmodifiedMax;
            }
        }

        this._prepareLoot(context);
        this._prepareAbilities(context);
        this._prepareCharacterData(context);
        context.tabs = this._prepareTabs('primary');
        return context;
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);

        // Prevent Enter key from submitting the form
        this.element.querySelectorAll('input').forEach(input => {
            if (input._hasWitcherEnterHandler) return;
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
            input._hasWitcherEnterHandler = true;
        });

        // Restructure window-content into sidebar + main-wrapper columns.
        // Mirrors the approach of WitcherCharacterSheet to avoid CSS-grid
        // instability on .window-content (Foundry forces flex, overriding grid).
        const content = this.element.querySelector('.window-content');
        if (!content || content.querySelector('.monster-main-wrapper')) return;
        const sidebar = content.querySelector('[data-application-part="sidebar"]');
        if (!sidebar) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'monster-main-wrapper';
        Array.from(content.children).forEach(child => {
            if (child !== sidebar && !child.classList.contains('monster-main-wrapper')) {
                wrapper.appendChild(child);
            }
        });
        content.appendChild(wrapper);
    }


    _prepareCharacterData(context) {
        let actor = context.actor;
        context.profession = actor.getList('profession')[0];
    }

    _prepareAbilities(context) {
        context.abilities = context.items.filter(i => i.type == 'ability');
    }

    _prepareLoot(context) {
        let items = context.items;
        context.weapons = items.filter(i => i.type == 'weapon');
        context.armors  = items.filter(i => i.type == 'armor');
        context.loots   = items.filter(i =>
            i.type == 'component'        ||
            i.type == 'crafting-material'||
            i.type == 'container'        ||
            i.type == 'enhancement'      ||
            i.type == 'valuable'         ||
            i.type == 'animal-parts'     ||
            i.type == 'diagrams'         ||
            i.type == 'alchemical'       ||
            i.type == 'mutagen'
        );
    }

    /* -------------------------------------------- */
    /*  Action Handlers                             */
    /* -------------------------------------------- */

    async _onRollStat(event, target) {
        const stat = target.dataset.stat;
        const statValue = this.actor.system.stats[stat]?.value || 0;
        const statName = `WITCHER.St${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
        const localizedStat = game.i18n.localize(statName);

        const rollFormula = `1d10 + ${statValue}`;
        const roll = await new Roll(rollFormula).evaluate({ async: true });

        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<h2>${localizedStat} Check</h2>`
        });
    }

    /**
     * Handles skill roll triggered by data-action="rollSkill".
     * Reads data-skill (skill name) from the target and looks up the skill entry
     * in CONFIG.WITCHER.skillMap to get the full roll context.
     */
    async _onRollSkill(event, target) {
        const skillName = target.dataset.skill;
        if (!skillName) {
            console.warn('WITCHER TRPG | _onRollSkill: data-skill not found on target', target);
            return;
        }
        const skillMapEntry = CONFIG.WITCHER.skillMap[skillName];
        if (!skillMapEntry) {
            console.warn('WITCHER TRPG | _onRollSkill: no skillMap entry for', skillName);
            return;
        }
        return this.actor.rollSkillCheck(skillMapEntry);
    }

    /**
     * Handles custom skill roll triggered by data-action="rollCustomSkill".
     * Reads data-item-id from the nearest ancestor with that attribute,
     * then delegates to actor.rollCustomSkillCheck (which expects event.currentTarget
     * to have a .closest('.item') with dataset.itemId).
     */
    async _onRollCustomSkill(event, target) {
        const itemRow = target.closest('[data-item-id]');
        if (!itemRow) {
            console.warn('WITCHER TRPG | _onRollCustomSkill: no [data-item-id] ancestor found', target);
            return;
        }
        // rollCustomSkillCheck expects event.currentTarget with .closest('.item')
        const fakeEvent = { currentTarget: target };
        return this.actor.rollCustomSkillCheck(fakeEvent);
    }

    async _onToggleDeathState(event, target) {
        const index = parseInt(target.dataset.index);
        const states = [...this.actor.system.deathStates];
        states[index] = !states[index];
        return this.actor.update({ "system.deathStates": states });
    }

    async _onExportLoot() {
        let content = `${game.i18n.localize('WITCHER.Loot.MultipleExport')} <input type="number" class="small" name="multiple" value=1><br />`;

        let multiplier = await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Monster.exportLoot')}` },
            content: content,
            modal: true,
            ok: {
                callback: (event, button, dialog) => button.form.elements.multiple.value
            },
            rejectClose: true
        });

        if (!multiplier) return;

        let folder = await this._getOrCreateFolder();
        let newLoot = await Actor.create({
            ...this.actor.toObject(),
            type: 'loot',
            name: this.actor.name + '--' + `${game.i18n.localize('WITCHER.Loot.Name')}`,
            folder: folder?.id
        });

        for (let item of newLoot.items) {
            let newQuantity = item.system.quantity;
            if (typeof newQuantity === 'string' && item.system.quantity.includes('d')) {
                let total = 0;
                for (let i = 0; i < multiplier; i++) {
                    let roll = await new Roll(item.system.quantity).evaluate({ async: true });
                    total += Math.ceil(roll.total);
                }
                newQuantity = total;
            } else {
                newQuantity = Number(newQuantity) * multiplier;
            }

            let itemGeneratedFromRollTable = await item.checkIfItemHasRollTable(newQuantity);

            if (!itemGeneratedFromRollTable) {
                await item.update({ 'system.quantity': newQuantity });
            }
        }

        return newLoot.sheet.render(true);
    }

    async _getOrCreateFolder() {
        let folderName = `${game.i18n.localize('WITCHER.Loot.Name')}`;
        let type = "Actor";
        let folder = game.folders.find(folder => folder.type == type && folder.name === folderName);
        if (!folder) {
            folder = await Folder.create({
                name: folderName,
                sorting: 'a',
                type: type,
                parent: null
            });
        }
        return folder;
    }

    async _onCreateNote(event, target) {
        const notes = [...(this.actor.system.notes || [])];
        notes.push({ title: "", details: "" });
        return this.actor.update({ "system.notes": notes });
    }

    async _onDeleteNote(event, target) {
        const index = parseInt(target.dataset.index);
        const notes = [...(this.actor.system.notes || [])];
        notes.splice(index, 1);
        return this.actor.update({ "system.notes": notes });
    }
}
