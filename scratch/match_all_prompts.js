import fs from 'fs';
import path from 'path';

const schematicsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics';
const aggressiveDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/aggressive_prompts_db.json';

const files = fs.readdirSync(schematicsDir);
const agg = JSON.parse(fs.readFileSync(aggressiveDbPath, 'utf8'));

const schematics = [];
for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const content = JSON.parse(fs.readFileSync(path.join(schematicsDir, file), 'utf8'));
    schematics.push({
        file,
        id: content._id,
        name: content.name,
        cleanName: content.name.replace(/^Schema:\s*/i, '').trim(),
        description: content.system.description || '',
        img: content.img
    });
}

// English/Italian mapping for items
const nameMapping = {
    "Accetta": "Hand Axe",
    "Alabarda Rossa": "Redanian Halberd",
    "Ascia da Battaglia": "Battle Axe",
    "Ascia da Berserker": "Berserker Axe",
    "Ascia Nanica": "Dwarven Axe",
    "Ascia Nera Gnomesca": "Gnomish Black Axe",
    "Azza": "Poleaxe",
    "Lancia": "Spear",
    "Lancia da Guerra": "War Spear",
    "Lancia Smussata": "Blunt Tourney",
    "Partigiana": "Partisan",
    "Maglio degli Altipiani": "Highlander Maul",
    "Maglio del Contadino": "Peasant Maul",
    "Mannaia Nanica": "Dwarven Cleaver",
    "Martello d'Armi Mahakaman": "Mahakaman Warhammer",
    "Martello da Cavaliere": "Knight's Hammer",
    "Mazza": "Mace",
    "Mazzafrusto Meteoritico": "Meteorite Flail",
    "Mazzapicchio Nanico": "Dwarven Polehammer",
    "Arco Corto": "Short Bow",
    "Arco Lungo": "Longbow",
    "Arco da Guerra": "War Bow",
    "Arco da Viaggio Elfico": "Elven Travel Bow",
    "Zefhar Elfico": "Elven Zefhar",
    "Balestra": "Crossbow",
    "Balestra da Caccia": "Hunting Crossbow",
    "Balestra da Cacciatore di Mostri": "Monster Hunter Crossbow",
    "Balestra Pesante Nanica": "Dwarven Heavy Crossbow",
    "Balestrino": "Hand Crossbow",
    "Balestrino Gnomesco": "Gnomish Hand Crossbow",
    "Munizioni Normali": "Standard Ammunition",
    "Munizioni a Punta Larga": "Broadhead Ammunition",
    "Munizioni Smussate": "Blunt Ammunition",
    "Coltelli da Lancio": "Throwing Knives",
    "Orione": "Orion",
    "Armatura a Piastre": "Plate Armor",
    "Armatura a Piastre Nilfgaardiana": "Nilfgaardian Plate",
    "Armatura Pesante di Hindarsfjall": "Hindarsfjall Heavy",
    "Bacinetto Temeriano": "Temerian Bascinet",
    "Brache a Doppia Trama": "Double Woven Trousers",
    "Brache Corazzate": "Armored Trousers",
    "Brache da Cavallerizzo": "Cavalry Trousers",
    "Brache Imbottite": "Padded Trousers",
    "Brigantina": "Brigandine",
    "Brocchiero d'Acciaio": "Steel Buckler",
    "Brocchiero Gnomesco": "Gnomish Buckler",
    "Camaglio": "Chainmail Coif",
    "Cappa Nanica": "Dwarven Cloak",
    "Cappuccio a Doppia Trama": "Double Woven Hood",
    "Cappuccio Corazzato": "Armored Hood",
    "Cappuccio da Arciere Verden": "Verden Archer's Hood",
    "Cotta di Maglia": "Chainmail Hauberk",
    "Cotta Gnomesca": "Gnomish Chainmail",
    "Elmo a Mezza Maschera": "Half-Mask Helmet",
    "Elmo di Skellige": "Skellige Helmet",
    "Elmo Nilfgaardiano": "Nilfgaardian Helmet",
    "Farsetto Protettivo Halfling": "Halfling Protective Doublet",
    "Gambali di Maglia di Hindarsfjall": "Hindarsfjall Chain Chausses",
    "Gambesone": "Gambeson",
    "Gambesone Aedirniano": "Aedirnian Gambeson",
    "Gambesone a Doppia Trama": "Double Woven Gambeson",
    "Giubba di Cuoio Lyriano": "Lyrian Leather Jacket",
    "Grande Elmo": "Great Helm",
    "Palvese": "Pavise Shield",
    "Palvese Mahakaman": "Mahakaman Pavise",
    "Palvese Nilfgaardiano": "Nilfgaardian Pavise",
    "Schinieri di Piastre": "Plate Greaves",
    "Schinieri Nilfgaardiani": "Nilfgaardian Plate Greaves",
    "Schinieri Redaniani": "Redanian Greaves",
    "Scudo d'Acciaio a Goccia": "Steel Kite Shield",
    "Scudo da Razziatore di Skellige": "Skellige Raider Shield",
    "Scudo di Cuoio": "Leather Shield",
    "Scudo Elfico": "Elven Shield",
    "Scudo Kaedweni": "Kaedweni Shield",
    "Scudo Temeriano": "Temerian Shield",
    "Bastone": "Quarterstaff",
    "Bastone con Cristallo": "Crystal Mage Staff",
    "Bastone da Passeggio Elfico": "Elven Walking Stick",
    "Bastone di Ferro": "Iron Staff",
    "Bastone Gnomesco": "Gnomish Staff",
    // Swords
    "Spada d'Arme": "Arming Sword",
    "Spada di Ferro": "Iron Sword",
    "Spada da Cavalleria Vrihedd": "Vrihedd Cavalry Sword",
    "Spada Ducale": "Toussaint Ducal Sword",
    "Spada Meteoritica": "Meteorite Sword",
    "Esboda": "Esboda",
    "Falchion da Cacciatore": "Hunter's Falchion",
    "Falcione Elfico": "Elven Falchion",
    "Flamberga": "Flamberge",
    "Gleddyf": "Gleddyf",
    "Gwyhyr Gnomesca": "Gnomish Gwyhyr",
    "Kord": "Elven Kord",
    "Krigsverd": "Skellige Krigsverd",
    "Lama del Tir Tochair": "Tir Tochair Blade",
    "Lama Vicovariana": "Vicovarian Blade",
    "Lama Viroledana": "Viroledan Blade",
    "Messer Elfico": "Elven Messer",
    "Torrwr": "Gemmerian Torrwr",
    "Costoliere": "Cutlass"
};

