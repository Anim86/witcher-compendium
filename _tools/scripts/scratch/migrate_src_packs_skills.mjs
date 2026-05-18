// Witcher Compendium Maintenance Tool: Skills Offline Migrator (Refined)
// VERSION: 1.1.0
// DESCRIPTION: Converts flat Italian legacy skills inside source JSON files into V14 English nested skills, even if empty nested objects exist.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script in _tools/scripts/scratch
const REPO_ROOT = path.resolve(__dirname, '../../../');
const TARGET_DIRS = [
    path.join(REPO_ROOT, '_tools', 'src-packs', 'BESTIARIO', 'witcher-monsters'),
    path.join(REPO_ROOT, '_tools', 'src-packs', 'BESTIARIO', 'witcher-characters'),
    path.join(REPO_ROOT, '_tools', 'src-packs', 'BESTIARIO', 'witcher-animals')
];

// Helper function to normalize keys
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

function migrateSkills(system) {
    if (!system.skills) return false;
    
    const legacySkills = system.skills;
    const categories = ['int', 'ref', 'dex', 'body', 'emp', 'cra', 'will'];
    
    // Check if there is any legacy flat key present
    let hasFlatLegacy = false;
    for (const legacyKey of Object.keys(legacySkills)) {
        if (skillMap[normalizeKey(legacyKey)]) {
            hasFlatLegacy = true;
            break;
        }
    }
    
    if (!hasFlatLegacy) return false;

    // Initialize or keep existing migrated structure
    const migratedSkills = {
        int: {},
        ref: {},
        dex: {},
        body: {},
        emp: {},
        cra: {},
        will: {}
    };
    
    // If the file already has some nested structure, let's preserve any already migrated values!
    for (const cat of categories) {
        if (legacySkills[cat] && typeof legacySkills[cat] === 'object') {
            migratedSkills[cat] = { ...legacySkills[cat] };
        }
    }

    let changed = false;
    for (const [legacyKey, valueObj] of Object.entries(legacySkills)) {
        const normKey = normalizeKey(legacyKey);
        const newPath = skillMap[normKey];
        if (newPath) {
            const [cat, skillKey] = newPath.split('.');
            
            let val = 0;
            if (valueObj && typeof valueObj === 'object') {
                val = valueObj.value || 0;
            } else if (typeof valueObj === 'number') {
                val = valueObj;
            } else if (typeof valueObj === 'string') {
                val = parseInt(valueObj) || 0;
            }
            
            // Only migrate if not already present or if value in root is greater
            if (!migratedSkills[cat][skillKey] || (migratedSkills[cat][skillKey].value === 0 && val > 0)) {
                migratedSkills[cat][skillKey] = {
                    value: val,
                    isVisible: true
                };
                changed = true;
            }
        }
    }

    if (changed) {
        // Clean up any top-level legacy keys from skills object
        system.skills = migratedSkills;
        return true;
    }

    return false;
}

function processDirectory(dir) {
    console.log(`\n📁 Processing directory: ${dir}`);
    if (!fs.existsSync(dir)) {
        console.warn(`   ⚠️ Directory does not exist: ${dir}. Skipping.`);
        return;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    let migratedCount = 0;

    for (const file of files) {
        const filePath = path.join(dir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
            const actor = JSON.parse(content);

            if (actor.type === 'monster' && actor.system) {
                const changed = migrateSkills(actor.system);
                if (changed) {
                    fs.writeFileSync(filePath, JSON.stringify(actor, null, 4), 'utf8');
                    console.log(`   ✅ Migrated: ${file} (${actor.name})`);
                    migratedCount++;
                }
            }
        } catch (e) {
            console.error(`   ❌ Error processing file ${file}: ${e.message}`);
        }
    }
    console.log(`   ✨ Completed directory: migrated ${migratedCount} / ${files.length} files.`);
}

function main() {
    console.log("🚀 Starting offline skill migration for actor source packs...");
    for (const dir of TARGET_DIRS) {
        processDirectory(dir);
    }
    console.log("\n🎉 Global offline migration complete!");
}

main();
