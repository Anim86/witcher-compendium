const fs = require('fs');
const path = require('path');

const BASE = 'e:/AntigravitiProgetti/CompendioTheWitcher';
const SRC_DIR = path.join(BASE, '../src-packs');
const DATA_DIR = path.join(BASE, 'data');

const packsToFix = ['witcher-spells', 'witcher-spells-chaos', 'witcher-rituals', 'witcher-rituals-chaos'];
// Also rituals need stamina and maybe class/level? The witcher ritual model needs `stamina` and `level` (novice, journeyman, master). Hexes need stamina.

function loadRawData() {
    const all = [];
    try {
        const magic = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'raw_magic.json'), 'utf-8'));
        all.push(...magic);
    } catch(e) {}
    try {
        const chaosMagic = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'raw_chaos_magic.json'), 'utf-8'));
        all.push(...chaosMagic);
    } catch(e) {}
    try {
        const rit = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'raw_rituals_hexes.json'), 'utf-8'));
        all.push(...rit);
    } catch(e) {}
    try {
        const ritChaos = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'raw_chaos_rituals.json'), 'utf-8'));
        all.push(...ritChaos);
    } catch(e) {}
    return all;
}

const rawData = loadRawData();

function mapTier(tier) {
    if (!tier) return 'novice';
    const t = tier.toLowerCase();
    if (t.includes('novizio') || t.includes('druido') || t.includes('predicatore') || t.includes('fanatico')) return 'novice';
    if (t.includes('esperto') || t.includes('mistico') || t.includes('prete') || t.includes('settario')) return 'journeyman';
    if (t.includes('maestro') || t.includes('ierofante') || t.includes('arciprete') || t.includes('zelota')) return 'master';
    return 'novice'; // fallback
}

function mapClass(typeField) {
    if (!typeField) return 'Spells';
    const t = typeField.toLowerCase();
    if (t.includes('incantesimo')) return 'Spells';
    if (t.includes('invocazione')) return 'Invocations';
    if (t.includes('segno')) return 'Witcher';
    if (t.includes('dono')) return 'MagicalGift';
    if (t.includes('ritual')) return 'Rituals';
    if (t.includes('hex')) return 'Hexes';
    return 'Spells';
}

for (const pack of packsToFix) {
    const dir = path.join(SRC_DIR, pack);
    if (!fs.existsSync(dir)) continue;

    console.log(`Fixing spells in ${pack}...`);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    let fixedCount = 0;
    for (const file of files) {
        let changed = false;
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Ensure stamina is defined
        if (data.system && typeof data.system.stamina === 'undefined') {
            data.system.stamina = Number(data.system.cost) || 0;
            changed = true;
        }

        // Find raw entry
        const raw = rawData.find(r => r.name === data.name) || {};
        
        // Se non troviamo the raw, non sapremo con esattezza. Deduzione:
        let clazz = mapClass(raw.type);
        let lvl = mapTier(raw.tier);

        // Se è specificamente in pack rituals ma senza info:
        if (pack.includes('rituals') && !raw.name) {
            clazz = data.name.toLowerCase().includes('maledizione') || data.name.toLowerCase().includes('fattura') ? 'Hexes' : 'Rituals';
            lvl = 'novice';
        }

        if (data.type === 'spell' || data.type === 'ritual') {
            if (data.system.class !== clazz) {
                data.system.class = clazz;
                changed = true;
            }
            if (data.system.level !== lvl) {
                data.system.level = lvl;
                changed = true;
            }
        }
        
        if (data.type === 'hex') {
            if (data.system.class !== 'Hexes') {
                data.system.class = 'Hexes';
                changed = true;
            }
        }

        // Fix eventual wrong type
        if (data.type === 'spell' && clazz === 'Rituals') {
            data.type = 'ritual';
            changed = true;
        }
        if (data.type === 'spell' && clazz === 'Hexes') {
            data.type = 'hex';
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            fixedCount++;
        }
    }
    console.log(`  Fixed ${fixedCount} elements in ${pack}`);
}

console.log("Done fixing schema!");

