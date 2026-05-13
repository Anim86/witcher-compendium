export let progressionMixin = {
    /**
     * Spend Improvement Points (PI) to upgrade a skill or stat.
     * @param {string} type - 'skill', 'stat', or 'professionSkill'
     * @param {string} key - The key of the skill or stat
     * @param {Object} options - Additional options
     */
    async spendIP(type, key, options = {}) {
        const currentIP = Number(this.system.general?.improvementPoints) || 0;
        let cost = 0;
        let updatePath = "";
        let currentValue = 0;
        let label = "";
        let updateTarget = this; // Default to actor

        if (type === 'skill') {
            const skill = this.getSkillData(key);
            if (!skill) return;
            currentValue = Number(skill.value) || 0;
            
            if (currentValue >= 10) {
                return ui.notifications.warn(game.i18n.localize('WITCHER.Progression.SkillCapReached'));
            }

            const multiplier = skill.cost === 2 ? 2 : 1;
            // Cost is equal to current level (minimum 1) * multiplier
            cost = currentValue === 0 ? 1 * multiplier : currentValue * multiplier;
            
            // Special rule: cost to level 1 for difficult skills is 2 PI
            if (currentValue === 0 && multiplier === 2) cost = 2;
            
            updatePath = `system.skills.${skill.stat}.${key}.value`;
            label = game.i18n.localize(skill.label);
        } else if (type === 'stat') {
            const stat = this.system.stats[key];
            if (!stat) return;
            currentValue = Number(stat.unmodifiedMax || stat.max || 0);

            if (currentValue >= 10) {
                return ui.notifications.warn(game.i18n.localize('WITCHER.Progression.StatCapReached'));
            }

            cost = currentValue * 10;
            updatePath = `system.stats.${key}.unmodifiedMax`;
            label = game.i18n.localize(CONFIG.WITCHER.statMap[key].label);
        } else if (type === 'professionSkill') {
            const profession = this.getList('profession')[0];
            if (!profession) return;
            updateTarget = profession;
            
            const skillInfo = this.findSkillWithName(key);
            if (!skillInfo) return;
            
            currentValue = Number(skillInfo.skill.level) || 0;
            if (currentValue >= 10) {
                return ui.notifications.warn(game.i18n.localize('WITCHER.Progression.SkillCapReached'));
            }

            // Check profession branch requirements
            if (skillInfo.path.includes('skill2')) {
                const pathKey = skillInfo.path.split('.')[0];
                const prevSkill = profession.system[pathKey].skill1;
                if (Number(prevSkill.level) < 5) {
                    return ui.notifications.warn(game.i18n.localize('WITCHER.Progression.BranchRequirementNotMet'));
                }
            } else if (skillInfo.path.includes('skill3')) {
                const pathKey = skillInfo.path.split('.')[0];
                const prevSkill = profession.system[pathKey].skill2;
                if (Number(prevSkill.level) < 5) {
                    return ui.notifications.warn(game.i18n.localize('WITCHER.Progression.BranchRequirementNotMet'));
                }
            }

            // Profession skills cost equal to current level (min 1)
            cost = currentValue === 0 ? 1 : currentValue;
            updatePath = `system.${skillInfo.path}.level`;
            label = skillInfo.skill.skillName;
        }

        if (currentIP < cost) {
            return ui.notifications.error(game.i18n.format('WITCHER.Progression.NotEnoughIP', { cost, currentIP }));
        }

        const confirm = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize('WITCHER.Progression.ConfirmTitle') },
            content: `<p>${game.i18n.format('WITCHER.Progression.ConfirmSpend', { cost, label })}</p>`,
            rejectClose: false
        });

        if (confirm) {
            const updates = { [updatePath]: currentValue + 1 };
            await updateTarget.update(updates);
            await this.update({ 'system.general.improvementPoints': currentIP - cost });
            ui.notifications.info(game.i18n.format('WITCHER.Progression.Success', { label }));
        }
    },

    getSkillData(skillKey) {
        // Helper to find skill in the nested structure
        for (const statGroup in this.system.skills) {
            if (this.system.skills[statGroup][skillKey]) {
                const skill = this.system.skills[statGroup][skillKey];
                return {
                    ...skill,
                    stat: statGroup,
                    cost: CONFIG.WITCHER.skillMap[skillKey]?.cost || 1
                };
            }
        }
        return null;
    }
};
