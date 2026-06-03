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
        const usedSkillValue = Number(this.system.skills.will[usedSkill.name].value) || 0;

        if (usedSkillValue !== 0) {
            rollFormula +=
                `+${usedSkillValue}` +
                (displayRollDetails ? `[${game.i18n.localize(usedSkill.label)}]` : '');
        }
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
        const canUseMagicalFocus = String(spellItem.system.class ?? '') !== 'MagicalGift';
        let expandedMagicSkill = this._getExpandedMagicSkill();
        let handlebarFocusOptions = {};


        this.items?.forEach(item => {
            const itemFocus = this._getEquippedItemFocusInfo(item);
            if (!itemFocus) return;

            useFocus = true;
            handlebarFocusOptions[`item-${item.id}`] = {
                value: itemFocus.value,
                superior: itemFocus.superior,
                label:
                    item.name +
                    '(' +
                    itemFocus.value +
                    ')' +
                    (itemFocus.superior ? ` ${game.i18n.localize('WITCHER.Actor.focus.superiorShort')}` : '')
            };
        });

        if (!canUseMagicalFocus) {
            useFocus = false;
            expandedMagicSkill = null;
            handlebarFocusOptions = {};
        }

        let data = {
            causeDamage: spellItem.system.causeDamages,
            staminaIsVar: spellItem.system.staminaIsVar,
            useFocus: useFocus,
            hasExpandedMagicSkill: Boolean(expandedMagicSkill),
            focusOptions: handlebarFocusOptions,
            item: spellItem
        };

        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/dialog/combat/spell-attack.hbs',
            data
        );

        let result = await DialogV2.prompt({
                window: { 
                    title: `${game.i18n.localize('WITCHER.Spell.MagicCost')}`,
                    contentClasses: ['scrollable', 'weapon-roll-dialog', 'compact-dialog'] 
                },
                position: { width: 600 },
                content: dialogTemplate,
                modal: true,
                ok: {
                    callback: (event, button, dialog) => {
                        const focusSelect = button.form.elements.focus;
                        const secondFocusSelect = button.form.elements.secondFocus;

                        return {
                            staCostTotal: button.form.elements.staCost?.value ?? spellItem.system.stamina,
                            customModifier: button.form.elements.customMod.value,
                            isExtraAttack: button.form.elements.isExtraAttack.checked,
                            focusKey: focusSelect?.value ?? '',
                            focusValue: focusSelect?.selectedOptions?.[0]?.dataset?.value ?? 0,
                            focusSuperior: focusSelect?.selectedOptions?.[0]?.dataset?.superior === 'true',
                            secondFocusKey: secondFocusSelect?.value ?? '',
                            secondFocusValue: secondFocusSelect?.selectedOptions?.[0]?.dataset?.value ?? 0,
                            secondFocusSuperior: secondFocusSelect?.selectedOptions?.[0]?.dataset?.superior === 'true',
                            useExpandedFocus: button.form.elements.useExpandedFocus?.checked ?? false,
                            location: button.form.elements.location?.value
                        };
                    }
                },
                rejectClose: false
            });

        if (!result) return;
        let {
            staCostTotal,
            customModifier,
            isExtraAttack,
            focusKey,
            focusValue,
            focusSuperior,
            secondFocusKey,
            secondFocusValue,
            secondFocusSuperior,
            useExpandedFocus,
            location
        } = result;

        staCostTotal = Number(staCostTotal) || 0;
        customModifier = Number(customModifier) || 0;
        focusValue = Number(focusValue) || 0;
        secondFocusValue = Number(secondFocusValue) || 0;

        let origStaCost = staCostTotal;

        useExpandedFocus = Boolean(useExpandedFocus) && Boolean(expandedMagicSkill) && focusValue > 0;
        if (useExpandedFocus) {
            const expandedMagicRoll = await this._rollExpandedMagicCheck(expandedMagicSkill);
            if (!expandedMagicRoll) return;

            await expandedMagicRoll.toMessage(expandedMagicRoll.messageData);
            if (!expandedMagicRoll.options.success) {
                ui.notifications.warn(game.i18n.localize('WITCHER.Spell.ExpandedMagicFailure'));
                useExpandedFocus = false;
            }
        }

        const usedSecondFocus = useExpandedFocus && secondFocusValue > 0 && secondFocusKey !== focusKey;
        const expandedFocusDivisor = useExpandedFocus ? (usedSecondFocus ? 4 : 2) : 1;
        const focusBonus = useExpandedFocus ? 0 : focusValue;
        const usedFocus = useExpandedFocus || focusBonus > 0;
        const superiorFocusApplies = usedFocus && this._doesSuperiorFocusApply(spellItem);
        const usedSuperiorFocus =
            superiorFocusApplies && (Boolean(focusSuperior) || (usedSecondFocus && Boolean(secondFocusSuperior)));
        const focusSuperiorBonus = usedSuperiorFocus ? 2 : 0;

        if (useExpandedFocus) {
            staCostTotal = Math.ceil(staCostTotal / expandedFocusDivisor);
        } else {
            staCostTotal -= focusBonus;
        }
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

        if (newSta <= 0) {
            await applyStatusEffectToActor(this.uuid, 'stun');
            await this._createMagicRuleMessage(
                'WITCHER.Spell.StaminaCollapse',
                `<p>${game.i18n.format('WITCHER.Spell.StaminaCollapseDescription', {
                    cost: staCostTotal,
                    stamina: currentSta
                })}</p>`
            );
        }

        const inCombat = game.combat?.combatants.some(c => c.actor.id === this.id) ?? false;
        let currentVigor = Number(this.system.derivedStats.vigor.value) || 0;
        
        // Fuori dal combattimento assumiamo che il Vigore sia sempre al massimo per comodità
        if (!inCombat) {
            currentVigor = Number(this.system.derivedStats.vigor.max) || 0;
        }

        const overexertion = Math.max(staCostTotal - currentVigor, 0);
        const newVigor = Math.max(currentVigor - staCostTotal, 0);

        await this.update({
            'system.derivedStats.sta.value': Math.max(newSta, 0),
            'system.derivedStats.vigor.value': newVigor
        });

        const staCostParts = [`${origStaCost}`];

        if (useExpandedFocus) {
            staCostParts.push(`/ ${expandedFocusDivisor} ${game.i18n.localize('WITCHER.Spell.ExpandedMagic')}`);
        } else if (focusBonus > 0) {
            staCostParts.push(`- ${focusBonus} ${game.i18n.localize('WITCHER.Actor.focus.name')}`);
        }

        if (isExtraAttack) {
            staCostParts.push(`+ 3 ${game.i18n.localize('WITCHER.Dialog.attackExtra')}`);
        }

        let staCostDisplay = staCostParts.join(' ');
        if (staCostParts.length > 1 || staCostTotal !== origStaCost || useMinimalStaCost) {
            staCostDisplay += ` = ${staCostTotal}`;
        }
        if (useMinimalStaCost) {
            staCostDisplay += ` (${game.i18n.localize('WITCHER.MinValue')})`;
        }
        templateInfo.staCostDisplay = staCostDisplay;
        templateInfo.focusSuperiorBonus = focusSuperiorBonus;

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
        templateInfo.magicTarget = this._getMagicTargetInfo(spellItem);

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
            const locationModifier = Number(touchedLocation.modifier) || 0;
            if (locationModifier !== 0) {
                rollFormula += !displayRollDetails
                    ? `${locationModifier}`
                    : `${locationModifier}[${touchedLocation.alias}]`;
            }
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
                damage.heal = this.calcStaminaMulti(origStaCost, damage.heal);
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
            defenseOptions: spellItem.system.defenseOptions,
            attackRollBonus: focusSuperiorBonus
        });

        let config = new RollConfig({ showResult: false });
        const magicRollThreshold = this._getMagicRollThreshold(spellItem, templateInfo.magicTarget);
        if (magicRollThreshold >= 0) {
            config.threshold = magicRollThreshold + focusSuperiorBonus;
        }

        let roll = await extendedRoll(rollFormula, messageData, config);
        await roll.toMessage(messageData);

        if (overexertion > 0) {
            await this._resolveMagicOverexertion(spellItem, overexertion, staCostTotal, currentVigor);
        }

        const magicalFumble = roll.options.fumble
            ? await this._resolveMagicalFumble(spellItem, roll, { usedFocus })
            : null;
        const rollMeetsThreshold = roll.options.success !== false;

        spellItem.system.createSpellVisuals?.(roll, damage, { stamina: origStaCost });

        if (rollMeetsThreshold && (!roll.options.fumble || magicalFumble?.spellTakesEffect)) {
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

    async _rollExpandedMagicCheck(expandedMagicSkill) {
        if (!expandedMagicSkill) return null;

        return this.doProfessionSkillRoll(expandedMagicSkill, {
            threshold: 16,
            showResult: false,
            thresholdDesc: 'WITCHER.Spell.ExpandedMagicCheck',
            messageOnSuccess: game.i18n.localize('WITCHER.Spell.ExpandedMagicSuccess'),
            messageOnFailure: game.i18n.localize('WITCHER.Spell.ExpandedMagicFailure')
        });
    },

    _getExpandedMagicSkill() {
        const profession = this.getList?.('profession')?.[0];
        const normalizedProfessionName = String(profession?.name ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();

        if (!['mago', 'mage'].includes(normalizedProfessionName)) return null;

        const expandedMagicSkill =
            this.findSkillWithName?.('Magia Ampliata')?.skill ??
            this.findSkillWithName?.('Expanded Magic')?.skill ??
            null;

        return Number(expandedMagicSkill?.level ?? 0) > 0 ? expandedMagicSkill : null;
    },

    _getEquippedItemFocusInfo(item) {
        if (!item?.system) return null;

        const isEquippedWeapon = item.type === 'weapon' && item.system.equipped;
        const isEquippedMagicItem = item.type === 'valuable' && item.system.equipped && !item.system.isStored;
        if (!isEquippedWeapon && !isEquippedMagicItem) return null;

        return this._parseItemFocusInfo(item);
    },

    _parseItemFocusInfo(item) {
        const effectNames = item.system.damageProperties?.effects?.map(effect => effect.name).join(' ') ?? '';
        const focusText = [
            item.system.effects,
            item.system.effect,
            item.system.description,
            effectNames
        ]
            .filter(Boolean)
            .join(' ');

        const focusMatch = focusText.match(/\bFocus\s*\(?\s*(\d+)\s*\)?/i);
        if (!focusMatch) return this._inferKnownItemFocusInfo(item);

        return {
            value: Number(focusMatch[1]) || 0,
            superior: /\bFocus\s*(Sup\.?|Superiore|Superior)/i.test(focusText)
        };
    },

    _inferKnownItemFocusInfo(item) {
        const focusByName = {
            'amuleto con gemma': { value: 3, superior: false },
            'amuleto incantato': { value: 2, superior: false },
            'amuleto incantato 1 incantesimo': { value: 2, superior: false },
            'amuleto incantato 2 incantesimi': { value: 2, superior: false },
            'amuleto incantato 3 incantesimi': { value: 2, superior: false },
            'amuleto incantato 4 incantesimi': { value: 2, superior: false },
            'amuleto semplice': { value: 1, superior: false },
            'bacchetta della succube': { value: 5, superior: true },
            'bastone': { value: 1, superior: false },
            'bastone con cristallo': { value: 3, superior: true },
            'bastone da passeggio elfico': { value: 3, superior: true },
            'bastone del vincolo': { value: 3, superior: true },
            'bastone di ferro': { value: 2, superior: false },
            'bastone gnomesco': { value: 3, superior: false },
            'bastone uncinato': { value: 1, superior: false }
        };

        const normalizedName = String(item?.name ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        return focusByName[normalizedName] ?? null;
    },

    _doesSuperiorFocusApply(spellItem) {
        const system = spellItem.system ?? {};
        if (system.causeDamages || String(system.damage ?? '').trim()) return true;
        if (Array.isArray(system.defenseOptions) && system.defenseOptions.length > 0) return true;
        if (Number(system.targetDc) > 0 || Number(system.difficultyCheck) > 0) return true;
        if (system.targetMode && system.targetMode !== 'none' && system.targetMode !== 'area') return true;

        const spellText = [
            spellItem.name,
            system.class,
            system.domain,
            system.effect,
            system.description
        ]
            .filter(Boolean)
            .join(' ');

        return /\billus/i.test(spellText);
    },

    _getMagicTargetInfo(spellItem) {
        const system = spellItem.system ?? {};
        const mode = system.targetMode;
        if (!mode) return null;

        const info = {
            modeLabel: this._getMagicTargetModeLabel(mode),
            calculatedDc: -1,
            entries: [],
            notes: []
        };

        const fixedDc = Number(system.targetDc) || 0;
        if (fixedDc > 0 && mode !== 'targetStat') {
            if (mode === 'fixedDc') {
                info.calculatedDc = fixedDc;
            }

            info.entries.push({
                label: game.i18n.localize('WITCHER.Spell.TargetDc'),
                value: fixedDc
            });
        }

        if (mode === 'targetStat') {
            this._addTargetStatDifficultyInfo(info, system);
        }

        if (mode === 'area' || system.areaShape || system.areaSize) {
            if (system.areaShape) {
                info.entries.push({
                    label: game.i18n.localize('WITCHER.Spell.AreaShape'),
                    value: this._getMagicAreaShapeLabel(system.areaShape)
                });
            }

            if (system.areaSize) {
                info.entries.push({
                    label: game.i18n.localize('WITCHER.Spell.AreaSize'),
                    value: system.areaSize
                });
            }
        }

        if (mode === 'gmDc') {
            info.notes.push(game.i18n.localize('WITCHER.Spell.Target.RequiresGmDc'));
        }

        if (mode === 'manual') {
            info.notes.push(game.i18n.localize('WITCHER.Spell.Target.RequiresManualResolution'));
        }

        if (mode === 'area') {
            info.notes.push(game.i18n.localize('WITCHER.Spell.Target.AreaDefenseReminder'));
        }

        return info;
    },

    _addTargetStatDifficultyInfo(info, system) {
        const stat = system.targetStat;
        const multiplier = Number(system.targetMultiplier) || 0;
        const statLabel = this._getMagicTargetStatLabel(stat);
        const selectedTarget = this._getSelectedMagicTargetActor();

        info.entries.push({
            label: game.i18n.localize('WITCHER.Spell.TargetStat'),
            value: statLabel
        });

        if (multiplier > 0) {
            info.entries.push({
                label: game.i18n.localize('WITCHER.Spell.TargetMultiplier'),
                value: multiplier
            });
        }

        if (!stat || multiplier <= 0) {
            info.notes.push(game.i18n.localize('WITCHER.Spell.Target.MissingTargetStatData'));
            return;
        }

        if (!selectedTarget) {
            info.notes.push(game.i18n.localize('WITCHER.Spell.Target.SelectTargetForCalculatedDc'));
            return;
        }

        const targetStat = selectedTarget.system?.stats?.[stat];
        const statValue = Number(targetStat?.max ?? targetStat?.value) || 0;
        if (statValue <= 0) {
            info.notes.push(game.i18n.format('WITCHER.Spell.Target.TargetStatUnavailable', {
                target: selectedTarget.name,
                stat: statLabel
            }));
            return;
        }

        info.entries.push({
            label: game.i18n.localize('WITCHER.Spell.Target.CalculatedDc'),
            value: `${statValue * multiplier} (${selectedTarget.name}: ${statValue} x ${multiplier})`
        });
        info.calculatedDc = statValue * multiplier;
    },

    _getMagicRollThreshold(spellItem, magicTarget) {
        if (!magicTarget || magicTarget.calculatedDc < 0) return -1;

        const targetMode = spellItem.system?.targetMode;
        if (targetMode === 'targetStat') return magicTarget.calculatedDc;
        if (spellItem.type === 'ritual' && targetMode === 'fixedDc') return magicTarget.calculatedDc;

        return -1;
    },

    _getSelectedMagicTargetActor() {
        const targets = Array.from(game.user?.targets ?? []);
        if (targets.length !== 1) return null;
        return targets[0]?.actor ?? null;
    },

    _getMagicTargetModeLabel(mode) {
        const labelKey = `WITCHER.Spell.TargetMode.${mode}`;
        const label = game.i18n.localize(labelKey);
        return label === labelKey ? mode : label;
    },

    _getMagicTargetStatLabel(stat) {
        const labelKey = CONFIG.WITCHER.statMap?.[stat]?.label ?? CONFIG.WITCHER.statMap?.[stat]?.labelShort;
        return labelKey ? game.i18n.localize(labelKey) : stat;
    },

    _getMagicAreaShapeLabel(shape) {
        const shapeLabels = {
            circle: 'WITCHER.Spell.Circle',
            cone: 'WITCHER.Spell.Cone',
            line: 'WITCHER.Spell.Line',
            ray: 'WITCHER.Spell.Ray',
            rect: 'WITCHER.Spell.Square',
            sphere: 'WITCHER.Spell.Sphere',
            manual: 'WITCHER.Spell.Manual'
        };
        const labelKey = shapeLabels[shape];
        return labelKey ? game.i18n.localize(labelKey) : shape;
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
