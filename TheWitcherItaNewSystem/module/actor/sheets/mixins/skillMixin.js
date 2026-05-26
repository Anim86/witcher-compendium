export let skillMixin = {
    calc_total_skills(context) {
        let totalSkills = 0;
        for (let element in context.system.skills) {
            for (let skill in context.system.skills[element]) {
                const multiplier = context.system.skills[element][skill].multiplier || 1;
                totalSkills += context.system.skills[element][skill].value * multiplier;
            }
        }
        return totalSkills;
    },

    _onSkillDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.skill');
        const skillType = section.dataset.skilltype;
        const key = `system.pannels.${skillType}IsOpen`;
        const currentState = foundry.utils.getProperty(this.actor, key);

        if (this.isEditable) {
            this.actor.update({ [key]: !currentState });
        } else {
            // Temporary toggle for non-editable sheets (e.g. locked compendiums)
            this._tempPannels = this._tempPannels || {};
            this._tempPannels[skillType] = !currentState;
            this.render();
        }
    },

    skillListener(html) {
        const jquery = $(html);
        let thisActor = this.actor;
        let skillMap = this.skillMap;

        jquery.find('.profession-roll').on('click', event => thisActor._onProfessionRoll(event));
        jquery.find('.skill-display').on('click', this._onSkillDisplay.bind(this));
    }
};
