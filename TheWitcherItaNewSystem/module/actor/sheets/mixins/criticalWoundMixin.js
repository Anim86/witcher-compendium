
export let criticalWoundMixin = {

    async _onCriticalWoundAdd(event) {
        event.preventDefault();
        const critList = foundry.utils.deepClone(this.actor.system.critWounds || []);
        critList.push({ 
            id: foundry.utils.randomID(),
            configEntry: "",
            location: "torso",
            mod: "none",
            stabilized: false,
            treated: false,
            healingTime: 0,
            daysHealed: 0
        });
        await this.actor.update({ "system.critWounds": critList });
    },

    async _onCriticalWoundRemove(event) {
        event.preventDefault();
        const index = event.currentTarget.closest('.critwound-card').dataset.index;
        const critList = foundry.utils.deepClone(this.actor.system.critWounds);
        critList.splice(index, 1);
        await this.actor.update({ "system.critWounds": critList });
    },

    async _onCritWoundDisplayInfo(event) {
        event.preventDefault();
        event.stopPropagation();
        let section = event.currentTarget.closest('.critwound-card');
        let editor = $(section).find('.critwound-details');
        editor.toggleClass('invisible');
    },

    async _onCritWoundUpdate(event) {
        const input = event.currentTarget;
        const index = input.closest('.critwound-card').dataset.index;
        const critList = foundry.utils.deepClone(this.actor.system.critWounds);
        const wound = critList[index];
        
        // Update the state in our local clone
        if (input.type === 'checkbox') {
            const prop = input.name.split('.').pop();
            wound[prop] = input.checked;
        }

        // Automatic healing time calculation when stabilized
        if (input.name.endsWith('.stabilized') && input.checked) {
            const config = CONFIG.WITCHER.Crit[wound.configEntry];
            const severity = config?.severity;
            const fis = this.actor.system.stats.body.value;
            
            if (severity && severity !== 'deadly') {
                wound.healingTime = this._getHealingTime(fis, severity);
            }
        }
        
        await this.actor.update({ "system.critWounds": critList });
    },

    _getHealingTime(fis, severity) {
        const table = {
            simple: [5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 1],
            complex: [9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1],
            difficult: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
        };
        // Fisico 3-13 mappato su index 0-10
        const fisIndex = Math.min(Math.max(fis, 3), 13) - 3;
        return table[severity]?.[fisIndex] || 0;
    },

    criticalWoundListener(html) {
        html = $(html);
        html.find(".add-crit-wound").on("click", this._onCriticalWoundAdd.bind(this));
        html.find(".delete-crit-wound").on("click", this._onCriticalWoundRemove.bind(this));
        html.find('.critwound-display').on('click', this._onCritWoundDisplayInfo.bind(this));
        html.find(".premium-checkbox input[type='checkbox']").on("change", this._onCritWoundUpdate.bind(this));
    }

}