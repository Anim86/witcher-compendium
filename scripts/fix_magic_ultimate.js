const fs = require('fs');
const path = require('path');

const BASE = 'e:/AntigravitiProgetti/CompendioTheWitcher';
const SRC_DIR = path.join(BASE, 'witcher-compendium/src-packs');
const DATA_DIR = path.join(BASE, 'data');

const packsToFix = [
    'witcher-spells',
    'witcher-spells-chaos',
    'witcher-rituals',
    'witcher-rituals-chaos'
];

function loadRawData() {
    const all = [];
    const files = ['raw_magic.json', 'raw_chaos_magic.json', 'raw_rituals_hexes.json', 'raw_chaos_rituals.json'];
    for (const f of files) {
        try {
            const p = path.join(DATA_DIR, f);
            if (fs.existsSync(p)) {
                const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
                all.push(...data);
            }
        } catch (e) {
            console.error(`Error loading ${f}:`, e);
        }
    }
    return all;
}

const rawData = loadRawData();

function mapTier(tier) {
    if (!tier) return 'novice';
    const t = tier.toLowerCase();
    if (t.includes('novizio')) return 'novice';
    if (t.includes('esperto')) return 'journeyman';
    if (t.includes('maestro')) return 'master';
    if (t.includes('druido') || t.includes('predicatore') || t.includes('fanatico')) return 'novice';
    if (t.includes('mistico') || t.includes('prete') || t.includes('settario')) return 'journeyman';
    if (t.includes('ierofante') || t.includes('arciprete') || t.includes('zelota')) return 'master';
    return 'novice';
}

function mapClass(typeField) {
    if (!typeField) return 'Spells';
    const t = typeField.toLowerCase();
    if (t.includes('incantesimo')) return 'Spells';
    if (t.includes('invocazione')) return 'Invocations';
    if (t.includes('segno')) return 'Witcher';
    if (t.includes('dono')) return 'MagicalGift';
    if (t.includes('ritual')) return 'ritual';
    if (t.includes('hex') || t.includes('maledizione')) return 'hex';
    return 'Spells';
}

function mapSource(subtype) {
    if (!subtype) return "";
    const s = subtype.toLowerCase();
    if (s.includes('aria') || s.includes('air')) return "air";
    if (s.includes('terra') || s.includes('earth')) return "earth";
    if (s.includes('fuoco') || s.includes('fire')) return "fire";
    if (s.includes('acqua') || s.includes('water')) return "Water"; // Capitalized W in castSpellMixin.js
    if (s.includes('misto') || s.includes('mixed')) return "mixedElements";
    return "";
}

const defaultDamageProperties = {
    armorPiercing: false,
    improvedArmorPiercing: false,
    ablating: false,
    crushingForce: false,
    damageIsAblation: false,
    stun: 0,
    damageToAllLocations: false,
    bypassesWornArmor: false,
    bypassesNaturalArmor: false,
    defenseDifferenceMultiplier: false,
    defenseMultiplierCap: 5,
    variableDamage: false,
    effects: [],
    oilEffect: "",
    silverTrait: false,
    silverDamage: "",
    isMeteorite: false,
    isNonLethal: false
};

const defaultRegionProperties = {
    createRegionFromTemplate: false,
    behaviours: {
        tokenEnter: null,
        tokenTurnStart: null,
        tokenMoveWithin: null,
        tokenExit: null
    }
};

function extractDamage(effect) {
    if (!effect) return null;
    const m = effect.match(/(\d+d\d+([+-]\d+)?)/);
    return m ? m[1] : null;
}

for (const pack of packsToFix) {
    const dir = path.join(SRC_DIR, pack);
    if (!fs.existsSync(dir)) continue;

    console.log(`Nuclear cleaning items in ${pack}...`);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(dir, file);
        const oldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        let raw = rawData.find(r => r.name === oldData.name);
        if (!raw) {
            raw = rawData.find(r => oldData.name.startsWith(r.name) || r.name.startsWith(oldData.name));
        }

        const clazz = raw ? mapClass(raw.type) : (pack.includes('rituals') ? 'ritual' : 'Spells');
        const level = raw ? mapTier(raw.tier) : 'novice';
        const source = raw ? mapSource(raw.subtype) : (oldData.system.source || "");

        // NUCLEAR: Minimum viable structure
        const newData = {
            _id: oldData._id,
            name: oldData.name,
            type: "spell", // overwritten below
            img: oldData.img,
            system: {
                description: oldData.system.description || "",
                quantity: "1", // STRING, mandatory in CommonItemData
                weight: 0,
                cost: 0,
                sourcebook: oldData.system.sourcebook || "",
                class: clazz,
                level: level,
                source: source,
                stamina: (raw ? parseInt(raw.res) : 0) || 0,
                staminaIsVar: (raw && raw.res === 'Variabile'),
                effect: raw?.effect || oldData.system.effect || "",
                range: raw?.range || oldData.system.range || "",
                duration: raw?.duration || oldData.system.duration || "",
                defence: raw?.defense || oldData.system.defence || "",
                damageProperties: JSON.parse(JSON.stringify(defaultDamageProperties)),
                regionProperties: JSON.parse(JSON.stringify(defaultRegionProperties)),
                attackOptions: ["spell"],
                spellAttackSkill: "spellcast"
            },
            effects: [],
            flags: {},
            _stats: {
                systemId: "TheWitcherTRPG",
                systemVersion: "v13.13.0",
                coreVersion: "13"
            }
        };

        // Type mapping
        if (clazz === 'ritual') {
            newData.type = 'ritual';
            newData.system.spellAttackSkill = 'ritcraft';
        } else if (clazz === 'hex') {
            newData.type = 'hex';
            newData.system.spellAttackSkill = 'hexweave';
        } else {
            newData.type = 'spell';
        }

        const dmg = extractDamage(newData.system.effect);
        if (dmg) {
            newData.system.causeDamages = true;
            newData.system.damage = dmg;
            newData.system.damageType = 'elemental';
        }

        fs.writeFileSync(filePath, JSON.stringify(newData, null, 4));
    }
}

console.log("Done generating ULTIMATE clean schema for all magic items!");