const matched = [];
const unmatched = [];

for (const s of schematics) {
    const engName = nameMapping[s.cleanName];
    let foundPrompt = null;
    
    if (engName) {
        // Search by English name in aggressive DB
        const match = agg.find(item => 
            item.prompt.toLowerCase().includes(engName.toLowerCase()) && 
            (item.prompt.toLowerCase().includes('parchment') || item.prompt.toLowerCase().includes('blueprint'))
        );
        if (match) {
            foundPrompt = match.prompt;
        }
    }
    
    // Fallback: search by cleanName in aggressive DB
    if (!foundPrompt) {
        const match = agg.find(item => 
            item.prompt.toLowerCase().includes(s.cleanName.toLowerCase()) &&
            (item.prompt.toLowerCase().includes('parchment') || item.prompt.toLowerCase().includes('blueprint'))
        );
        if (match) {
            foundPrompt = match.prompt;
        }
    }
    
    if (foundPrompt) {
        matched.push({ schematic: s, engName, prompt: foundPrompt });
    } else {
        unmatched.push({ schematic: s, engName });
    }
}

console.log(`Matched: ${matched.length} / ${schematics.length}`);
console.log(`Unmatched: ${unmatched.length}`);
console.log('Sample matched (first 3):');
console.log(matched.slice(0, 3).map(m => `${m.schematic.name} -> ${m.prompt.substring(0, 80)}...`));

console.log('Unmatched items (first 10):');
console.log(unmatched.slice(0, 10).map(u => u.schematic.name));

// Let's save the matched results for further steps
fs.writeFileSync('scratch/matched_schematics_prompts.json', JSON.stringify(matched, null, 2), 'utf8');
fs.writeFileSync('scratch/unmatched_schematics.json', JSON.stringify(unmatched, null, 2), 'utf8');
