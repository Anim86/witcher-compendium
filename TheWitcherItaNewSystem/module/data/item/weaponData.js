import { migrateDamageProperties } from '../migrations/damagePropertiesMigration.js';
import CommonItemData from './commonItemData.js';
import damageProperties from './templates/combat/damagePropertiesData.js';
import weaponType from './templates/weaponTypeData.js';
import { associatedDiagramUuid, unwrapAssociatedDiagram } from './templates/associatedDiagramData.js';
import defenseOptions from './templates/combat/defenseOptionsData.js';
import attackOptions from './templates/combat/attackOptionsData.js';
import DefenseProperties from './templates/combat/defensePropertiesData.js';

const fields = foundry.data.fields;

function normalizeWeaponHands(value) {
    const normalized = String(value ?? 'none').trim().toLowerCase();
    const hands = {
        '': 'none',
        0: 'none',
        none: 'none',
        1: 'one',
        one: 'one',
        left: 'one',
        right: 'one',
        2: 'two',
        two: 'two',
        both: 'two'
    };

    return hands[normalized] ?? value;
}

export default class WeaponData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            type: new fields.SchemaField(weaponType()),
            isAmmo: new fields.BooleanField({ initial: false }),
            category: new fields.StringField({ initial: '' }),

            conceal: new fields.StringField({ initial: '' }),
            avail: new fields.StringField({ initial: '' }),
            hands: new fields.StringField({ initial: 'none' }),
            equipped: new fields.BooleanField({ initial: false }),

            reliability: new fields.NumberField({ initial: 0 }),
            reliabilityMax: new fields.NumberField({ initial: 0 }),

            damage: new fields.StringField({ initial: '' }),
            range: new fields.StringField({ initial: '' }),
            accuracy: new fields.NumberField({ initial: 0 }),
            rateOfFire: new fields.NumberField({ initial: 1 }),
            usingAmmo: new fields.BooleanField({ initial: false }),
            rollOnlyDmg: new fields.BooleanField({ initial: false }),

            enhancements: new fields.NumberField({ initial: 0 }),
            enhancementItemIds: new fields.ArrayField(new fields.StringField({ initial: '' })),

            ...attackOptions(),
            damageProperties: new fields.SchemaField(damageProperties()),
            ...defenseOptions(),
            defenseProperties: new fields.EmbeddedDataField(DefenseProperties),

            ...associatedDiagramUuid()
        };
    }

    get reliable() {
        return this.reliability;
    }

    set reliable(value) {
        this.reliability = value;
    }

    get maxReliability() {
        return this.reliabilityMax;
    }

    set maxReliability(value) {
        this.reliabilityMax = value;
    }

    isApplicableDefense(attack) {
        return this.defenseProperties.isApplicableDefense(attack);
    }

    createDefenseOption(attack) {
        return {
            ...this.defenseProperties.createDefenseOption(attack),
            skills: [
                this.meleeAttackSkill ?? this.rangedAttackSkill ?? this.spellAttackSkill ?? this.itemUseAttackSkill
            ]
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        let enhancementItemIds = this.enhancementItemIds;
        if (enhancementItemIds?.length > 0) {
            this.enhancementItems = [];

            let items = this.parent.actor.items;

            enhancementItemIds.forEach(itemId => {
                let item = items.get(itemId);
                if (item) {
                    this.enhancementItems.push({
                        name: item.name,
                        img: item.img,
                        system: item.system,
                        id: itemId
                    });
                }
            });
        }

        unwrapAssociatedDiagram(this);

        // Derive attack options and skills from category and range
        const rangeVal = (this.range || '').trim().toUpperCase();
        const isRanged = rangeVal !== '' && rangeVal !== 'N/A';

        if (isRanged) {
            this.attackOptions = new Set(['ranged']);
            
            // Map category to Dexterity (DEX) skill
            let skill = 'athletics'; // Default ranged skill (throwing, bombs, others)
            if (this.category === 'bow') {
                skill = 'archery';
            } else if (this.category === 'crossbow') {
                skill = 'crossbow';
            } else if (this.category && CONFIG.WITCHER?.weaponCategorySkills?.[this.category]) {
                const catSkill = CONFIG.WITCHER.weaponCategorySkills[this.category];
                if (CONFIG.WITCHER.rangedSkills.includes(catSkill)) {
                    skill = catSkill;
                }
            }
            this.rangedAttackSkill = skill;
            this.meleeAttackSkill = '';
        } else {
            this.attackOptions = new Set(['melee']);

            // Map category to Reflexes (REF) skill
            let skill = 'melee'; // Default melee skill
            if (this.category === 'sword') {
                skill = 'swordsmanship';
            } else if (this.category === 'smallBlade') {
                skill = 'smallblades';
            } else if (this.category === 'polearm') {
                skill = 'staffspear';
            } else if (this.category === 'brawling') {
                skill = 'brawling';
            } else if (this.category && CONFIG.WITCHER?.weaponCategorySkills?.[this.category]) {
                const catSkill = CONFIG.WITCHER.weaponCategorySkills[this.category];
                if (CONFIG.WITCHER.meleeSkills.includes(catSkill)) {
                    skill = catSkill;
                }
            }
            this.meleeAttackSkill = skill;
            this.rangedAttackSkill = '';
        }
    }

    isEnoughThrowable() {
        return this.isThrowable ? this.quantity > 0 : false;
    }

    /** @inheritdoc */
    static migrateData(source) {
        source.hands = normalizeWeaponHands(source.hands);

        if ('enhancementItems' in source) {
            source.enhancementItemIds = source.enhancementItemIds ?? [];
            source.enhancementItems.forEach(enhancement => {
                if (Object.keys(enhancement).length !== 0) {
                    source.enhancementItemIds.push(enhancement._id);
                }
            });
        }

        this.effects?.forEach(effect => (effect.percentage = parseInt(effect.percentage)));

        if ('reliable' in source) {
            source.reliability = source.reliability ?? source.reliable;
            delete source.reliable;
        }
        if ('maxReliability' in source) {
            source.reliabilityMax = source.reliabilityMax ?? source.maxReliability;
            delete source.maxReliability;
        }

        // Migration for reach -> range
        if ('reach' in source) {
            source.range = source.range || source.reach;
        }

        // Migration for reliability object
        if (source.reliability && typeof source.reliability === 'object') {
            source.reliabilityMax = source.reliability.max;
            source.reliability = source.reliability.value;
        }

        // Migration for attackSkill and guessing defaults
        if (source.attackSkill && !source.attackOptions) {
            const skill = source.attackSkill;
            source.attackOptions = source.attackOptions || [];
            if (CONFIG.WITCHER.meleeSkills.includes(skill)) {
                source.attackOptions.push('melee');
                source.meleeAttackSkill = source.meleeAttackSkill || skill;
            }
            if (CONFIG.WITCHER.rangedSkills.includes(skill)) {
                source.attackOptions.push('ranged');
                source.rangedAttackSkill = source.rangedAttackSkill || skill;
            }
        }

        // Guessing defaults for items that have NO skill info at all
        if (
            !source.attackSkill &&
            (!source.attackOptions || (source.attackOptions instanceof Array && source.attackOptions.length === 0))
        ) {
            // Check if it has range info
            if (source.range && source.range !== 'N/A' && source.range !== '') {
                source.attackOptions = ['ranged'];
                source.rangedAttackSkill = source.rangedAttackSkill || 'archery';
            } else {
                // Default to melee for weapons
                source.attackOptions = ['melee'];
                source.meleeAttackSkill = 'swordsmanship'; // Most common fallback
            }
        }

        migrateDamageProperties(source);

        return super.migrateData(source);
    }
}
