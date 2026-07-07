import { getRandomInt } from '../../scripts/helper.js';
import { applyActiveEffectToActorViaId } from '../../scripts/temporaryEffects/applyActiveEffect.js';
import { applyStatusEffectToActor } from '../../scripts/statusEffects/applyStatusEffect.js';

export let damageMixin = {
    async applyDamage(dialogData, totalDamage, damageObject, derivedStat, infoTotalDmg = totalDamage) {
        let shield = this.system.derivedStats.shield.value;
        let isMagicShield = this.getFlag('TheWitcherItaNewSystem', 'magicShield');

        if (!isMagicShield) {
            shield = 0;
        }

        if (totalDamage < shield) {
            await this.update({ 'system.derivedStats.shield.value': shield - totalDamage });

            let messageContent = `${game.i18n.localize('WITCHER.Damage.initial')}: <span class="error-display">${infoTotalDmg}</span><br />
                                ${game.i18n.localize('WITCHER.Damage.shield')}: <span class="error-display">${shield}</span><br />
                                ${game.i18n.localize('WITCHER.Damage.ToMuchShield')}
                                `;
            let messageData = {
                content: messageContent,
                speaker: ChatMessage.getSpeaker({ actor: this }),
                flags: this.getNoDamageFlags()
            };
            (ChatMessage.applyMode ?? ChatMessage.applyRollMode)(messageData, game.settings.get('core', 'rollMode'));
            ChatMessage.create(messageData);
            return;
        } else {
            if (isMagicShield && shield > 0) {
                await this.update({ 
                    'system.derivedStats.shield.value': 0,
                    'flags.TheWitcherItaNewSystem.magicShield': false
                });
            }

            if (shield > 0) {
                totalDamage -= shield;
                infoTotalDmg += ` - ${shield}[${game.i18n.localize('WITCHER.Damage.shield')}]`;
            }
        }

        if (this.system.category && damageObject.properties?.oilEffect === this.system.category) {
            totalDamage += 5;
            infoTotalDmg += `+5[${game.i18n.localize('WITCHER.Damage.oil')}]`;
        }

        if (damageObject.properties.damageToAllLocations) {
            await this.applyDamageToAllLocations(dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat);
        } else {
            await this.applyDamageToLocation(dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat);
        }

        damageObject.properties.effects
            ?.filter(effect => effect.statusEffect)
            .filter(effect => effect.applied)
            .forEach(effect => applyStatusEffectToActor(this.uuid, effect.statusEffect, damageObject.duration));

        if (damageObject.itemUuid) {
            applyActiveEffectToActorViaId(this.uuid, damageObject.itemUuid, 'applyOnDamage', damageObject.duration);
        }
    },

    async applyDamageToLocation(dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat) {
        let damageResult = await this.calculateDamageWithLocation(dialogData, damageObject, totalDamage, infoTotalDmg);

        if (damageResult.blockedBySp) {
            this.createDamageBlockedBySp(
                damageResult.infoTotalDmg,
                damageResult.displaySP,
                damageResult.infoAfterSPReduction
            );
            return;
        }

        this.createDamageResultMessage(damageResult);
        await this.updateDerivedStat(damageResult.totalDamage, derivedStat);
    },

    async applyDamageToAllLocations(dialogData, damage, totalDamage, infoTotalDmg, derivedStat) {
        let locations = this.getAllLocations().map(location => this.getLocationObject(location));

        let resultPromises = [];
        locations.forEach(location => {
            damage.location = location;

            resultPromises.push(this.calculateDamageWithLocation(dialogData, damage, totalDamage, infoTotalDmg));
        });

        let results = await Promise.all(resultPromises);

        let totalAppliedDamage = results.reduce((acc, result) => acc + Math.floor(result.totalDamage), 0);

        const messageTemplate = 'systems/TheWitcherItaNewSystem/templates/chat/damage/damageToAllLocations.hbs';
        const templateContext = {
            results,
            totalAppliedDamage
        };

        const content = await foundry.applications.handlebars.renderTemplate(messageTemplate, templateContext);
        const chatData = {
            content: content,
            ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
        };

        (ChatMessage.applyMode ?? ChatMessage.applyRollMode)(chatData, game.settings.get('core', 'rollMode'));
        let message = await ChatMessage.create(chatData);

        await this.updateDerivedStat(totalAppliedDamage, derivedStat);
    },

    async updateDerivedStat(damage, derivedStat) {
        damage = Math.floor(damage);
        //first subtract from temp health
        if (derivedStat == 'hp') {
            let tempHpArray = this.system.combatEffects.temporaryEffects.temporaryHp;
            for (let tempHp of tempHpArray) {
                if (tempHp.value < damage) {
                    damage -= tempHp.value;
                    tempHp.value = 0;
                } else {
                    tempHp.value -= damage;
                    damage = 0;
                }
            }
            await this.update({
                'system.combatEffects.temporaryEffects.temporaryHp': tempHpArray
            });
        }

        const currentValue = this.system.derivedStats[derivedStat].value;
        const newValue = currentValue - damage;
        await this.update({
            [`system.derivedStats.${derivedStat}.value`]: newValue
        });

        if (derivedStat === 'hp') {
            if (newValue <= 0 && !this.statuses.has('dead')) {
                await this.toggleStatusEffect('dead', { overlay: true, active: true });
            } else if (newValue > 0 && this.statuses.has('dead')) {
                await this.toggleStatusEffect('dead', { overlay: true, active: false });
            }
        }
    },

    async calculateDamageWithLocation(enemyData, damage, totalDamage, infoTotalDmg) {
        let properties = damage.properties;
        let location = damage.location;

        let locationArmor = this.getLocationArmor(location, properties);
        let armorSet = locationArmor.armorSet;
        let totalSP = locationArmor.totalSP;
        let displaySP = locationArmor.displaySP;

        if (properties.improvedArmorPiercing) {
            totalSP = Math.ceil(totalSP / 2);
            // We use totalSP string because displaySP is now a complex formatted string with names
            displaySP = `${totalSP} (${game.i18n.localize('WITCHER.Damage.halved')})`;
        }

        let silverDamage = 0;

        if (game.settings.get('TheWitcherItaNewSystem', 'silverTrait')) {
            if (properties?.silverTrait) {
                silverDamage = totalDamage;
                totalDamage = 0;
            }
        } else {
            if (properties?.silverDamage && enemyData?.resistNonSilver) {
                let multi = damage.strike === 'strong' ? '*2' : '';
                let silverRoll = await new Roll(damage.properties.silverDamage + multi).evaluate();
                silverDamage = silverRoll.total;
                infoTotalDmg += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
            }
        }

        totalDamage -= totalSP < 0 ? 0 : totalSP;
        if (totalDamage < 0) {
            silverDamage = silverDamage + totalDamage > 0 ? silverDamage + totalDamage : 0;
        }

        let infoAfterSPReduction = totalDamage < 0 ? 0 : totalDamage;
        if (silverDamage) {
            infoAfterSPReduction += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
        }

        let spDamage = await this.applyAlwaysSpDamage(location, properties, armorSet);

        if (totalDamage <= 0 && silverDamage <= 0) {
            return {
                blockedBySp: true,
                totalDamage: 0,
                infoTotalDmg,
                displaySP,
                infoAfterSPReduction,
                location,
                spDamage
            };
        }

        let flatDamageMod = this.getFlatDamageMod(damage);

        totalDamage = this.calculateArmorResistances(totalDamage, damage, armorSet);

        let damageTypeConfig = CONFIG.WITCHER.damageTypes.find(type => type.value === damage.type);
        
        let itemSource = damage.item?.system?.source;
        let isImmune = this.system.automatedImmunities?.includes(damage.type) || (itemSource && this.system.automatedImmunities?.includes(itemSource)) || enemyData?.isImmune;
        let isResistant = this.system.automatedResistances?.includes(damage.type) || (itemSource && this.system.automatedResistances?.includes(itemSource)) || enemyData?.isResistant;
        let isVulnerable = this.system.automatedVulnerabilities?.includes(damage.type) || (itemSource && this.system.automatedVulnerabilities?.includes(itemSource)) || enemyData?.isVulnerable;

        if (isImmune) {
            totalDamage = 0;
            silverDamage = 0;
        } else {
            //Enemy is suspectible to silver
            if (
                (enemyData?.resistNonSilver && !properties?.silverDamage && !damageTypeConfig?.likeSilver) ||
                (enemyData?.resistNonMeteorite && !properties?.isMeteorite && !damageTypeConfig?.likeMeteorite)
            ) {
                totalDamage = Math.floor(0.5 * totalDamage);
            }

            // Automated general resistance
            if (isResistant) {
                totalDamage = Math.floor(0.5 * totalDamage);
                silverDamage = Math.floor(0.5 * silverDamage);
            }

            //Enemy is not suspectible to silver
            if (
                game.settings.get('TheWitcherItaNewSystem', 'silverTrait') &&
                !enemyData?.resistNonSilver &&
                properties.silverTrait
            ) {
                silverDamage = Math.floor(0.5 * silverDamage);
            }

            if (isVulnerable) {
                totalDamage *= 2;
                silverDamage *= 2;
            }
        }

        let infoAfterResistance = totalDamage;
        if (silverDamage) {
            infoAfterResistance += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
        }

        totalDamage = Math.max(Math.floor(location.locationFormula * totalDamage), 0);
        silverDamage = Math.max(Math.floor(location.locationFormula * silverDamage), 0);
        let infoAfterLocation = totalDamage;
        if (flatDamageMod) {
            infoAfterLocation += `+${location.locationFormula * flatDamageMod}[${game.i18n.localize('WITCHER.Damage.activeEffect')}]`;
        }

        if (silverDamage) {
            infoAfterLocation += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
            totalDamage += silverDamage;
        }

        spDamage += await this.applySpDamage(location, properties, armorSet);

        return {
            totalDamage,
            infoTotalDmg,
            displaySP,
            properties,
            infoAfterSPReduction,
            infoAfterLocation,
            infoAfterResistance,
            totalDamage,
            spDamage,
            location
        };
    },

    async createDamageBlockedBySp(infoTotalDmg, displaySP, infoAfterSPReduction) {
        let messageContent = `${game.i18n.localize('WITCHER.Damage.initial')}: <span class="error-display">${infoTotalDmg}</span><br />
        ${game.i18n.localize('WITCHER.Damage.totalSP')}: <span class="error-display">${displaySP}</span><br />
        ${game.i18n.localize('WITCHER.Damage.afterSPReduct')} <span class="error-display">${infoAfterSPReduction}</span><br /><br />
        ${game.i18n.localize('WITCHER.Damage.NotEnough')}
        `;

        let messageData = {
            content: messageContent,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flags: this.getNoDamageFlags()
        };

        let rollResult = await new Roll('1').evaluate();
        (ChatMessage.applyMode ?? ChatMessage.applyRollMode)(messageData, game.settings.get('core', 'rollMode'));
        rollResult.toMessage(messageData);
    },

    async createDamageResultMessage(damageResult) {
        const messageTemplate = 'systems/TheWitcherItaNewSystem/templates/chat/damage/damageToLocation.hbs';

        const content = await foundry.applications.handlebars.renderTemplate(messageTemplate, damageResult);
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flags: this.getDamageFlags(),
            ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
        };

        (ChatMessage.applyMode ?? ChatMessage.applyRollMode)(chatData, game.settings.get('core', 'rollMode'));
        ChatMessage.create(chatData);
    },

    async applyCritDamage(crit) {
        this.applyDamage(
            null,
            crit.critdamage,
            {
                properties: { bypassesNaturalArmor: true, bypassesWornArmor: true },
                location: this.getCritDamageLocation(crit)
            },
            'hp'
        );
    },

    async applyBonusCritDamage(crit) {
        this.applyDamage(
            null,
            crit.bonusdamage,
            {
                properties: { bypassesNaturalArmor: true, bypassesWornArmor: true },
                location: this.getCritDamageLocation(crit)
            },
            'hp'
        );
    },

    getCritDamageLocation(crit) {
        const locationName = crit?.location?.name;
        const isKnownLocation = locationName && locationName !== 'random';
        const baseLocation = isKnownLocation ? this.getLocationObject(locationName) : null;
        const locationLabel = baseLocation?.alias || game.i18n.localize('WITCHER.Location.Random');

        return {
            name: 'criticalWound',
            alias: `${game.i18n.localize('WITCHER.CritWound.Header')}: ${locationLabel}`,
            locationFormula: 1,
            modifier: '+0'
        };
    },

    async applyCritWound(crit) {
        const immuneCategories = ['Specter', 'Elementa'];
        const isAnatomyLess = this.system.category && immuneCategories.includes(this.system.category);
        
        // Internal organ wounds that don't affect anatomy-less monsters
        const immuneWounds = [
            'foreignObject',
            'rupturedSpleen',
            'tornStomach',
            'suckingChestWound',
            'septicShock'
        ];

        // Special bonus damage table for anatomy-less monsters
        const anatomyLessBonusDamage = {
            simple: 5,
            complex: 10,
            difficult: 15,
            deadly: 20
        };

        let wound = null;
        let finalLocationName = crit.location.name;

        // Specter Leg Immunity: Re-roll if hit lands on a leg
        if (this.system.category === 'Specter' && finalLocationName.includes('Leg')) {
            const chatData = {
                content: `<div class="dice-roll"><div class="dice-result"><div class="dice-flavor">${game.i18n.localize('WITCHER.CritWound.SpecterLegImmune')}</div></div></div>`,
                speaker: ChatMessage.getSpeaker({ actor: this })
            };
            ChatMessage.create(chatData);
            
            // Re-roll location if it was a leg hit
            const locations = ['head', 'torso', 'rightArm', 'leftArm', 'torso', 'torso']; 
            finalLocationName = locations[Math.floor(Math.random() * locations.length)];
        }

        const CRIT_TABLE_MAPPING = {
            simple: {
                2: 'sprainedLeg', 3: 'sprainedLeg',
                4: 'sprainedArm', 5: 'sprainedArm',
                6: 'foreignObject', 7: 'foreignObject', 8: 'foreignObject',
                9: 'crackedRibs', 10: 'crackedRibs',
                11: 'disfiguringScar',
                12: 'crackedJaw'
            },
            complex: {
                2: 'fracturedLeg', 3: 'fracturedLeg',
                4: 'fracturedArm', 5: 'fracturedArm',
                6: 'brokenRibs', 7: 'brokenRibs', 8: 'brokenRibs',
                9: 'concussion', 
                10: 'rupturedSpleen',
                11: 'tornStomach',
                12: 'minorHeadWound'
            },
            difficult: {
                2: 'compoundLegFracture', 3: 'compoundLegFracture',
                4: 'compoundArmFracture', 5: 'compoundArmFracture',
                6: 'brokenRibs', 7: 'brokenRibs', 8: 'brokenRibs',
                9: 'suckingChestWound',
                10: 'suckingChestWound',
                11: 'suckingChestWound',
                12: 'damagedEye'
            },
            deadly: {
                2: 'dismemberedLeg', 3: 'dismemberedLeg',
                4: 'dismemberedArm', 5: 'dismemberedArm',
                6: 'septicShock', 7: 'septicShock', 8: 'septicShock',
                9: 'heartDamage', 10: 'heartDamage',
                11: 'septicShock',
                12: 'decapitated'
            }
        };

        const sev = crit.severity;
        if (crit.isTargeted) {
            // Targeted: 1d6 roll (1-4 Minor, 5-6 Major)
            let roll = await new Roll('1d6').evaluate();
            await roll.toMessage({ 
                flavor: `<b>${game.i18n.localize('WITCHER.CritWound.TargetedRoll')}</b>`,
                speaker: ChatMessage.getSpeaker({ actor: this })
            });
            const isMajor = roll.total >= 5;
            const loc = finalLocationName;

            if (loc === 'head') wound = isMajor ? CRIT_TABLE_MAPPING[sev][12] : CRIT_TABLE_MAPPING[sev][11];
            else if (loc === 'torso') wound = isMajor ? CRIT_TABLE_MAPPING[sev][9] : CRIT_TABLE_MAPPING[sev][6];
            else if (loc.includes('Arm')) wound = CRIT_TABLE_MAPPING[sev][4];
            else if (loc.includes('Leg')) wound = CRIT_TABLE_MAPPING[sev][2];
        } else {
            // Untargeted: 2d6 roll on the severity table
            let woundRoll = await new Roll('2d6').evaluate();
            await woundRoll.toMessage({ 
                flavor: `<b>${game.i18n.localize('WITCHER.CritWound.GeneralRoll')}</b>`,
                speaker: ChatMessage.getSpeaker({ actor: this })
            });
            wound = CRIT_TABLE_MAPPING[sev][woundRoll.total];
            // Update location based on wound config
            finalLocationName = CONFIG.WITCHER.Crit[wound].location[0];
        }

        if (!wound) return;

        // Check if the specific wound is one of the "internal organ" ones for anatomy-less monsters
        if (isAnatomyLess && immuneWounds.includes(wound)) {
            const specialDmg = anatomyLessBonusDamage[crit.severity];
            const chatData = {
                content: `
                    <div class="dice-roll">
                        <div class="dice-result">
                            <div class="dice-flavor">${game.i18n.localize('WITCHER.CritWound.AnatomyLessImmune')}</div>
                            <div class="dice-total" style="color: #ff4444;">+${specialDmg} ${game.i18n.localize('WITCHER.Context.applyBonusCritDmg')}</div>
                            <div class="dice-formula">${game.i18n.localize('WITCHER.CritWound.AnatomyLessDesc')}</div>
                        </div>
                    </div>`,
                speaker: ChatMessage.getSpeaker({ actor: this })
            };
            ChatMessage.create(chatData);
            return;
        }

        const critList = this.system.critWounds || [];
        critList.push({
            id: foundry.utils.randomID(),
            configEntry: wound,
            location: finalLocationName,
            mod: 'none',
            healingTime: this.calculateHealingTime(crit.severity),
            daysHealed: 0
        });
        this.update({ 'system.critWounds': critList });

        const woundLocation = this.getLocationObject(finalLocationName);
        const chatData = {
            content: `<div><b>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].label)}</b></div>
                <div>${game.i18n.localize('WITCHER.Armor.Location')}: <b>${woundLocation.alias}</b></div>
                <div>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].description)}</div>`,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
        };
        ChatMessage.create(chatData);
    },

    calculateHealingTime(severity) {
        if (severity === 'deadly') return 0; // Permanente

        const body = this.system.stats.body.max;
        switch (severity) {
            case 'simple':
                return Math.max(8 - body, 1);
            case 'complex':
                return Math.max(12 - body, 1);
            case 'difficult':
                return Math.max(15 - body, 1);
            default:
                return 0;
        }
    }
};
