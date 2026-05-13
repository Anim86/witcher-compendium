import CommonActorData from './commonActorData.js';

const fields = foundry.data.fields;

export default class MonsterData extends CommonActorData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            category: new fields.StringField({ initial: 'Humanoid' }),
            monsterType: new fields.StringField({ initial: '' }),
            threat: new fields.StringField({ initial: '' }),
            difficulty: new fields.StringField({ initial: '' }),
            complexity: new fields.StringField({ initial: '' }),
            size: new fields.StringField({ initial: '' }),
            bounty: new fields.NumberField({ initial: 0 }),
            biography: new fields.HTMLField({ initial: '' }),
            description: new fields.HTMLField({ initial: '' }),
            vulnerability: new fields.StringField({ initial: '' }),
            resistantNonSilver: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Monster.resistantNonSilver'
            }),
            resistantNonMeteorite: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Monster.resistantNonMeteorite'
            }),

            armorHead: new fields.NumberField({ initial: 0 }),
            armorUpper: new fields.NumberField({ initial: 0 }),
            armorLower: new fields.NumberField({ initial: 0 }),
            armorTailWing: new fields.NumberField({ initial: 0 }),
            regeneration: new fields.NumberField({ initial: 0, label: 'WITCHER.Monster.regeneration' }),

            resistances: new fields.StringField({ initial: '' }),
            immunities: new fields.StringField({ initial: '' }),
            statusEffectImmunities: new fields.ArrayField(new fields.StringField({ initial: '' })),
            susceptibilities: new fields.StringField({ initial: '' }),
            senses: new fields.StringField({ initial: '' }),

            height: new fields.StringField({ initial: '' }),
            weight: new fields.StringField({ initial: '' }),
            environment: new fields.StringField({ initial: '' }),
            intelligence: new fields.StringField({ initial: '' }),
            organization: new fields.StringField({ initial: '' }),

            common: new fields.StringField({ initial: '' }),
            commonSkillValue: new fields.StringField({ initial: '' }),
            showCommonerSuperstition: new fields.BooleanField({
                initial: true,
                label: 'WITCHER.Monster.CommonerSuperstition'
            }),
            academicKnowledge: new fields.StringField({ initial: '' }),
            academicKnowledgeSkillValue: new fields.StringField({ initial: '' }),
            showAcademicKnowledge: new fields.BooleanField({
                initial: true,
                label: 'WITCHER.Monster.AcademicKnowledge'
            }),
            monsterLore: new fields.StringField({ initial: '' }),
            monsterLoreSkillValue: new fields.StringField({ initial: '' }),
            showMonsterLore: new fields.BooleanField({ initial: true, label: 'WITCHER.Monster.WitcherKnowledge' }),

            customStat: new fields.BooleanField({ initial: false, label: 'WITCHER.Monster.CustomHP/STA' }),
            addMeleeBonus: new fields.BooleanField({ initial: false, label: 'WITCHER.Monster.addMeleeBonus' }),
            dontAddAttr: new fields.BooleanField({ initial: false, label: 'WITCHER.Monster.dontAddAttr' }),
            hasTailWing: new fields.BooleanField({ initial: false, label: 'WITCHER.Monster.hasTailWing' })
        };
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();

        // Ensure all skills are visible for monsters so GMs can edit them easily
        const categories = ['int', 'ref', 'dex', 'body', 'emp', 'cra', 'will'];
        for (const cat of categories) {
            const skills = this.skills[cat];
            if (!skills) continue;
            for (const skillName in skills) {
                const skill = skills[skillName];
                if (skill && typeof skill === 'object') {
                    skill.isVisible = true;
                }
            }
        }
    }

    /** @override */
    static migrateData(source) {
        // Promote detail fields to root system
        if (source.details) {
            const d = source.details;
            const mapping = {
                monsterType: 'monsterType',
                threat: 'threat',
                reward: 'bounty',
                difficulty: 'difficulty',
                senses: 'senses',
                size: 'size',
                intelligence: 'intelligence',
                biography: 'biography',
                vulnerability: 'vulnerability',
                environment: 'environment',
                organization: 'organization',
                monsterLore: 'monsterLore',
                academicKnowledge: 'academicKnowledge',
                common: 'common'
            };

            for (const [oldKey, newKey] of Object.entries(mapping)) {
                if (d[oldKey] !== undefined && source[newKey] === undefined) {
                    source[newKey] = d[oldKey];
                }
            }
        }

        // Legacy flat Italian skills migration to grouped English schema
        if (source.skills && !source.skills.int && !source.skills.ref) {
            const legacySkills = source.skills;
            const skillMap = {
                "accortezza": "int.awareness",
                "atletica": "dex.athletics",
                "coraggio": "will.courage",
                "eludere": "ref.dodge",
                "mischia": "ref.melee",
                "nascondersi": "dex.stealth",
                "rissa": "ref.brawling",
                "sopravvivenza": "int.wildernessSurvival",
                "tempra": "body.physique",
                "intimidazione": "will.intimidation",
                "persuasione": "emp.persuasion",
                "inganno": "emp.deceit"
            };

            const migratedSkills = { int: {}, ref: {}, dex: {}, body: {}, emp: {}, cra: {}, will: {} };
            let hasLegacyData = false;

            for (const [legacyKey, newPath] of Object.entries(skillMap)) {
                if (legacySkills[legacyKey]) {
                    const [cat, skillKey] = newPath.split('.');
                    if (!migratedSkills[cat]) migratedSkills[cat] = {};
                    migratedSkills[cat][skillKey] = {
                        value: legacySkills[legacyKey].value || 0,
                        isVisible: true
                    };
                    hasLegacyData = true;
                }
            }

            if (hasLegacyData) {
                source.skills = migratedSkills;
            }
        }

        return super.migrateData(source);
    }
}
