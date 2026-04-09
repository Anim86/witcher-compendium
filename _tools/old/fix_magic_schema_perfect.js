const fs = require('fs');
const path = require('path');

const BASE = 'e:/AntigravitiProgetti/CompendioTheWitcher';
const SRC_DIR = path.join(BASE, '../src-packs');
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

    console.log(`Deep cleaning items in ${pack}...`);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        let raw = rawData.find(r => r.name === data.name);
        if (!raw) {
            raw = rawData.find(r => data.name.startsWith(r.name) || r.name.startsWith(data.name));
        }

        const system = data.system;
        const clazz = raw ? mapClass(raw.type) : (pack.includes('rituals') ? 'ritual' : 'Spells');
        const level = raw ? mapTier(raw.tier) : 'novice';

        // Set mandatory properties
        system.class = clazz;
        system.level = level;
        system.stamina = (raw ? parseInt(raw.res) : 0) || 0;
        system.staminaIsVar = (raw && raw.res === 'Variabile');
        
        // Extended schema properties
        system.source = raw?.subtype || system.source || "";
        system.effect = raw?.effect || system.effect || "";
        system.range = raw?.range || system.range || "";
        system.duration = raw?.duration || system.duration || "";
        system.defence = raw?.defense || system.defence || "";
        
        // Complex sub-objects
        system.damageProperties = JSON.parse(JSON.stringify(defaultDamageProperties));
        system.regionProperties = JSON.parse(JSON.stringify(defaultRegionProperties));
        system.attackOptions = ["spell"];
        
        // Attack skills based on class
        if (clazz === 'ritual') {
            data.type = 'ritual';
            system.spellAttackSkill = 'ritcraft';
        } else if (clazz === 'hex') {
            data.type = 'hex';
            system.spellAttackSkill = 'hexweave';
        } else {
            data.type = 'spell';
            system.spellAttackSkill = 'spellcast';
        }

        // Damage detection
        const dmg = extractDamage(system.effect);
        if (dmg) {
            system.causeDamages = true;
            system.damage = dmg;
            system.damageType = 'elemental';
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    }
}

console.log("Done generating perfect schema for all magic items!");

