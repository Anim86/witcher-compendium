const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Dialog for character improvement (spending Improvement Points).
 * Handles skills, stats, and magic training.
 */
export default class WitcherImprovementDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, target, options = {}) {
        super(options);
        this.actor = actor;
        this.target = target; // Can be a skill key, stat key, or magic item (Spell/Ritual/Hex)
        this.type = options.type || 'skill'; // 'skill', 'stat', 'magic'
        
        this.currentLevel = 0;
        this.targetLevel = 0;
        this.multiplier = 1;
        
        this._initializeTarget();
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["witcher", "improvement-dialog", "standard-dialog"],
        position: { width: 450, height: "auto" },
        actions: {
            increaseTarget: WitcherImprovementDialog.#increaseTarget,
            decreaseTarget: WitcherImprovementDialog.#decreaseTarget,
            confirmUpgrade: WitcherImprovementDialog.#confirmUpgrade,
            payIp: WitcherImprovementDialog.#payIp,
            doTraining: WitcherImprovementDialog.#doTraining
        }
    };

    static PARTS = {
        main: {
            template: "systems/TheWitcherItaNewSystem/templates/app/improvement-dialog.hbs"
        }
    };

    get title() {
        return game.i18n.localize("WITCHER.Progression.Title");
    }

    _initializeTarget() {
        if (this.type === 'stat') {
            const stat = this.actor.system.stats[this.target];
            this.currentLevel = stat.unmodifiedMax || stat.max || 0;
            this.targetLevel = this.currentLevel;
            this.multiplier = 10;
        } else if (this.type === 'skill') {
            if (this.options.isProfession) {
                const profession = this.actor.getList('profession')[0];
                this.professionItem = profession;
                const path = this.options.path;
                const index = this.options.index;
                const skillData = path === 'definingSkill' 
                    ? profession.system.definingSkill 
                    : profession.system[path][index];
                
                this.currentLevel = skillData.level || 0;
                this.targetLevel = this.currentLevel;
                this.multiplier = 1; // Profession skills cost 1 PI per level (standard)
            } else {
                const skill = this._getSkillData(this.target);
                this.currentLevel = skill.value || 0;
                this.targetLevel = this.currentLevel;
                this.multiplier = skill.cost || 1;
            }
        } else if (this.type === 'magic') {
            // Target is an Item (Spell/Ritual/Hex)
            const item = this.target;
            this.isMagic = true;
            this.magicLevel = item.system.level?.toLowerCase() || 'novice';
            const rules = CONFIG.WITCHER.progression.magic[this.magicLevel] || CONFIG.WITCHER.progression.magic.novice;
            this.magicRules = rules;
        }
    }

    _getSkillData(skillKey) {
        for (const statGroup in this.actor.system.skills) {
            if (this.actor.system.skills[statGroup][skillKey]) {
                const skill = this.actor.system.skills[statGroup][skillKey];
                return {
                    ...skill,
                    cost: CONFIG.WITCHER.skillMap[skillKey]?.cost || 1
                };
            }
        }
        return {};
    }

    async _prepareContext(options) {
        const standardIp = this.actor.system.improvementPoints || 0;
        const magicIp = this.actor.system.magic?.magicImprovementPoints || 0;
        const isMagicTarget = this._isMagicTarget();

        const context = {
            type: this.type,
            isMagic: this.type === 'magic',
            label: this._getTargetLabel(),
            img: this._getTargetImg(),
            availableIp: isMagicTarget ? (standardIp + magicIp) : standardIp
        };

        if (this.type === 'magic') {
            const item = this.target;
            context.daysSpent = item.system.daysSpent || 0;
            context.totalDays = this.magicRules.days;
            context.successesAccumulated = item.system.successesAccumulated || 0;
            context.totalSuccesses = this.magicRules.successes;
            context.ipPaid = item.system.ipPaid || false;
            context.cost = this.magicRules.ip;
            context.dc = this.magicRules.dc;
            context.progress = Math.min(100, (context.successesAccumulated / context.totalSuccesses) * 100);
            context.isComplete = context.successesAccumulated >= context.totalSuccesses;
            context.typeLabel = `TYPES.Item.${item.type}`;
        } else {
            context.currentLevel = this.currentLevel;
            context.targetLevel = this.targetLevel;
            context.minTarget = this.currentLevel;
            context.maxTarget = 10;
            context.totalCost = this._calculateTotalCost();
            context.typeLabel = this.type === 'stat' ? 'WITCHER.Actor.StatTitle.Attributes' : 'WITCHER.Actor.tabs.skills';
            context.requirementError = this._checkRequirements();
        }

        return context;
    }

    _getTargetLabel() {
        if (this.type === 'stat') {
            return game.i18n.localize(CONFIG.WITCHER.statMap[this.target]?.label || this.target);
        } else if (this.type === 'skill') {
            if (this.options.isProfession) return this.target; // The name is passed as target
            return game.i18n.localize(CONFIG.WITCHER.skillMap[this.target]?.label || this.target);
        } else if (this.type === 'magic') {
            return this.target.name;
        }
    }

    _getTargetImg() {
        if (this.type === 'magic') return this.target.img;
        if (this.type === 'skill' && this.options.isProfession) return "icons/svg/book.svg";
        return "icons/svg/upgrade.svg";
    }

    _isMagicTarget() {
        if (this.type === 'magic') return true;
        if (this.type === 'skill') {
            if (this.options.isProfession) {
                const profession = this.actor.getList('profession')[0];
                const path = this.options.path;
                const index = this.options.index;
                const skillData = path === 'definingSkill' 
                    ? profession.system.definingSkill 
                    : profession.system[path][index];
                return !!skillData.isMagic;
            } else {
                const skill = this._getSkillData(this.target);
                return !!skill.isMagic;
            }
        }
        return false;
    }

    _calculateTotalCost() {
        let total = 0;
        for (let i = this.currentLevel; i < this.targetLevel; i++) {
            const levelCost = i === 0 ? 1 : i;
            total += levelCost * this.multiplier;
        }
        return total;
    }

    _checkRequirements() {
        if (this.type !== 'skill' || !this.options.isProfession) return null;
        if (this.options.path === 'definingSkill') return null;

        const path = this.options.path;
        const index = this.options.index;
        const profession = this.professionItem;

        if (index === 'skill2') {
            const skill1 = profession.system[path].skill1;
            if ((skill1.level || 0) < 5) return "WITCHER.Progression.BranchRequirementNotMet";
        } else if (index === 'skill3') {
            const skill2 = profession.system[path].skill2;
            if ((skill2.level || 0) < 5) return "WITCHER.Progression.BranchRequirementNotMet";
        }

        return null; 
    }

    static #increaseTarget(event, target) {
        if (this.targetLevel < 10) {
            this.targetLevel++;
            this.render();
        }
    }

    static #decreaseTarget(event, target) {
        if (this.targetLevel > this.currentLevel) {
            this.targetLevel--;
            this.render();
        }
    }

    static async #confirmUpgrade(event, target) {
        const cost = this._calculateTotalCost();
        const standardIp = this.actor.system.improvementPoints || 0;
        const magicIp = this.actor.system.magic?.magicImprovementPoints || 0;
        const isMagicTarget = this._isMagicTarget();
        
        const totalAvailable = isMagicTarget ? (standardIp + magicIp) : standardIp;

        if (totalAvailable < cost) return;

        let newStandardIp = standardIp;
        let newMagicIp = magicIp;

        if (isMagicTarget) {
            // Prioritize Magic IP
            if (newMagicIp >= cost) {
                newMagicIp -= cost;
            } else {
                const remainder = cost - newMagicIp;
                newMagicIp = 0;
                newStandardIp -= remainder;
            }
        } else {
            newStandardIp -= cost;
        }

        const actorUpdates = {
            'system.improvementPoints': newStandardIp,
            'system.magic.magicImprovementPoints': newMagicIp
        };

        if (this.type === 'stat') {
            const updatePath = `system.stats.${this.target}.unmodifiedMax`;
            actorUpdates[updatePath] = this.targetLevel;
            await this.actor.update(actorUpdates);
        } else if (this.type === 'skill') {
            if (this.options.isProfession) {
                const path = this.options.path;
                const index = this.options.index;
                const updatePath = path === 'definingSkill' 
                    ? `system.definingSkill.level` 
                    : `system.${path}.${index}.level`;
                
                await this.professionItem.update({ [updatePath]: this.targetLevel });
                await this.actor.update(actorUpdates);
            } else {
                const skillData = this._getSkillData(this.target);
                const updatePath = `system.skills.${skillData.stat}.${this.target}.value`;
                actorUpdates[updatePath] = this.targetLevel;
                await this.actor.update(actorUpdates);
            }
        }
        ui.notifications.info(game.i18n.format("WITCHER.Progression.Success", { label: this._getTargetLabel() }));
        this.close();
    }

    static async #payIp(event, target) {
        const item = this.target;
        const cost = this.magicRules.ip;
        const availableIp = this.actor.system.improvementPoints || 0;
        const availableMagicIp = this.actor.system.magic?.magicImprovementPoints || 0;

        const totalAvailable = availableIp + availableMagicIp;
        if (totalAvailable < cost) {
            return ui.notifications.error(game.i18n.format("WITCHER.Progression.NotEnoughIP", { cost, available: totalAvailable }));
        }

        // Deduct from Magic IP first
        let newMagicIp = availableMagicIp;
        let newGeneralIp = availableIp;

        if (availableMagicIp >= cost) {
            newMagicIp -= cost;
        } else {
            const remainder = cost - availableMagicIp;
            newMagicIp = 0;
            newGeneralIp -= remainder;
        }

        await this.actor.update({
            'system.improvementPoints': newGeneralIp,
            'system.magic.magicImprovementPoints': newMagicIp
        });

        await item.update({ 'system.ipPaid': true });
        this.render();
    }

    static async #doTraining(event, target) {
        const item = this.target;
        const skillKey = item.system.getUsedSkill().name; // This depends on Phase 1 logic or SpellData methods
        
        // Execute the roll
        const roll = await this.actor.rollSkill(skillKey, { skipDialog: true });
        const success = roll.total >= this.magicRules.dc;

        const updates = {
            'system.daysSpent': (item.system.daysSpent || 0) + 1
        };

        if (success) {
            updates['system.successesAccumulated'] = (item.system.successesAccumulated || 0) + 1;
            ui.notifications.info(game.i18n.localize("WITCHER.Progression.TrainingSuccess"));
        } else {
            ui.notifications.warn(game.i18n.localize("WITCHER.Progression.TrainingFailed"));
        }

        await item.update(updates);

        if (updates.successesAccumulated >= this.magicRules.successes) {
            await item.update({ 'system.isLearned': true });
            ui.notifications.info(game.i18n.format("WITCHER.Progression.TrainingComplete", { label: item.name }));
            this.close();
        } else {
            this.render();
        }
    }
}
