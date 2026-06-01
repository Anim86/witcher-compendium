import ChatMessageData from '../../chatMessage/chatMessageData.js';
import {
    applyActiveEffectToActor,
    applyActiveEffectToTargets
} from '../../scripts/temporaryEffects/applyActiveEffect.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';
import { applyStatusEffectToActor, applyStatusEffectToTargets } from '../../scripts/statusEffects/applyStatusEffect.js';

const DialogV2 = foundry.applications.api.DialogV2;

const ELEMENTAL_DISASTERS = {
    water: {
        label: 'WITCHER.Spell.Water',
        status: 'freeze',
        description: 'WITCHER.Spell.ElementalDisaster.Water'
    },
    air: {
        label: 'WITCHER.Spell.Air',
        description: 'WITCHER.Spell.ElementalDisaster.Air'
    },
    earth: {
        label: 'WITCHER.Spell.Earth',
        status: 'stun',
        description: 'WITCHER.Spell.ElementalDisaster.Earth'
    },
    fire: {
        label: 'WITCHER.Spell.Fire',
        status: 'fire',
        description: 'WITCHER.Spell.ElementalDisaster.Fire'
    }
};

export let castSpellMixin = {
    async castSpell(spellItem) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

        let damage = spellItem.createBaseDamageObject();

        let templateInfo = {
            actor: this
        };

        let rollFormula = '1d10+';
        if (game.settings.get('TheWitcherItaNewSystem', 'woundsAffectSkillBase')) {
            rollFormula += '(';
        }
        rollFormula += !displayRollDetails
            ? `${this.system.stats.will.value}`
            : `${this.system.stats.will.value}[${game.i18n.localize(CONFIG.WITCHER.statMap.will.label)}]`;

        let usedSkill = spellItem.system.getUsedSkill();

        rollFormula +=
            `+${this.system.skills.will[usedSkill.name].value}` +
            (displayRollDetails ? `[${game.i18n.localize(usedSkill.label)}]` : '');
        rollFormula += this.addAllModifiers(usedSkill.name);
        rollFormula += this.addAttackModifiers();

        let armorEnc = this.getArmorEcumbrance();
        if (armorEnc > 0) {
            rollFormula += !displayRollDetails
                ? ` -${armorEnc}${
                      this.system.lifepathModifiers.ignoredEvWhenCasting > 0
                          ? ` +${this.system.lifepathModifiers.ignoredEvWhenCasting}`
                          : ''
                  }`
                : ` -${armorEnc}[${game.i18n.localize('WITCHER.Armor.EncumbranceValue')}]${
                      this.system.lifepathModifiers.ignoredEvWhenCasting > 0
                          ? ` +${this.system.lifepathModifiers.ignoredEvWhenCasting}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                          : ''
                  }`;
        }

        let useFocus = false;
        let handlebarFocusOptions = {};
        if (this.system.focus1.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus1 = {
                value: this.system.focus1.value,
                label: this.system.focus1.name + '(' + this.system.focus1.value + ')'
            };
        }
        if (this.system.focus2.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus2 = {
                value: this.system.focus2.value,
                label: this.system.focus2.name + '(' + this.system.focus2.value + ')'
            };
        }
        if (this.system.focus3.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus3 = {
                value: this.system.focus3.value,
                label: this.system.focus3.name + '(' + this.system.focus3.value + ')'
            };
        }
        if (this.system.focus4.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus4 = {
                value: this.system.focus4.value,
                label: this.system.focus4.name + '(' + this.system.focus4.value + ')'
            };
        }

        let data = {
            causeDamage: spellItem.system.causeDamages,
            staminaIsVar: spellItem.system.staminaIsVar,
            useFocus: useFocus,
            focusOptions: handlebarFocusOptions
        };

        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/dialog/combat/spell-attack.hbs',
            data
        );

        let result = await DialogV2.prompt({
                window: { title: `${game.i18n.localize('WITCHER.Spell.MagicCost')}` },
                content: dialogTemplate,
                modal: true,
                ok: {
                    callback: (event, button, dialog) => {
                        return {
                            staCostTotal: button.form.elements.staCost?.value ?? spellItem.system.stamina,
                            customModifier: button.form.elements.customMod.value,
                            isExtraAttack: button.form.elements.isExtraAttack.checked,
                            focusValue: button.form.elements.focus?.value ?? 0,
                            secondFocusValue: button.form.elements.secondFocus?.value ?? 0,
                            location: button.form.elements.location?.value
                        };
                    }
                },
                rejectClose: false
            });

        if (!result) return;
        let { staCostTotal, customModifier, isExtraAttack, focusValue, secondFocusValue, location } = result;

        staCostTotal = Number(staCostTotal) || 0;
        customModifier = Number(customModifier) || 0;
        focusValue = Number(focusValue) || 0;
        secondFocusValue = Number(secondFocusValue) || 0;

        let origStaCost = staCostTotal;

        const focusBonus = focusValue + secondFocusValue;
        const usedFocus = focusBonus > 0;

        staCostTotal -= focusBonus;
        if (isExtraAttack) {
            staCostTotal += 3;
        }

        let useMinimalStaCost = false;
        if (staCostTotal < 1) {
            useMinimalStaCost = true;
            staCostTotal = 1;
        }

        const currentSta = Number(this.system.derivedStats.sta.value) || 0;
        const newSta = currentSta - staCostTotal;
        const staminaDeficit = Math.max(Math.abs(Math.min(newSta, 0)), 0);

        await this.update({
            'system.derivedStats.sta.value': Math.max(newSta, 0)
        });

        if (staminaDeficit > 0) {
            await applyStatusEffectToActor(this.uuid, 'stun');
            await this._createMagicRuleMessage(
                'WITCHER.Spell.StaminaCollapse',
                `<p>${game.i18n.format('WITCHER.Spell.StaminaCollapseDescription', {
                    cost: staCostTotal,
                    stamina: currentSta
                })}</p>`
            );
        }

        const vigor = Number(this.system.derivedStats.vigor.max) || 0;
        const overexertion = Math.max(staCostTotal - vigor, 0);

        let staCostDisplay = `${origStaCost}[${game.i18n.localize('WITCHER.Spell.Short.StaCost')}]`;

        if (isExtraAttack) {
            staCostDisplay += ` + 3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
        }

        staCostDisplay += ` -${focusBonus}[${game.i18n.localize('WITCHER.Actor.DerStat.Focus')}]`;
        staCostDisplay += ` =  ${staCostTotal}`;
        if (useMinimalStaCost) {
            staCostDisplay += `[${game.i18n.localize('WITCHER.MinValue')}]`;
        }
        templateInfo.staCostDisplay = staCostDisplay;

        if (customModifier < 0) {
            rollFormula += !displayRollDetails
                ? ` ${customModifier}`
                : ` ${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }
        if (customModifier > 0) {
            rollFormula += !displayRollDetails
                ? ` +${customModifier}`
                : ` +${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }
        if (isExtraAttack) {
            rollFormula += !displayRollDetails ? ` -3` : ` -3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
        }

        templateInfo.spellSource = this._getSpellSourceLabel(spellItem.system.source);

        if (spellItem.system.duration) {
            let durationText = spellItem.system.duration;
            damage.duration = durationText.replace(/\D/g, '');
            if (spellItem.system.duration.match(/\d+d\d+/g)) {
                let durationSubstrings = spellItem.system.duration.split(' ');
                let roll = await new Roll(durationSubstrings.shift()).evaluate();
                damage.duration = roll.total;

                let durationRoll = roll.toAnchor();
                durationText = durationRoll.outerHTML + ' ' + durationSubstrings.join(' ');
            }

            templateInfo.durationText = durationText;
        }

        if (spellItem.system.causeDamages) {
            let dmg = spellItem.system.damage || '0';
            if (spellItem.system.staminaIsVar) {
                dmg = this.calcStaminaMulti(origStaCost, dmg);

                damage.properties?.effects?.forEach(effect => {
                    if (effect.varEffect) {
                        effect.percentage = this.calcStaminaMulti(origStaCost, effect.percentage);
                    }
                });
            }

            damage.formula = dmg;
            let touchedLocation = this.getLocationObject(location);
            rollFormula += !displayRollDetails
                ? `${touchedLocation.modifier}`
                : `${touchedLocation.modifier}[${touchedLocation.alias}]`;
            damage.location = touchedLocation;
            damage.originalLocation = location;
            damage.type = spellItem.system.damageType;
        }

        if (spellItem.system.createsShield) {
            damage.shield = spellItem.system.shield || '0';
            if (spellItem.system.staminaIsVar) {
                damage.shield = this.calcStaminaMulti(origStaCost, damage.shield);
            }
        }

        if (spellItem.system.doesHeal) {
            damage.heal = spellItem.system.heal || '0';
            if (spellItem.system.staminaIsVar) {
                damage.heal = this.calcStaminaMulti(origStaCost, heal);
            }
        }

        if (spellItem.system.selfEffects?.length > 0) {
            templateInfo.selfEffects = [];
            spellItem.system.selfEffects.forEach(effect => {
                if (effect.name != '') {
                }
                if (effect.statusEffect) {
                    let statusEffect = CONFIG.WITCHER.statusEffects.find(status => status.id == effect.statusEffect);
                    templateInfo.selfEffects.push({ effect: effect, statusEffect: statusEffect });
                }
            });
        }

        const chatMessage = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/chat/combat/spellItem.hbs',
            {
                spellItem,
                templateInfo,
                damage
            }
        );
        let messageData = new ChatMessageData(this, chatMessage, 'attack', {
            attacker: this.uuid,
            attack: spellItem.getItemAttack(),
            damage: damage,
            defenseOptions: spellItem.system.defenseOptions
        });

        let config = new RollConfig({ showResult: false });

        let roll = await extendedRoll(rollFormula, messageData, config);
        await roll.toMessage(messageData);

        if (overexertion > 0) {
            await this._resolveMagicOverexertion(spellItem, overexertion, staCostTotal, vigor);
        }

        const magicalFumble = roll.options.fumble
            ? await this._resolveMagicalFumble(spellItem, roll, { usedFocus })
            : null;

        spellItem.system.createSpellVisuals?.(roll, damage, { stamina: origStaCost });

        if (!roll.options.fumble || magicalFumble?.spellTakesEffect) {
            spellItem.system.selfEffects?.forEach(effect =>
                applyStatusEffectToActor(this.uuid, effect.statusEffect, damage.duration)
            );
            applyActiveEffectToActor(
                this.uuid,
                spellItem.effects.filter(effect => effect.system.applySelf),
                damage.duration
            );

            applyStatusEffectToTargets(spellItem.system.onCastEffects, damage.duration);
            applyActiveEffectToTargets(
                spellItem.effects.filter(effect => effect.system.applyOnTarget),
                damage.duration
            );
        }

        return roll;
    },

    async _resolveMagicOverexertion(spellItem, overexertion, staCostTotal, vigor) {
        const hpLoss = overexertion * 5;

        await this._applyMagicDirectHpDamage(hpLoss);
        await this._createMagicRuleMessage(
            'WITCHER.Spell.Overexertion',
            `<p>${game.i18n.format('WITCHER.Spell.OverexertionDescription', {
                cost: staCostTotal,
                vigor,
                overexertion,
                damage: hpLoss
            })}</p>`
        );

        await this._resolveElementalDisaster(spellItem, overexertion);
    },

    async _resolveMagicalFumble(spellItem, roll, { usedFocus = false } = {}) {
        const disasterPoints = Number(roll.options.fumbleAmount) || 0;
        const tableRoll = await new Roll('1d10x10').evaluate();
        const tableTotal = Number(tableRoll.total) || 0;
        const spellTakesEffect = tableTotal < 7;

        let content = `
            <p><b>${game.i18n.localize('WITCHER.Spell.FumbleTable')}:</b> ${tableRoll.toAnchor().outerHTML}</p>
            <p><b>${game.i18n.localize('WITCHER.Spell.DisasterPoints')}:</b> ${disasterPoints}</p>
        `;

        if (spellTakesEffect) {
            await this._applyMagicDirectHpDamage(disasterPoints);
            content += `<p>${game.i18n.format('WITCHER.Spell.MagicFumbleMinor', {
                damage: disasterPoints
            })}</p>`;
        } else {
            content += `<p>${game.i18n.localize('WITCHER.Spell.SpellFails')}</p>`;
        }

        if (tableTotal >= 7) {
            content += `<p>${game.i18n.localize('WITCHER.Spell.MagicFumbleElemental')}</p>`;
        }

        if (tableTotal >= 10) {
            if (usedFocus) {
                const focusExplosion = await new Roll('1d10').evaluate();
                content += `
                    <p><b>${game.i18n.localize('WITCHER.Spell.FocusExplosion')}:</b>
                    ${game.i18n.format('WITCHER.Spell.FocusExplosionDescription', {
                        damage: focusExplosion.total
                    })}</p>
                    <p>${focusExplosion.toAnchor().outerHTML}</p>
                `;
            } else {
                content += `<p>${game.i18n.localize('WITCHER.Spell.FocusExplosionNoFocus')}</p>`;
            }
        }

        await this._createMagicRuleMessage('WITCHER.Spell.MagicFumble', content);

        if (tableTotal >= 7) {
            await this._resolveElementalDisaster(spellItem, disasterPoints);
        }

        return { spellTakesEffect };
    },

    async _resolveElementalDisaster(spellItem, disasterPoints) {
        const source = this._normalizeSpellSource(spellItem.system.source);
        let disasterSource = source;
        let randomElementText = '';

        if (source === 'mixed' || !ELEMENTAL_DISASTERS[source]) {
            const elementRoll = await new Roll('1d4').evaluate();
            const elements = ['water', 'air', 'earth', 'fire'];
            disasterSource = elements[elementRoll.total - 1] ?? 'water';
            randomElementText = `
                <p><b>${game.i18n.localize('WITCHER.Spell.Mixed')}:</b>
                ${game.i18n.localize('WITCHER.Spell.ElementalDisaster.Mixed')}
                ${elementRoll.toAnchor().outerHTML}</p>
            `;
        }

        const disaster = ELEMENTAL_DISASTERS[disasterSource];
        const damage = Number(disasterPoints) || 0;

        await this._applyMagicDirectHpDamage(damage);

        if (disaster.status) {
            await applyStatusEffectToActor(this.uuid, disaster.status, 1);
        }

        const statusEffect = disaster.status
            ? CONFIG.WITCHER.statusEffects.find(status => status.id === disaster.status)
            : null;

        const statusText = statusEffect
            ? `<p><b>${game.i18n.localize('WITCHER.Item.statusEffect')}:</b> ${game.i18n.localize(statusEffect.name)}</p>`
            : '';

        await this._createMagicRuleMessage(
            'WITCHER.Spell.ElementalDisaster.Name',
            `
                ${randomElementText}
                <p><b>${game.i18n.localize('WITCHER.Spell.Element')}:</b> ${game.i18n.localize(disaster.label)}</p>
                <p>${game.i18n.localize(disaster.description)}</p>
                <p><b>${game.i18n.localize('WITCHER.Spell.DirectDamage')}:</b> ${damage}</p>
                ${statusText}
            `
        );
    },

    async _applyMagicDirectHpDamage(damage) {
        damage = Math.max(Number(damage) || 0, 0);
        if (damage <= 0) return;

        await this.update({
            'system.derivedStats.hp.value': this.system.derivedStats.hp.value - damage
        });
    },

    async _createMagicRuleMessage(title, content) {
        const chatData = {
            content: `<h2>${game.i18n.localize(title)}</h2>${content}`,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
        };

        ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
        await ChatMessage.create(chatData);
    },

    _normalizeSpellSource(source) {
        const normalized = String(source ?? '').trim().toLowerCase();

        if (normalized === 'mixed' || normalized === 'mixed elements' || normalized === 'mixedelements') {
            return 'mixed';
        }

        if (normalized === 'water') return 'water';
        if (normalized === 'air') return 'air';
        if (normalized === 'earth') return 'earth';
        if (normalized === 'fire') return 'fire';

        return normalized;
    },

    _getSpellSourceLabel(source) {
        switch (this._normalizeSpellSource(source)) {
            case 'mixed':
                return 'WITCHER.Spell.Mixed';
            case 'earth':
                return 'WITCHER.Spell.Earth';
            case 'air':
                return 'WITCHER.Spell.Air';
            case 'fire':
                return 'WITCHER.Spell.Fire';
            case 'water':
                return 'WITCHER.Spell.Water';
            default:
                return source;
        }
    },

    calcStaminaMulti(origStaCost, value) {
        let staminaMulti = parseInt(origStaCost);

        if (value.replace) {
            value = value.replace('/STA', '');
        }

        if (value.includes && value.includes('d')) {
            let diceAmount = value.split('d')[0];
            let diceType = 'd' + value.split('d')[1].replace('/STA', '');
            return staminaMulti * diceAmount + diceType;
        } else {
            return staminaMulti * value;
        }
    }
};
