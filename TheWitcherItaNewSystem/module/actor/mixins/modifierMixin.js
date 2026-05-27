export let modifierMixin = {
    getAllModifiers(checkedStat) {
        let woundModifiers = this.getWoundModifier(this.system.critWounds, checkedStat);

        let raceModifiers = 0;
        let raceItem = this.items?.find(i => i.type === 'race');
        if (raceItem) {
            for (let i = 1; i <= 4; i++) {
                let perk = raceItem.system[`perk${i}`];
                if (perk && Array.isArray(perk.modifiers)) {
                    perk.modifiers.forEach(mod => {
                        if (mod.target === checkedStat) {
                            raceModifiers += Number(mod.value) || 0;
                        }
                    });
                }
            }
        }

        return {
            totalModifiers: woundModifiers.totalModifiers + raceModifiers,
            totalDivider: woundModifiers.totalDivider
        };
    },

    getWoundModifier(wounds, checkedStat) {
        let totalModifiers = 0;
        let totalDivider = 1;

        wounds
            .filter(wound => {
                if (!wound.configEntry || wound.configEntry === '') return false;
                // Se curata e i giorni di guarigione sono completati, non applica più penalità
                if (wound.treated && wound.healingTime > 0 && wound.daysHealed >= wound.healingTime) return false;
                return true;
            })
            .forEach(wound => {
                let mod = wound.treated ? 'treated' : (wound.stabilized ? 'stabilized' : 'none');
                let effect = CONFIG.WITCHER.Crit[wound.configEntry]?.effect?.[mod];
                if (!effect) return;

                effect.stats?.forEach(stat => {
                    if (stat.stat == checkedStat) {
                        if (stat.modifier?.toString().includes('/')) {
                            totalDivider = Number(stat.modifier.replace('/', ''));
                        } else {
                            totalModifiers += Number(stat.modifier ?? 0);
                        }
                    }
                });

                effect.derived?.forEach(derived => {
                    if (derived.derivedStat == checkedStat) {
                        if (derived.modifier?.toString().includes('/')) {
                            totalDivider = Number(derived.modifier.replace('/', ''));
                        } else {
                            totalModifiers += Number(derived.modifier ?? 0);
                        }
                    }
                });
            });

        return {
            totalModifiers,
            totalDivider
        };
    },

    addAllModifiers(skillName) {
        let modifierFormula = '';
        modifierFormula += this.addSkillModifiers(skillName);
        if (game.settings.get('TheWitcherItaNewSystem', 'woundsAffectSkillBase')) {
            modifierFormula += ')';
        }
        modifierFormula += this.addWoundsModifier(skillName);
        return modifierFormula;
    },

    addSkillModifiers(skillName) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');
        let skill = CONFIG.WITCHER.skillMap[skillName];

        let formula = '';

        if (!skill) return formula;

        this.system.skills[skill.attribute.name][skill.name].modifiers?.forEach(mod => {
            if (mod.value < 0) {
                formula += ` ${mod.value}[${mod.name}]`;
            }
            if (mod.value > 0) {
                formula += ` +${mod.value}[${mod.name}]`;
            }
        });

        if (this.system.skills[skill.attribute.name][skill.name].activeEffectModifiers != 0) {
            let effects = this.appliedEffects
                .filter(e =>
                    e.changes.some(
                        c => c.key === `system.skills.${skill.attribute.name}.${skill.name}.activeEffectModifiers`
                    )
                )
                .map(effect => effect.name)
                .join(' & ');
            formula += ` +${this.system.skills[skill.attribute.name][skill.name].activeEffectModifiers}[${effects}]`;
        }

        if (this.system.skillGroupModifiers) {
            Object.values(this.system.skillGroupModifiers).forEach(modifier => {
                if (
                    modifier.group === 'allSkills' ||
                    CONFIG.WITCHER[modifier.group].some(groupSkill => groupSkill === skill.name)
                ) {
                    if (modifier.value < 0) {
                        formula += ` ${modifier.value}[${game.i18n.localize(modifier.name)}]`;
                    }
                    if (modifier.value > 0) {
                        formula += ` +${modifier.value}[${game.i18n.localize(modifier.name)}]`;
                    }
                } else {
                }
            });
        }

        let raceItem = this.items?.find(i => i.type === 'race');
        if (raceItem) {
            for (let i = 1; i <= 4; i++) {
                let perk = raceItem.system[`perk${i}`];
                if (perk && Array.isArray(perk.modifiers)) {
                    perk.modifiers.forEach(mod => {
                        if (mod.target === skillName) {
                            let val = Number(mod.value) || 0;
                            if (val < 0) {
                                formula += ` ${val}[Tratto Razziale]`;
                            } else if (val > 0) {
                                formula += ` +${val}[Tratto Razziale]`;
                            }
                        }
                    });
                }
            }
        }

        return formula;
    },

    addWoundsModifier(skillName) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');
        let wounds = this.system.critWounds;

        let formula = '';
        wounds
            .filter(wound => {
                if (!wound.configEntry || wound.configEntry === '') return false;
                // Se curata e i giorni di guarigione sono completati, non applica più penalità
                if (wound.treated && wound.healingTime > 0 && wound.daysHealed >= wound.healingTime) return false;
                return true;
            })
            .forEach(wound => {
                let mod = wound.treated ? 'treated' : (wound.stabilized ? 'stabilized' : 'none');
                let effect = CONFIG.WITCHER.Crit[wound.configEntry]?.effect?.[mod];
                if (!effect) return;

                effect.skills?.forEach(skill => {
                    if (
                        skill.skill == skillName ||
                        CONFIG.WITCHER[skill.skillgroup]?.includes(skillName) ||
                        skill.skill == 'all'
                    ) {
                        if (skill.modifier?.toString().includes('/')) {
                            formula += ` /${Number(skill.modifier.replace('/', ''))}[${game.i18n.localize('WITCHER.CritWound.Header')}]`;
                        } else {
                            formula += ` ${Number(skill.modifier)}[${game.i18n.localize('WITCHER.CritWound.Header')}]`;
                        }
                    }
                });
            });
        return formula;
    },

    addAttackModifiers() {
        let modifiers = '';
        Object.values(this.system.combatEffects.attackModifier).forEach(mod => {
            modifiers += mod.value !== 0 ? ` ${mod.value}[${game.i18n.localize(mod.name)}]` : '';
        });
        return modifiers;
    },

    addDefenseModifiers() {
        let modifiers = '';
        Object.values(this.system.combatEffects.defenseModifier).forEach(mod => {
            modifiers += mod.value !== 0 ? ` ${mod.value}[${game.i18n.localize(mod.name)}]` : '';
        });
        return modifiers;
    }
};
