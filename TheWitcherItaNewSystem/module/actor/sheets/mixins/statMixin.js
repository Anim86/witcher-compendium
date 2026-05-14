import { extendedRoll } from '../../../scripts/rolls/extendedRoll.js';
import { RollConfig } from '../../../scripts/rollConfig.js';
import ChatMessageData from '../../../chatMessage/chatMessageData.js';

export let statMixin = {
    _onStatModifierDisplay(event) {
        event.preventDefault();
        const statDisplay = event.currentTarget.closest('.stat-display') || event.currentTarget.closest('.config-stat-row');
        const stat = event.currentTarget.dataset.stat || statDisplay?.dataset.stat;
        const type = event.currentTarget.dataset.type || statDisplay?.dataset.type;

        let key = "";
        if (stat === 'toxicity') {
            key = `system.stats.${stat}.isOpened`;
        } else if (stat === 'reputation' || type === 'reputation') {
            key = `system.reputation.isOpened`;
        } else {
            const origin = this.statMap?.[stat]?.origin || (type === 'stats' ? 'stats' : 'derivedStats');
            key = `system.${origin}.${stat}.isOpened`;
        }

        const currentState = foundry.utils.getProperty(this.actor, key);
        if (this.isEditable) {
            this.actor.update({ [key]: !currentState });
        } else {
            this._tempPannels = this._tempPannels || {};
            this._tempPannels[key] = !currentState;
            this.render();
        }
    },

    async _onEditStatModifier(event) {
        event.preventDefault();
        const currentTarget = event.currentTarget;
        const modifierItem = currentTarget.closest('.modifier-item');
        const statDisplay = currentTarget.closest('.stat-display') || currentTarget.closest('.config-stat-row');
        
        const stat = currentTarget.dataset.stat || modifierItem?.dataset.stat || statDisplay?.dataset.stat;
        const type = currentTarget.dataset.type || modifierItem?.dataset.type || statDisplay?.dataset.type;
        const itemId = currentTarget.dataset.id || modifierItem?.dataset.id;
        const field = currentTarget.dataset.field;
        const value = currentTarget.value;

        if (!stat || !itemId || !field) {
            console.error("Witcher TRPG | Dati mancanti per la modifica del modificatore", {stat, itemId, field, value});
            return;
        }

        let modifiers = [];
        let path = "";

        if (stat === 'reputation' || type === 'reputation') {
            modifiers = foundry.utils.deepClone(this.actor.system.reputation.modifiers);
            path = "system.reputation.modifiers";
        } else {
            const origin = this.statMap?.[stat]?.origin || (type === 'stats' ? 'stats' : 'derivedStats');
            modifiers = foundry.utils.deepClone(this.actor.system[origin][stat].modifiers);
            path = `system.${origin}.${stat}.modifiers`;
        }

        let objIndex = modifiers.findIndex(obj => obj.id == itemId);
        if (objIndex !== -1) {
            modifiers[objIndex][field] = value;
            await this.actor.update({ [path]: modifiers });
        }
    },

    async _onRemoveStatModifier(event) {
        event.preventDefault();
        const currentTarget = event.currentTarget;
        const modifierItem = currentTarget.closest('.modifier-item');
        const statDisplay = currentTarget.closest('.stat-display') || currentTarget.closest('.config-stat-row');
        
        // Cerca stat e type nei dataset, provando diverse posizioni possibili
        const stat = currentTarget.dataset.stat || modifierItem?.dataset.stat || statDisplay?.dataset.stat;
        const type = currentTarget.dataset.type || modifierItem?.dataset.type || statDisplay?.dataset.type;
        const id = currentTarget.dataset.id;
        
        if (!stat || !type || !id) {
            console.error("Witcher TRPG | Impossibile trovare stat, type o id per la rimozione del modificatore", {stat, type, id, event});
            return;
        }

        let prevModList = [];
        if (type === 'derived' || type === 'derivedStats') {
            prevModList = this.actor.system.derivedStats[stat].modifiers;
        } else if (type === 'reputation') {
            prevModList = this.actor.system.reputation.modifiers;
        } else {
            prevModList = this.actor.system.stats[stat].modifiers;
        }

        const newModList = prevModList.filter(v => v.id !== id);

        if (type === 'reputation') {
            await this.actor.update({ [`system.${type}.modifiers`]: newModList });
        } else {
            // Usa la mappa delle statistiche se disponibile, altrimenti fallback sul tipo
            const origin = this.statMap?.[stat]?.origin || (type === 'stats' ? 'stats' : 'derivedStats');
            await this.actor.update({ [`system.${origin}.${stat}.modifiers`]: newModList });
        }
    },

    /** Do not delete. This method is here to give external modules the possibility to make skill rolls. */
    async _onStatSaveRoll(event) {
        let stat = event.currentTarget.closest('.stat-display').dataset.stat;
        let statValue = stat != 'luck' ? this.actor.system.stats[stat].value : this.actor.system.stats[stat].max;
        let statName = `WITCHER.St${stat.charAt(0).toUpperCase() + stat.slice(1)}`;

        let messageData = new ChatMessageData(this.actor);
        messageData.flavor = `
        <h2>${game.i18n.localize(statName)}</h2>
        <div class="roll-summary">
            <div class="dice-formula">${game.i18n.localize('WITCHER.Chat.SaveText')} <b>${statValue}</b></div>
        </div>
        <hr />`;

        let config = new RollConfig();
        config.showCrit = true;
        config.showSuccess = true;
        config.reversal = true;
        config.threshold = statValue;
        config.thresholdDesc = statName;
        await extendedRoll(`1d10`, messageData, config);
    },

    async _onReputation(event) {
        let dialogTemplate = `
        <h1>${game.i18n.localize('WITCHER.Reputation')}</h1>`;
        if (this.actor.system.reputation.modifiers.length > 0) {
            dialogTemplate += `<label>${game.i18n.localize('WITCHER.Apply.Mod')}</label>`;
            this.actor.system.reputation.modifiers.forEach(
                mod =>
                    (dialogTemplate += `<div><input id="${mod.name.replace(/\s/g, '')}" type="checkbox" unchecked/> ${mod.name}(${mod.value})</div>`)
            );
        }

        const dialog = new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize('WITCHER.ReputationTitle') },
            content: dialogTemplate,
            buttons: [
                {
                    action: 'save',
                    label: `${game.i18n.localize('WITCHER.ReputationButton.Save')}`,
                    callback: async (event, button, instance) => {
                        let statValue = this.actor.system.reputation.value;
                        const html = $(instance.element);

                        this.actor.system.reputation.modifiers.forEach(mod => {
                            const noSpacesName = mod.name.replace(/\s/g, '');
                            if (html.find(`#${noSpacesName}`)[0].checked) {
                                statValue += Number(mod.value);
                            }
                        });

                        let messageData = new ChatMessageData(this.actor);
                        messageData.flavor = `
                <h2>${game.i18n.localize('WITCHER.ReputationTitle')}: ${game.i18n.localize('WITCHER.ReputationSave.Title')}</h2>
                <div class="roll-summary">
                  <div class="dice-formula">${game.i18n.localize('WITCHER.Chat.SaveText')}: <b>${statValue}</b></div>
                </div>
                <hr />`;

                        let config = new RollConfig();
                        config.showSuccess = true;
                        config.reversal = true;
                        config.threshold = statValue;

                        await extendedRoll(`1d10`, messageData, config);
                    }
                },
                {
                    action: 'facedown',
                    label: `${game.i18n.localize('WITCHER.ReputationButton.FaceDown')}`,
                    callback: async (event, button, instance) => {
                        let repValue = this.actor.system.reputation.value;
                        const html = $(instance.element);

                        this.actor.system.reputation.modifiers.forEach(mod => {
                            const noSpacesName = mod.name.replace(/\s/g, '');
                            if (html.find(`#${noSpacesName}`)[0].checked) {
                                repValue += Number(mod.value);
                            }
                        });

                        let messageData = new ChatMessageData(this.actor);
                        let rollFormula = `1d10 + ${Number(repValue)}[${game.i18n.localize('WITCHER.Reputation')}] + ${Number(this.actor.system.stats.will.value)}[${game.i18n.localize('WITCHER.StWill')}]`;
                        messageData.flavor = `
                <h2>${game.i18n.localize('WITCHER.ReputationTitle')}: ${game.i18n.localize('WITCHER.ReputationFaceDown.Title')}</h2>
                <div class="roll-summary">
                  <div class="dice-formula">${game.i18n.localize('WITCHER.Context.Result')}: <b>${rollFormula}</b></div>
                </div>
                <hr />`;

                        await extendedRoll(rollFormula, messageData, new RollConfig());
                    }
                }
            ]
        });
        dialog.render(true);
    },

    calc_total_stats(context) {
        let totalStats = 0;
        for (let element in context.system.stats) {
            if (element !== 'toxicity') {
                totalStats += context.system.stats[element].max;
            }
        }
        return totalStats;
    },

    async _onLuckMinus(event) {
        event.preventDefault();
        await this.actor.spendLuck(1);
    },

    async _onLuckReset(event) {
        event.preventDefault();
        await this.actor.update({ 'system.stats.luck.value': this.actor.system.stats.luck.max });
    },

    async _onAdrenalineMinus(event) {
        event.preventDefault();
        if (this.actor.system.adrenaline.value > 0) {
            await this.actor.update({ 'system.adrenaline.value': this.actor.system.adrenaline.value - 1 });
        }
    },

    async _onAdrenalinePlus(event) {
        event.preventDefault();
        await this.actor.update({ 'system.adrenaline.value': this.actor.system.adrenaline.value + 1 });
    },

    async _onToxicityReset(event) {
        event.preventDefault();
        const effectsToDelete = this.actor.effects.filter(e => e.system.toxicity > 0).map(e => e.id);

        if (effectsToDelete.length > 0) {
            await this.actor.deleteEmbeddedDocuments('ActiveEffect', effectsToDelete);
            ui.notifications.info(game.i18n.localize('WITCHER.Actor.Stat.ToxicityResetInfo'));
        } else {
            // If no alchemical effects, just ensure value is 0 (though calculateToxicity should do this)
            await this.actor.update({ 'system.stats.toxicity.value': 0 });
        }
    },

    async _onAddStatModifier(event) {
        event.preventDefault();
        const stat = event.currentTarget.dataset.stat;
        const type = event.currentTarget.dataset.type;
        
        let modifiers = [];
        let path = "";

        if (type === 'reputation') {
            modifiers = foundry.utils.deepClone(this.actor.system.reputation.modifiers || []);
            path = "system.reputation.modifiers";
        } else {
            modifiers = foundry.utils.deepClone(this.actor.system[this.statMap[stat].origin][stat].modifiers || []);
            path = `system.${this.statMap[stat].origin}.${stat}.modifiers`;
        }

        modifiers.push({ name: game.i18n.localize('WITCHER.Resources.modifiers'), value: 0, id: foundry.utils.randomID() });
        await this.actor.update({ [path]: modifiers });
    },

    statListener(html) {
        html = $(html);
        html.find('.stat-roll').on('click', this._onStatSaveRoll.bind(this));
        html.find('.reputation-roll').on('click', this._onReputation.bind(this));

        html.find('.stat-modifier-display').on('click', this._onStatModifierDisplay.bind(this));

        html.find('.delete-stat').on('click', this._onRemoveStatModifier.bind(this));
        html.find('.list-mod-edit').on('blur', this._onEditStatModifier.bind(this));

        html.find('.luck-minus').on('click', this._onLuckMinus.bind(this));
        html.find('.luck-reset').on('click', this._onLuckReset.bind(this));
        html.find('.adrenaline-minus').on('click', this._onAdrenalineMinus.bind(this));
        html.find('.adrenaline-plus').on('click', this._onAdrenalinePlus.bind(this));
        html.find('.toxicity-reset').on('click', this._onToxicityReset.bind(this));
        html.find('.add-modifier').on('click', this._onAddStatModifier.bind(this));
    }
};
