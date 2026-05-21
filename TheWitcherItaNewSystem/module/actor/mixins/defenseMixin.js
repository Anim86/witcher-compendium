import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { applyStatusEffectToActor } from '../../scripts/statusEffects/applyStatusEffect.js';
import { applyActiveEffectToActorViaId } from '../../scripts/temporaryEffects/applyActiveEffect.js';
import { getRandomInt } from '../../scripts/helper.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let defenseMixin = {
    async prepareAndExecuteDefense(attack, defenseOptions, attackDamageObject, totalAttack, attacker) {
        const totalLuck = (this.system.stats.luck.value || 0) + (this.system.stats.luck.temp || 0);
        const content = `
        <div class="flex">
            <label>${game.i18n.localize('WITCHER.Dialog.DefenseExtra')}: <input type="checkbox" name="isExtraDefense"></label> <br />
        </div>
        <div class="form-group">
            <label>${game.i18n.localize('WITCHER.Dialog.defense.custom')}: <input type="number" class="small" name="customDef" value=0></label>
        </div>
        <div class="form-group">
            <label>${game.i18n.localize('WITCHER.StLuck')} (${totalLuck}): <input type="number" class="small" name="luckToSpend" value=0 min=0 max="${totalLuck}"></label>
        </div>`;

        let additionalOptions = this.items
            .filter(item => item.system.isApplicableDefense?.(attack.attackOption))
            .map(item => item.createDefenseOption(attack));

        let defenseOptionsData = [
            ...defenseOptions.map(option => CONFIG.WITCHER.defenseOptions.find(defense => defense.value === option)),
            ...additionalOptions
        ];

        if (attackDamageObject.properties.crushingForce) {
            defenseOptionsData = defenseOptionsData.filter(option => option.value != 'parry');
        }

        let buttons = Array.from(
            defenseOptionsData.map(option => {
                return {
                    label: option.label,
                    action: option.value,
                    callback: (event, button, dialog) => {
                        return {
                            defenseAction: option,
                            extraDefense: button.form.elements.isExtraDefense.checked,
                            customDef: button.form.elements.customDef.value,
                            luckToSpend: Number(button.form.elements.luckToSpend.value || 0)
                        };
                    }
                };
            })
        );

        let result = await DialogV2.wait({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.DefenseTitle')}` },
            content,
            buttons: buttons,
            rejectClose: false
        });

        if (!result) return;
        let { defenseAction, extraDefense, customDef, luckToSpend } = result;

        if (luckToSpend > 0) {
            await this.spendLuck(luckToSpend);
        }

        let chooser = [];
        if (defenseAction.skills) {
            defenseAction.skills.forEach(skill =>
                chooser.push({ value: skill, label: CONFIG.WITCHER.skillMap[skill].label })
            );
        }

        if (defenseAction.itemTypes) {
            defenseAction.itemTypes.forEach(itemType =>
                this.getList(itemType)
                    .filter(item => !item.system.isAmmo)
                    .filter(item => {
                        // Filter out broken items
                        if (item.type === 'armor') return (item.system.reliability ?? 1) > 0;
                        if (item.type === 'weapon') return (item.system.reliable ?? 1) > 0;
                        return true;
                    })
                    .forEach(item =>
                        chooser.push({
                            value: item.system.meleeAttackSkill ?? 'melee',
                            label: item.name,
                            itemId: item.id
                        })
                    )
            );
        }

        let skillName;
        let itemId;

        if (chooser.length == 1) {
            skillName = chooser[0].value;
            itemId = chooser[0].itemId;
        } else if (chooser.length > 1) {
            let options = '';
            chooser.forEach(
                option =>
                    (options += `<option value="${option.value}" data-itemId="${option.itemId}"> ${game.i18n.localize(option.label)}</option>`)
            );

            let chooserContent = `<label>${game.i18n.localize('WITCHER.Dialog.DefenseWith')}: </label><select name="choosenDefense">${options}</select><br />`;
            let resultPrompt = await DialogV2.prompt({
                window: { title: `${game.i18n.localize('WITCHER.Dialog.DefenseWith')}` },
                content: chooserContent,
                ok: {
                    callback: (event, button, dialog) => {
                        return {
                            skillName: button.form.elements.choosenDefense.value,
                            itemId: button.form.elements.choosenDefense.selectedOptions[0].dataset.itemid
                        };
                    }
                },
                rejectClose: false
            });
            if (!resultPrompt) return;
            ({ skillName, itemId } = resultPrompt);
        }

        return this.skillDefense(
            {
                skillName,
                modifier: defenseAction.modifier,
                stagger: defenseAction.stagger,
                block: defenseAction.block
            },
            {
                totalAttack,
                attackDamageObject,
                attacker
            },
            { extraDefense, customDef, luckToSpend },
            defenseAction,
            itemId,
            defenseAction.skillOverride
        );
    },

    async skillDefense(
        { skillName, modifier = 0, stagger = false, block = false },
        { totalAttack, attackDamageObject, attacker },
        { extraDefense = false, customDef = 0, luckToSpend = 0 },
        defenseAction,
        defenseItemId,
        skillOverride
    ) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

        if (!this.handleExtraDefense(extraDefense)) {
            return;
        }
        let skillMapEntry = skillOverride?.skillMapEntry ?? CONFIG.WITCHER.skillMap[skillName];

        let stat = this.system.stats[skillMapEntry.attribute.name].value;
        let skill = skillOverride?.skill ?? this.system.skills[skillMapEntry.attribute.name][skillName];
        let skillValue = skill.value;

        let displayFormula = `1d10 + ${game.i18n.localize(skillMapEntry.attribute.labelShort)} + ${game.i18n.localize(skillMapEntry.label)}`;

        let rollFormula = '1d10+';
        if (game.settings.get('TheWitcherItaNewSystem', 'woundsAffectSkillBase')) {
            rollFormula += '(';
        }
        rollFormula += !displayRollDetails
            ? `${stat}+${skillValue}`
            : `${stat}[${game.i18n.localize(skillMapEntry.attribute.labelShort)}] +${skillValue}[${game.i18n.localize(skillMapEntry.label)}]`;

        if (modifier < 0) {
            rollFormula += !displayRollDetails
                ? `${modifier}`
                : `${modifier}[${game.i18n.localize(defenseAction.label)}]`;

            if (defenseAction.value == 'parry' || defenseAction.value == 'parryThrown') {
                let weapon = this.items.get(defenseItemId);
                if (weapon?.system.defenseProperties?.parrying) {
                    rollFormula += !displayRollDetails
                        ? `+${Math.abs(modifier)}`
                        : `+${Math.abs(modifier)}[${weapon.name}]`;
                }
            }
        }
        if (modifier > 0) {
            rollFormula += !displayRollDetails
                ? `+${modifier}`
                : `+${modifier}[${game.i18n.localize(defenseAction.label)}]`;
        }

        if (customDef != '0') {
            rollFormula += !displayRollDetails
                ? `+${customDef}`
                : ` +${customDef}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }

        if (luckToSpend > 0) {
            rollFormula += !displayRollDetails
                ? `+${luckToSpend}`
                : ` +${luckToSpend}[${game.i18n.localize('WITCHER.StLuck')}]`;
        }

        rollFormula = this.handleLifepathModifier(
            rollFormula,
            defenseAction.value,
            this.items.get(defenseItemId)?.type
        );
        rollFormula += this.addAllModifiers(skillName);
        rollFormula += this.addDefenseModifiers();

        if (skillName != 'resistmagic' && this.statuses.find(status => status == 'stun')) {
            rollFormula = '10[Stun]';
        }

        const chatMessage = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/chat/combat/defense/defense.hbs',
            {
                defenseName: skillOverride ? skillMapEntry.label : defenseAction.label,
                displayFormula
            }
        );
        let messageData = new ChatMessageData(this, chatMessage, 'defense', {
            attackWeaponProperties: attackDamageObject.properties,
            defender: this.uuid,
            defense: skillName
        });

        let roll = await extendedRoll(
            rollFormula,
            messageData,
            this.createDefenseRollConfig(skillOverride?.skill ?? CONFIG.WITCHER.skillMap[skillName], totalAttack)
        );
        let crit = this.checkForCrit(roll.total, totalAttack);
        if (crit) {
            crit.isTargeted = !attackDamageObject.originalLocation.includes('random');
            crit.location = await this.handleCritLocation(attackDamageObject);
            attackDamageObject.location = crit.location;
            crit.critEffectModifier = attackDamageObject.crit.critEffectModifier;
        }

        const chatMessageCrit = crit
            ? await foundry.applications.handlebars.renderTemplate(
                  'systems/TheWitcherItaNewSystem/templates/chat/combat/defense/defenseCrit.hbs',
                  {
                      crit: { severity: CONFIG.WITCHER.CritGravity[crit.severity] }
                  }
              )
            : '';
        messageData.append(new ChatMessageData(this, chatMessageCrit, 'defense', { crit: crit }));

        let stun = this.checkForStun(attackDamageObject);
        const chatMessageStun = stun
            ? await foundry.applications.handlebars.renderTemplate(
                  'systems/TheWitcherItaNewSystem/templates/chat/combat/defense/defenseStun.hbs',
                  {
                      stun
                  }
              )
            : '';
        messageData.append(new ChatMessageData(this, chatMessageStun, 'defense', { stun: stun }));

        let message = await roll.toMessage(messageData);

        this.handleDefenseResults(roll, { totalAttack, attackDamageObject, attacker }, defenseItemId, {
            stagger,
            block
        });
    },

    addDefenseModifiers() {
        let modifiers = '';
        Object.values(this.system.combatEffects.defenseModifier).forEach(mod => {
            modifiers += mod.value !== 0 ? ` ${mod.value}[${game.i18n.localize(mod.name)}]` : '';
        });
        return modifiers;
    },

    handleExtraDefense(extraDefense) {
        if (extraDefense) {
            let newSta = this.system.derivedStats.sta.value - 1;
            if (newSta < 0) {
                ui.notifications.error(game.i18n.localize('WITCHER.Spell.notEnoughSta'));
                return false;
            }
            this.update({
                'system.derivedStats.sta.value': newSta
            });
        }

        return true;
    },

    handleLifepathModifier(formula, action, additionalTag) {
        if (additionalTag === 'armor') {
            if (action === 'parry') {
                formula +=
                    this.system.lifepathModifiers.shieldParryBonus > 0
                        ? ` +${this.system.lifepathModifiers.shieldParryBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                        : '';
            }

            if (action === 'parrythrown') {
                formula +=
                    this.system.lifepathModifiers.shieldParryThrownBonus > 0
                        ? ` +${this.system.lifepathModifiers.shieldParryThrownBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                        : '';
            }
        }

        return formula;
    },

    createDefenseRollConfig(skill, totalAttack) {
        let config = new RollConfig();
        config.showResult = false;
        config.defense = true;
        config.threshold = totalAttack;
        config.thresholdDesc = skill.label;
        return config;
    },

    checkForStun(attackDamageObject) {
        // Every critical wound forces a Grit (stun) save
        if (attackDamageObject.crit) {
            return {
                modifier: attackDamageObject.properties.stun || 0
            };
        }
        if (attackDamageObject.location.name != 'torso' && attackDamageObject.location.name != 'head') return;
        if (!attackDamageObject.properties.stun) return;

        return {
            modifier: attackDamageObject.properties.stun
        };
    },

    checkForCrit(defenseRoll, totalAttack) {
        let margin = totalAttack - defenseRoll;

        if (margin >= 15) {
            return {
                severity: 'deadly',
                critdamage: 10,
                bonusdamage: 20
            };
        }

        if (margin >= 13) {
            return {
                severity: 'difficult',
                critdamage: 8,
                bonusdamage: 15
            };
        }

        if (margin >= 10) {
            return {
                severity: 'complex',
                critdamage: 5,
                bonusdamage: 10
            };
        }

        if (margin >= 7) {
            return {
                severity: 'simple',
                critdamage: 3,
                bonusdamage: 5
            };
        }

        return null;
    },

    async handleCritLocation(attackDamageObject) {
        if (!attackDamageObject.originalLocation.includes('random')) {
            return {
                name: attackDamageObject.originalLocation
            };
        }
        return {
            name: 'random'
        };
    },

    handleDefenseResults(roll, { totalAttack, attackDamageObject, attacker }, defenseItemId, { stagger, block }) {
        let item = this.items.get(defenseItemId);
        let isFumble = roll.options.fumble;

        // Rule: Disaster (Fumble) reduces reliability by 1
        if (isFumble && item) {
            let reliabilityDamage = 1;
            if (item.type == 'armor') {
                let newReliability = Math.max(0, item.system.reliability - reliabilityDamage);
                item.update({ 'system.reliability': newReliability });
                if (newReliability <= 0) {
                    ui.notifications.error(`${game.i18n.localize('WITCHER.Shield.Broken')}: ${item.name}`);
                }
            } else if (item.type == 'weapon') {
                let newReliable = Math.max(0, item.system.reliable - reliabilityDamage);
                item.update({ 'system.reliable': newReliable });
                if (newReliable <= 0) {
                    ui.notifications.error(`${game.i18n.localize('WITCHER.Weapon.Broken')}: ${item.name}`);
                }
            }
        }

        if (roll.total < totalAttack) {
            applyActiveEffectToActorViaId(
                this.uuid,
                attackDamageObject.itemUuid,
                'applyOnHit',
                attackDamageObject.duration
            );

            this.removeStatus([{ statusEffect: 'stun' }]);
        } else {
            if (stagger) {
                applyStatusEffectToActor(attacker, 'staggered', 1);
            }

            if (block && item) {
                let reliabilityDamage = 1;
                if (attackDamageObject.properties.crushingForce) {
                    reliabilityDamage *= 2;
                }
                
                if (item.type == 'armor') {
                    let newReliability = Math.max(0, item.system.reliability - reliabilityDamage);
                    item.update({ 'system.reliability': newReliability });
                    if (newReliability <= 0) {
                        ui.notifications.error(`${game.i18n.localize('WITCHER.Shield.Broken')}: ${item.name}`);
                    }
                } else if (item.type == 'weapon') {
                    let newReliable = Math.max(0, item.system.reliable - reliabilityDamage);
                    item.update({ 'system.reliable': newReliable });
                    if (newReliable <= 0) {
                        ui.notifications.error(`${game.i18n.localize('WITCHER.Weapon.Broken')}: ${item.name}`);
                    }
                }
            }
        }
    },

    async stunSave(modifier = 0) {
        let stunValue = this.system.derivedStats.stun.value + modifier;
        let stunName = 'WITCHER.Actor.DerStat.Stun';

        let messageData = new ChatMessageData(this);
        messageData.flavor = `
        <h2>${game.i18n.localize(stunName)}</h2>
        <div class="roll-summary">
            <div class="dice-formula">${game.i18n.localize('WITCHER.Chat.SaveText')} <b>${stunValue}</b></div>
        </div>
        <hr />`;

        let config = new RollConfig();
        config.showCrit = false;
        config.showSuccess = true;
        config.reversal = true;
        config.threshold = stunValue;
        config.thresholdDesc = stunName;
        let roll = await extendedRoll(`1d10`, messageData, config);

        if (!roll.options.success) {
            this.applyStatus([{ statusEffect: 'stun' }]);
        }
    }
};
