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
            bounty: new fields.NumberField({ initial: 0 }),
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

            dodgeBase: new fields.NumberField({ initial: 0, label: 'WITCHER.Defense.defenseOptions.dodge' }),
            repositionBase: new fields.NumberField({ initial: 0, label: 'WITCHER.Defense.defenseOptions.reposition' }),
            blockBase: new fields.NumberField({ initial: 0, label: 'WITCHER.Defense.defenseOptions.block' }),

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
            academicKnowledge: new fields.StringField({ initial: '' }),
            academicKnowledgeSkillValue: new fields.StringField({ initial: '' }),
            monsterLore: new fields.StringField({ initial: '' }),
            monsterLoreSkillValue: new fields.StringField({ initial: '' }),

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
        // Legacy flat Italian skills migration to grouped English schema
        if (source.skills && !source.skills.int && !source.skills.ref) {
            const legacySkills = source.skills;

            // Helper function to normalize keys for maximum robustness (ignores spaces, accents, special chars)
            const normalizeKey = (str) => {
                return str.toLowerCase()
                    .replace(/à/g, 'a')
                    .replace(/é/g, 'e')
                    .replace(/è/g, 'e')
                    .replace(/ì/g, 'i')
                    .replace(/ò/g, 'o')
                    .replace(/ù/g, 'u')
                    .replace(/[\s\-_']+/g, '');
            };

            const skillMap = {
                // INT
                "accortezza": "int.awareness",
                "commercio": "int.business",
                "deduzione": "int.deduction",
                "istruzione": "int.education",
                "linguacomune": "int.commonsp",
                "linguantica": "int.eldersp",
                "nanico": "int.dwarven",
                "bestiario": "int.monster",
                "etichetta": "int.socialetq",
                "scaltrezza": "int.streetwise",
                "tattica": "int.tactics",
                "insegnamento": "int.teaching",
                "sopravvivenza": "int.wilderness",

                // REF
                "rissa": "ref.brawling",
                "eludere": "ref.dodge",
                "mischia": "ref.melee",
                "cavalcare": "ref.riding",
                "navigazione": "ref.sailing",
                "lamecorte": "ref.smallblades",
                "armiinasta": "ref.staffspear",
                "asta": "ref.staffspear",
                "scherma": "ref.swordsmanship",

                // WILL
                "coraggio": "will.courage",
                "intesserefatture": "will.hexweave",
                "intimidazione": "will.intimidation",
                "intimidire": "will.intimidation",
                "lanciareincantesimi": "will.spellcast",
                "resistereallamagia": "will.resistmagic",
                "resistereacoercizione": "will.resistcoerc",
                "officiarerituali": "will.ritcraft",

                // DEX
                "archi": "dex.archery",
                "atletica": "dex.athletics",
                "balestre": "dex.crossbow",
                "balestra": "dex.crossbow",
                "rapiditadimano": "dex.sleight",
                "nascondersi": "dex.stealth",

                // CRA
                "alchimia": "cra.alchemy",
                "manifattura": "cra.crafting",
                "camuffare": "cra.disguise",
                "primosoccorso": "cra.firstaid",
                "falsificazione": "cra.forgery",
                "scassinare": "cra.picklock",
                "costruiretrappole": "cra.trapcraft",

                // BODY
                "prestanza": "body.physique",
                "tempra": "body.endurance",

                // EMP
                "carisma": "emp.charisma",
                "inganno": "emp.deceit",
                "bellearti": "emp.finearts",
                "giocodazzardo": "emp.gambling",
                "eleganza": "emp.grooming",
                "sensibilita": "emp.perception",
                "autorita": "emp.leadership",
                "persuasione": "emp.persuasion",
                "esibirsi": "emp.performance",
                "seduzione": "emp.seduction"
            };

            const migratedSkills = { int: {}, ref: {}, dex: {}, body: {}, emp: {}, cra: {}, will: {} };
            let hasLegacyData = false;

            for (const [legacyKey, valueObj] of Object.entries(legacySkills)) {
                const normKey = normalizeKey(legacyKey);
                const newPath = skillMap[normKey];
                if (newPath) {
                    const [cat, skillKey] = newPath.split('.');
                    if (!migratedSkills[cat]) migratedSkills[cat] = {};
                    
                    let val = 0;
                    if (valueObj && typeof valueObj === 'object') {
                        val = valueObj.value || 0;
                    } else if (typeof valueObj === 'number') {
                        val = valueObj;
                    } else if (typeof valueObj === 'string') {
                        val = parseInt(valueObj) || 0;
                    }
                    
                    migratedSkills[cat][skillKey] = {
                        value: val,
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
