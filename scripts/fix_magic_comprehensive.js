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
console.log(`Loaded ${rawData.length} raw magic entries.`);

function mapTier(tier) {
    if (!tier) return 'novice';
    const t = tier.toLowerCase();
    // Spell levels: novice, journeyman, master
    if (t.includes('novizio')) return 'novice';
    if (t.includes('esperto')) return 'journeyman';
    if (t.includes('maestro')) return 'master';
    
    // Invocations: Druido, Predicatore, Arciprete (dei, hierophant, etc. - need to map correctly)
    // Looking at common system patterns:
    if (t.includes('druido') || t.includes('predicatore')) return 'novice';
    if (t.includes('mistico') || t.includes('ierofante') || t.includes('arciprete')) return 'journeyman';
    // Actually common mappings for Witcher TRPG system:
    // Novice = Novice / Druido / Predicatore
    // Journeyman = Esperto / Arciprete
    // Master = Maestro
    if (t.includes('maestro')) return 'master';
    
    return 'novice';
}

function mapClass(typeField, name) {
    if (!typeField) return 'Spells';
    const t = typeField.toLowerCase();
    if (t.includes('incantesimo')) return 'Spells';
    if (t.includes('invocazione')) return 'Invocations';
    if (t.includes('segno')) return 'Witcher';
    if (t.includes('dono')) return 'MagicalGift';
    if (t.includes('ritual')) return 'Rituals';
    if (t.includes('hex') || t.includes('maledizione')) return 'Hexes';
    return 'Spells';
}

function extractDamage(effect) {
    if (!effect) return { damage: null, type: 'elemental' };
    const m = effect.match(/(\d+d\d+([+-]\d+)?)/);
    if (m) return { damage: m[1], type: 'elemental' };
    return { damage: null, type: 'elemental' };
}

for (const pack of packsToFix) {
    const dir = path.join(SRC_DIR, pack);
    if (!fs.existsSync(dir)) continue;

    console.log(`Processing pack: ${pack}...`);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    let fixedCount = 0;
    for (const file of files) {
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Find raw record (some names might have (Aria) or similar, need to be careful)
        let raw = rawData.find(r => r.name === data.name);
        if (!raw) {
            // Try to find by partial name (e.g. "Aard (Aria)" vs "Aard")
            raw = rawData.find(r => data.name.startsWith(r.name) || r.name.startsWith(data.name));
        }

        if (raw) {
            const system = data.system;
            
            // 1. Stamina
            const staminaVal = parseInt(raw.res) || 0;
            system.stamina = staminaVal;
            system.staminaIsVar = raw.res === 'Variabile';

            // 2. Class & Level
            system.class = mapClass(raw.type, data.name);
            system.level = mapTier(raw.tier);

            // 3. Mapping standard fields
            system.range = raw.range || system.range || "";
            system.duration = raw.duration || system.duration || "";
            system.defence = raw.defense || system.defence || "";
            system.effect = raw.effect || system.effect || "";

            // 4. Damage (optional but helpful)
            const dmgInfo = extractDamage(raw.effect);
            if (dmgInfo.damage && !system.damage) {
                system.causeDamages = true;
                system.damage = dmgInfo.damage;
                system.damageType = 'elemental';
            }

            // 5. Ensure core type matches
            if (system.class === 'Rituals') data.type = 'ritual';
            if (system.class === 'Hexes') data.type = 'hex';
            if (['Spells', 'Invocations', 'Witcher', 'MagicalGift'].includes(system.class)) data.type = 'spell';

            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            fixedCount++;
        }
    }
    console.log(`  Fixed ${fixedCount} entries in ${pack}.`);
}

console.log("Comprehensive fix complete!");
