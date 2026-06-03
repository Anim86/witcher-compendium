import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let weaponAttackMixin = {
    async weaponAttack(weapon, options = {}) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

        const baseDamage =
            typeof weapon.system.damage === 'string' && weapon.system.damage.trim().toUpperCase() === 'N/A'
                ? ''
                : String(weapon.system.damage ?? '').trim();
        let displayDmgFormula = `${weapon.system.damage}`;
        let damageFormula = !displayRollDetails
            ? baseDamage
            : baseDamage
                ? `${baseDamage}[${game.i18n.localize('WITCHER.Diagram.Weapon')}]`
                : '';

        if (weapon.system.applyMeleeBonus && (this.type == 'character' || this.system.addMeleeBonus)) {
            if (this.system.attackStats.meleeBonus < 0) {
                displayDmgFormula += `${this.system.attackStats.meleeBonus}`;
                damageFormula += !displayRollDetails
                    ? `${this.system.attackStats.meleeBonus}`
                    : `${this.system.attackStats.meleeBonus}[${game.i18n.localize('WITCHER.Dialog.attackMeleeBonus')}]`;
            }
            if (this.system.attackStats.meleeBonus > 0) {
                displayDmgFormula += `+${this.system.attackStats.meleeBonus}`;
                damageFormula += !displayRollDetails
                    ? `+${this.system.attackStats.meleeBonus}`
                    : `+${this.system.attackStats.meleeBonus}[${game.i18n.localize('WITCHER.Dialog.attackMeleeBonus')}]`;
            }
        }

        let attack = weapon.getItemAttack(options);
        if (options.skillReplacement) {
            attack.skill = options.skillReplacement.skillName;
            attack.alias = options.skillReplacement.skillName;
        }

        if (!attack.skill) {
            return ui.notifications.error(`${game.i18n.localize('WITCHER.Weapon.error.noAttackSkill')}`);
        }
        let messageDataFlavor = `<h1> ${game.i18n.localize('WITCHER.Dialog.attack')}: ${weapon.name}</h1>`;

        let ammunitions = ``;
        let noAmmo = 0;
        let ammunitionOption = ``;
        if (weapon.system.usingAmmo) {
            ammunitions = this.items.filter(item => item.type == 'weapon' && item.system.isAmmo);
            if (ammunitions.length <= 0) {
                noAmmo = 1;
            } else {
                ammunitions.forEach(element => {
                    ammunitionOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
                });
            }
        }

        let noThrowable = !weapon.system.isEnoughThrowable();
        let meleeBonus = weapon.system.applyMeleeBonus ? this.system.attackStats.meleeBonus : 0;
        let data = {
            item: weapon,
            attackSkill: attack,
            displayDmgFormula,
            noAmmo,
            ammunitionOption,
            noThrowable,
            ammunitions,
            meleeBonus: meleeBonus,
            system: this.system,
            config: CONFIG.WITCHER
        };

        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/dialog/combat/weapon-attack.hbs',
            data
        );

        const result = await DialogV2.prompt({
            window: {
                title: `${game.i18n.localize('WITCHER.Dialog.attackWith')}: ${weapon.name}`,
                contentClasses: ['scrollable', 'weapon-roll-dialog', 'compact-dialog']
            },
            position: { width: 600 },
            content: dialogTemplate,
            modal: true,
            ok: {
                label: game.i18n.localize('WITCHER.Button.Confirm'),
                callback: (event, button, dialog) => {
                    return {
                        isExtraAttack: button.form.elements.isExtraAttack?.checked ?? false,
                        location: button.form.elements.location?.value,
                        ammunition: button.form.elements.ammunition?.value,

                        targetOutsideLOS: button.form.elements.targetOutsideLOS?.checked ?? false,
                        outsideLOS: button.form.elements.outsideLOS?.checked ?? false,
                        isFastDraw: button.form.elements.isFastDraw?.checked ?? false,
                        isProne: button.form.elements.isProne?.checked ?? false,
                        isPinned: button.form.elements.isPinned?.checked ?? false,
                        isActivelyDodging: button.form.elements.isActivelyDodging?.checked ?? false,
                        isMoving: button.form.elements.isMoving?.checked ?? false,
                        isAmbush: button.form.elements.isAmbush?.checked ?? false,
                        isRicochet: button.form.elements.isRicochet?.checked ?? false,
                        isBlinded: button.form.elements.isBlinded?.checked ?? false,
                        isSilhouetted: button.form.elements.isSilhouetted?.checked ?? false,
                        customAim: button.form.elements.customAim?.value || 0,

                        range: weapon.system.range ? button.form.elements.range?.value : null,
                        customAtt: button.form.elements.customAtt?.value || 0,
                        strike: button.form.elements.strike?.value,
                        damageType: button.form.elements.damageType?.value,
                        customDmg: button.form.elements.customDmg?.value || "0",
                        luckToSpend: Number(button.form.elements.luckToSpend?.value || 0)
                    };
                }
            },
            rejectClose: false
        });

        if (!result) return;

        let {
            isExtraAttack,
            location,
            ammunition,
            targetOutsideLOS,
            outsideLOS,
            isFastDraw,
            isProne,
            isPinned,
            isActivelyDodging,
            isMoving,
            isAmbush,
            isRicochet,
            isBlinded,
            isSilhouetted,
            customAim,
            customAtt,
            range,
            strike,
            damageType,
            customDmg,
            luckToSpend
        } = result;

        if (luckToSpend > 0) {
            await this.spendLuck(luckToSpend);
        }

        let attacknumber = CONFIG.WITCHER.weapon.attacks[strike]?.attackNumber ?? 1;
        let damage = weapon.createBaseDamageObject();
        let damageModifcation = '';
        if (options.additionalDamageProperties) {
            damageModifcation = this.mergeDamageProperties(damage.properties, options.additionalDamageProperties);
        }
        damage.strike = strike;
        damage.type = damageType;

        if (isExtraAttack) {
            let newSta = this.system.derivedStats.sta.value - 3;

            if (newSta < 0) {
                return ui.notifications.error(game.i18n.localize('WITCHER.Spell.notEnoughSta'));
            }
            this.update({
                'system.derivedStats.sta.value': newSta
            });
        }

        if (ammunition) {
            let item = this.items.get(ammunition);
            let newQuantity = item.system.quantity - 1;
            item.update({ 'system.quantity': newQuantity });
            damage.properties.effects.push(...item.system.damageProperties.effects);
            damage.ammunition = item;
        }

        if (weapon.system.isThrowable && attack.attackOption === 'ranged') {
            let newQuantity = weapon.system.quantity - 1;
            if (newQuantity < 0) {
                return;
            }
            weapon.update({ 'system.quantity': newQuantity });
        }

        weapon.system.enhancementItems?.forEach(element => {
            if (element && JSON.stringify(element) != '{}') {
                let enhancement = this.items.get(element.id);
                damage.properties.effects.push(...enhancement.system.effects);
            }
        });

        for (let i = 0; i < attacknumber; i++) {
            let attFormula = '1d10+';
            let skill = CONFIG.WITCHER.skillMap[attack.skill];
            if (game.settings.get('TheWitcherItaNewSystem', 'woundsAffectSkillBase')) {
                attFormula += '(';
            }
            if (options.skillReplacement) {
                attFormula += !displayRollDetails
                    ? `${this.system.stats[options.skillReplacement.stat].value}+${options.skillReplacement.level ?? 0}`
                    : `${this.system.stats[options.skillReplacement.stat].value}[${game.i18n.localize(CONFIG.WITCHER.statMap[options.skillReplacement.stat].label)}]+${options.skillReplacement.level ?? 0}[${options.skillReplacement.skillName}]`;
            } else {
                attFormula += this.constructBaseAttackFormula(skill);
            }

            if (weapon.system.accuracy < 0) {
                attFormula += !displayRollDetails
                    ? `${weapon.system.accuracy}`
                    : `${weapon.system.accuracy}[${game.i18n.localize('WITCHER.Weapon.Short.WeaponAccuracy')}]`;
            }
            if (weapon.system.accuracy > 0) {
                attFormula += !displayRollDetails
                    ? `+${weapon.system.accuracy}`
                    : `+${weapon.system.accuracy}[${game.i18n.localize('WITCHER.Weapon.Short.WeaponAccuracy')}]`;
            }
            if (targetOutsideLOS) {
                attFormula += !displayRollDetails
                    ? `-3`
                    : `-3[${game.i18n.localize('WITCHER.Dialog.attackTargetOutsideLOS')}]`;
            }
            if (outsideLOS) {
                attFormula += !displayRollDetails
                    ? `+3`
                    : `+3[${game.i18n.localize('WITCHER.Dialog.attackOutsideLOS')}]`;
            }
            if (isExtraAttack) {
                attFormula += !displayRollDetails ? `-3` : `-3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
            }
            if (isFastDraw) {
                attFormula += !displayRollDetails
                    ? `-3`
                    : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsFastDraw')}]`;
            }
            if (isProne) {
                attFormula += !displayRollDetails ? `-2` : `-2[${game.i18n.localize('WITCHER.Dialog.attackIsProne')}]`;
            }
            if (isPinned) {
                attFormula += !displayRollDetails ? `+4` : `+4[${game.i18n.localize('WITCHER.Dialog.attackIsPinned')}]`;
            }
            if (isActivelyDodging) {
                attFormula += !displayRollDetails
                    ? `-2`
                    : `-2[${game.i18n.localize('WITCHER.Dialog.attackIsActivelyDodging')}]`;
            }
            if (isMoving) {
                attFormula += !displayRollDetails ? `-3` : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsMoving')}]`;
            }
            if (isAmbush) {
                attFormula += !displayRollDetails ? `+5` : `+5[${game.i18n.localize('WITCHER.Dialog.attackIsAmbush')}]`;
            }
            if (isRicochet) {
                attFormula += !displayRollDetails
                    ? `-5`
                    : `-5[${game.i18n.localize('WITCHER.Dialog.attackIsRicochet')}]`;
            }
            if (isBlinded) {
                attFormula += !displayRollDetails
                    ? `-3`
                    : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsBlinded')}]`;
            }
            if (isSilhouetted) {
                attFormula += !displayRollDetails
                    ? `+2`
                    : `+2[${game.i18n.localize('WITCHER.Dialog.attackIsSilhouetted')}]`;
            }
            if (customAim > 0) {
                attFormula += !displayRollDetails
                    ? `+${customAim}`
                    : `+${customAim}[${game.i18n.localize('WITCHER.Dialog.attackCustom')}]`;
            }

            if (customAtt != '0') {
                attFormula += !displayRollDetails
                    ? `+${customAtt}`
                    : `+${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
            }

            if (luckToSpend > 0) {
                attFormula += !displayRollDetails
                    ? `+${luckToSpend}`
                    : `+${luckToSpend}[${game.i18n.localize('WITCHER.StLuck')}]`;
            }

            switch (range) {
                case 'pointBlank':
                    attFormula = !displayRollDetails
                        ? `${attFormula}+5`
                        : `${attFormula} +5[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                    break;
                case 'medium':
                    attFormula = !displayRollDetails
                        ? `${attFormula}-2`
                        : `${attFormula} -2[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                    break;
                case 'long':
                    attFormula = !displayRollDetails
                        ? `${attFormula}-4`
                        : `${attFormula} -4[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                    break;
                case 'extreme':
                    attFormula = !displayRollDetails
                        ? `${attFormula}-6`
                        : `${attFormula} -6[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                    break;
            }

            if (damageFormula === '') damageFormula = '0';
            if (customDmg != '0') {
                damageFormula += !displayRollDetails
                    ? `+${customDmg}`
                    : `+${customDmg}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
            }
            damage.formula = damageFormula + damageModifcation;

            attFormula += this.handleAttackLocation(location, damage, displayRollDetails);
            attFormula += this.handleStrikeType(strike, displayRollDetails);

            messageDataFlavor = `<div class="attack-message"><h1><img src="${weapon.img}" class="item-img" />${game.i18n.localize('WITCHER.Attack.name')}: ${weapon.name}</h1>`;
            messageDataFlavor += `<span>  ${game.i18n.localize('WITCHER.Armor.Location')}: ${damage.location.alias} </span>`;

            messageDataFlavor += `<button class="damage">${game.i18n.localize('WITCHER.table.Damage')}</button></div>`;

            if (weapon.system.rollOnlyDmg) {
                weapon.rollDamage(damage);
            } else {
                let messageData = new ChatMessageData(this, messageDataFlavor, 'attack', {
                    attacker: this.uuid,
                    attack: attack,
                    damage: damage,
                    defenseOptions: weapon.system.defenseOptions
                });

                let roll = await extendedRoll(attFormula, messageData);

                // Rule: Disaster (Fumble) reduces reliability by 1
                if (roll.options.fumble) {
                    let reliabilityDamage = 1;
                    if (weapon.type == 'weapon') {
                        let newReliable = Math.max(0, (weapon.system.reliable ?? 0) - reliabilityDamage);
                        weapon.update({ 'system.reliable': newReliable });
                        if (newReliable <= 0) {
                            ui.notifications.error(`${game.i18n.localize('WITCHER.Weapon.Broken')}: ${weapon.name}`);
                        }
                    } else {
                        // Handle shield
                        let newReliability = Math.max(0, (weapon.system.reliability ?? 0) - reliabilityDamage);
                        weapon.update({ 'system.reliability': newReliability });
                        if (newReliability <= 0) {
                            ui.notifications.error(`${game.i18n.localize('WITCHER.Shield.Broken')}: ${weapon.name}`);
                        }
                    }
                }
            }
        }
    },

    constructBaseAttackFormula(skill) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

        let attFormula = !displayRollDetails
            ? `${this.system.stats[skill.attribute.name].value}+${this.system.skills[skill.attribute.name][skill.name].value}`
            : `${this.system.stats[skill.attribute.name].value}[${game.i18n.localize(skill.attribute.label)}]+${this.system.skills[skill.attribute.name][skill.name].value}[${game.i18n.localize(skill.label)}]`;

        attFormula += this.addAllModifiers(skill.name);
        attFormula += this.addAttackModifiers();

        return attFormula;
    },

    mergeDamageProperties(properties, additionalProperties) {
        let damageModification = '';

        //upgrading of AP
        if (
            properties.armorPiercing &&
            (additionalProperties.armorPiercing || additionalProperties.improvedArmorPiercing)
        ) {
            properties.improvedArmorPiercing = true;
        }

        if (
            properties.improvedArmorPiercing &&
            (additionalProperties.armorPiercing || additionalProperties.improvedArmorPiercing)
        ) {
            damageModification = '+3d6';
        }

        //generic handling
        for (let key in properties) {
            if (typeof properties[key] === 'boolean') properties[key] = properties[key] || additionalProperties[key];
            if (typeof properties[key] === 'number') properties[key] = properties[key] + additionalProperties[key];
            if (typeof properties[key] === 'string') properties[key] = properties[key] + additionalProperties[key];
            if (Array.isArray(properties[key])) properties[key].push(...additionalProperties[key]);
        }

        return damageModification;
    },

    handleAttackLocation(location, damage, displayRollDetails) {
        let touchedLocation = this.getLocationObject(location);
        damage.location = touchedLocation;
        damage.originalLocation = location;

        return !displayRollDetails
            ? `${touchedLocation.modifier}`
            : `${touchedLocation.modifier}[${touchedLocation.alias}]`;
    },

    handleStrikeType(strike, displayRollDetails) {
        let formula = '';
        let strikeConfig = CONFIG.WITCHER.weapon.attacks[strike];
        if (strikeConfig.attackPenality) {
            formula += ` ${strikeConfig.attackPenality}`;
            formula += !displayRollDetails ? `` : `[${game.i18n.localize(strikeConfig.label)}]`;
        }

        if (this.system.lifepathModifiers.attacks[strike]) {
            formula += this.system.lifepathModifiers.attacks[strike] > 0 ? ' +' : ' ';
            formula += `${this.system.lifepathModifiers.attacks[strike]}`;
            formula += displayRollDetails ? `[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]` : '';
        }

        if (strike == 'joint') {
            formula += !displayRollDetails
                ? `${
                      this.system.lifepathModifiers.jointStrikeAttackBonus > 0
                          ? ` +${this.system.lifepathModifiers.jointStrikeAttackBonus}`
                          : ''
                  }`
                : `${
                      this.system.lifepathModifiers.jointStrikeAttackBonus > 0
                          ? ` +${this.system.lifepathModifiers.jointStrikeAttackBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                          : ''
                  }`;
        }

        if (strike == 'strong') {
            formula += !displayRollDetails
                ? `${
                      this.system.lifepathModifiers.strongStrikeAttackBonus > 0
                          ? ` +${this.system.lifepathModifiers.strongStrikeAttackBonus}`
                          : ''
                  }`
                : `${
                      this.system.lifepathModifiers.strongStrikeAttackBonus > 0
                          ? ` +${this.system.lifepathModifiers.strongStrikeAttackBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                          : ''
                  }`;
        }

        return formula;
    }
};
