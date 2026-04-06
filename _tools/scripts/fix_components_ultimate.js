const fs = require('fs');
const path = require('path');

const BASE = 'e:/AntigravitiProgetti/CompendioTheWitcher';
const SRC_DIR = path.join(BASE, '../src-packs');
const DATA_DIR = path.join(BASE, 'data');

const packsToFix = [
    'witcher-components',
    'witcher-alchemy'
];

function loadSubstanceData() {
    try {
        const p = path.join(DATA_DIR, 'raw_alchemy_substances.json');
        if (fs.existsSync(p)) {
            return JSON.parse(fs.readFileSync(p, 'utf-8'));
        }
    } catch (e) {
        console.error(`Error loading raw_alchemy_substances.json:`, e);
    }
    return [];
}

const rawSubstances = loadSubstanceData();

const componentMap = {
    'Vetriolo': 'vitriol',
    'Rebis': 'rebis',
    'Etere': 'aether',
    'Quebrith': 'quebrith',
    'Hydragenum': 'hydragenum',
    'Vermiglio': 'vermilion',
    'Sol': 'sol',
    'Caelum': 'caelum',
    'Fulgur': 'fulgur'
};

for (const pack of packsToFix) {
    const dir = path.join(SRC_DIR, pack);
    if (!fs.existsSync(dir)) continue;

    console.log(`Nuclear cleaning items in ${pack}...`);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(dir, file);
        const oldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        let type = "component"; // Document type
        let systemType = pack === 'witcher-alchemy' ? 'alchemical' : 'crafting-material';
        let substanceType = "";
        let rarity = "";
        let location = "";

        // Look for alchemy substance mapping
        let raw = rawSubstances.find(r => r.name === oldData.name);
        if (raw) {
            substanceType = componentMap[raw.element] || "";
            rarity = raw.rarity || "";
            location = raw.location || "";
        }

        // NUCLEAR: Minimum viable structure for ComponentData
        const newData = {
            _id: oldData._id,
            name: oldData.name,
            type: "component",
            img: oldData.img,
            system: {
                description: oldData.system.description || "",
                quantity: "1", // STRING, mandatory in CommonItemData
                weight: oldData.system.weight || 0,
                cost: oldData.system.cost || 0,
                sourcebook: oldData.system.sourcebook || "",
                type: systemType, // Internal filter type ('crafting-material' or 'alchemical')
                rarity: rarity,
                location: location,
                quantityObtainable: oldData.system.quantityObtainable || "",
                forage: oldData.system.forage || "",
                substanceType: substanceType // 'vitriol', 'rebis', etc.
            },
            effects: [],
            flags: {},
            _stats: {
                systemId: "TheWitcherTRPG",
                systemVersion: "v13.13.0",
                coreVersion: "13"
            }
        };

        fs.writeFileSync(filePath, JSON.stringify(newData, null, 4));
    }
}

console.log("Done generating ULTIMATE clean schema for all components!");

