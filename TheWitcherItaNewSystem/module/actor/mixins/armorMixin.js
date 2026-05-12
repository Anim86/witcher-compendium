export let armorMixin = {
    getArmorEcumbrance() {
        let encumbranceModifier = -this.system.lifepathModifiers.ignoredArmorEncumbrance;
        let armors = this.items.filter(item => item.type == 'armor' && item.system.equipped);
        
        let totalEV = 0;
        let layerPenalties = 0;
        
        armors.forEach(item => {
            totalEV += item.system.encumb || 0;
            if (item.system.type === 'Medium') layerPenalties += 1;
            else if (item.system.type === 'Heavy') layerPenalties += 2;
        });

        return Math.max(encumbranceModifier + totalEV + layerPenalties, 0);
    },

    getLocationArmor(location, properties) {
        let spKey = location.name + 'Stopping';
        let equippedArmors = this.getList('armor').filter(a => a.system.equipped);
        
        // Filter armors that actually provide protection for this location
        let relevantArmors = equippedArmors.filter(a => (a.system[spKey] ?? 0) > 0 || a.system.type === 'Natural');

        let armorSet = this.getArmors(relevantArmors, location.name);
        
        let totalSP = 0;
        let displaySP = '';

        // Natural Armor (base stats of monster/character)
        let naturalBaseSP = 0;
        switch (location.name) {
            case 'head': naturalBaseSP = this.system.armorHead ?? 0; break;
            case 'torso':
            case 'rightArm':
            case 'leftArm': naturalBaseSP = this.system.armorUpper ?? 0; break;
            case 'rightLeg':
            case 'leftLeg': naturalBaseSP = this.system.armorLower ?? 0; break;
            case 'tailWing': naturalBaseSP = this.system.armorTailWing ?? 0; break;
        }

        // Apply Natural Armor if not bypassed
        if (!properties.bypassesNaturalArmor) {
            totalSP += naturalBaseSP;
            if (naturalBaseSP > 0) displaySP += `${naturalBaseSP} [${game.i18n.localize('WITCHER.Armor.Natural')}]`;
        }

        // Calculate Worn Armor SP
        const wornResult = this.getStackedArmorSp(armorSet.worn, armorSet.natural, properties, spKey);
        
        if (wornResult.totalSP > 0) {
            totalSP += wornResult.totalSP;
            displaySP += (displaySP ? ' + ' : '') + wornResult.displaySP;
        }

        if (!displaySP) displaySP = '0';
        else displaySP = `${totalSP} (${displaySP})`;

        return {
            armorSet,
            totalSP,
            displaySP
        };
    },

    getArmors(armors, locationName) {
        let spKey = locationName + 'Stopping';
        let worn = armors.filter(a => a.system.type !== 'Natural');
        let natural = armors.find(a => a.system.type === 'Natural');

        let mediumCount = worn.filter(a => a.system.type === 'Medium').length;
        let heavyCount = worn.filter(a => a.system.type === 'Heavy').length;

        // Rule: Max 3 layers per location
        if (worn.length > 3) {
            ui.notifications.warn(`${game.i18n.localize('WITCHER.Armor.tooMuch')} (${locationName}: > 3 layers)`);
        }
        // Rule: Max 1 Heavy and 1 Medium
        if (mediumCount > 1 || heavyCount > 1) {
            ui.notifications.warn(`${game.i18n.localize('WITCHER.Armor.tooMuch')} (${locationName}: Max 1 Med/1 Heavy)`);
        }

        return { worn, natural };
    },

    getArmorSp(armorSet, spKey, properties) {
        // This is now handled inside getLocationArmor for better flow, 
        // but keeping it for compatibility if called elsewhere.
        return this.getStackedArmorSp(armorSet.worn, armorSet.natural, properties, spKey);
    },

    getStackedArmorSp(wornItems, naturalItem, properties, spKey) {
        let totalSP = 0;
        let displaySP = '';

        if (!properties.bypassesWornArmor && wornItems.length > 0) {
            // Create a temporary list of { name, sp }
            let itemValues = wornItems.map(a => ({
                name: a.name,
                sp: a.system[spKey] ?? 0
            })).filter(v => v.sp > 0);

            if (itemValues.length > 0) {
                // Sort descending to facilitate cascading bonus (Rule 2)
                itemValues.sort((a, b) => b.sp - a.sp);
                
                totalSP = itemValues[0].sp;
                displaySP = `${totalSP} [${itemValues[0].name}]`;

                for (let i = 1; i < itemValues.length; i++) {
                    let bonus = this.getArmorDiffBonus(totalSP, itemValues[i].sp);
                    totalSP += bonus;
                    if (bonus > 0) {
                        displaySP += ` + ${bonus} [${itemValues[i].name}]`;
                    }
                }
            }
        }

        const naturalItemSP = naturalItem?.system[spKey] ?? 0;
        if (naturalItemSP && !properties.bypassesNaturalArmor) {
            totalSP += naturalItemSP;
            displaySP += (displaySP ? ' + ' : '') + `${naturalItemSP} [${naturalItem.name}]`;
        }

        return { totalSP, displaySP };
    },

    getArmorDiffBonus(overArmor, underArmor) {
        if (underArmor <= 0 || overArmor <= 0) return 0;
        let diff = Math.abs(overArmor - underArmor);

        if (diff <= 4) return 5;
        if (diff <= 8) return 4;
        if (diff <= 14) return 3;
        if (diff <= 20) return 2;
        return 0;
    },

    calculateArmorResistances(totalDamage, damage, armorSet) {
        let properties = damage.properties;
        if (properties.armorPiercing || properties.improvedArmorPiercing) {
            return totalDamage;
        }

        let damageAfterResistances = totalDamage;

        // Rule 4: Resistances are maintained but not cumulative
        if (
            !properties.bypassesWornArmor &&
            armorSet.worn.some(a => a.system[damage.type])
        ) {
            damageAfterResistances = Math.floor(0.5 * totalDamage);
        }

        if (armorSet.natural?.system[damage.type] && !properties.bypassesNaturalArmor) {
            damageAfterResistances = Math.floor(0.5 * totalDamage);
        }

        let damageMulti = this.getMultiDamageMod(damage);
        damageAfterResistances = Math.floor(damageAfterResistances * damageMulti);

        return damageAfterResistances;
    },

    async applySpDamage(location, properties, armorSet) {
        if (properties.bypassesWornArmor) {
            return 0;
        }

        let spDamage = properties.ablating ? Math.floor((await new Roll('1d6/2+1').evaluate()).total) : 1;

        if (properties.crushingForce) {
            spDamage *= 2;
        }

        this.applySpDamageToItemArmor(armorSet, location, spDamage);
        this.applySpDamageToMonsterArmor(location, properties, spDamage);

        return spDamage;
    },

    async applyAlwaysSpDamage(location, properties, armorSet) {
        let spDamage = properties.spDamage ?? 0;

        this.applySpDamageToItemArmor(armorSet, location, spDamage);
        this.applySpDamageToMonsterArmor(location, properties, spDamage);

        return spDamage;
    },

    async applySpDamageToItemArmor(armorSet, location, spDamage) {
        for (let armor of armorSet.worn) {
            let currentSP = armor.system[location.name + 'Stopping'] - spDamage;
            armor.update({ [`system.${location.name}Stopping`]: Math.max(currentSP, 0) });
        }
        if (armorSet.natural) {
            let currentSP = armorSet.natural.system[location.name + 'Stopping'] - spDamage;
            armorSet.natural.update({ [`system.${location.name}Stopping`]: Math.max(currentSP, 0) });
        }
    },

    async applySpDamageToMonsterArmor(location, properties, spDamage) {
        if (properties.bypassesNaturalArmor) return;
        if (this.type != 'monster') return;

        switch (location.name) {
            case 'head':
                this.update({ [`system.armorHead`]: Math.max(this.system.armorHead - spDamage, 0) });
                break;
            case 'torso':
            case 'rightArm':
            case 'leftArm':
                this.update({ [`system.armorUpper`]: Math.max(this.system.armorUpper - spDamage, 0) });
                break;
            case 'rightLeg':
            case 'leftLeg':
                this.update({ [`system.armorLower`]: Math.max(this.system.armorLower - spDamage, 0) });
                break;
            case 'tailWing':
                this.update({ [`system.armorTailWing`]: Math.max(this.system.armorTailWing - spDamage, 0) });
                break;
        }
    },

    calculateArmorSP() {
        const locations = ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
        this.system.armorSP = {};
        for (let loc of locations) {
            this.system.armorSP[loc] = this.getLocationArmor({ name: loc }, {});
        }
    }
};
