import fs from 'fs';

const aggressiveDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/aggressive_prompts_db.json';
const data = JSON.parse(fs.readFileSync(aggressiveDbPath, 'utf8'));

const englishTerms = [
    "Arming Sword", "Iron Sword", "Vrihedd", "Ducal", "Meteorite Sword", "Esboda", 
    "Hunter's Falchion", "Elven Falchion", "Flamberge", "Gleddyf", "Gwyhyr", "Kord", 
    "Krigsverd", "Tir Tochair", "Vicovarian", "Viroledan", "Elven Messer", "Torrwr", "Cutlass",
    "Hand Axe", "Redanian Halberd", "Battle Axe", "Berserker Axe", "Dwarven Axe", "Black Axe",
    "Poleaxe", "Spear", "War Spear", "Blunt Tourney", "Partisan", "Highlander Maul", "Peasant Maul",
    "Dwarven Cleaver", "Warhammer", "Knight's Hammer", "Mace", "Meteorite Flail", "Polehammer",
    "Short Bow", "Longbow", "War Bow", "Travel Bow", "Zefhar", "Crossbow", "Hunting Crossbow",
    "Monster Hunter Crossbow", "Heavy Crossbow", "Hand Crossbow", "Standard Ammunition", 
    "Broadhead Ammunition", "Blunt Ammunition", "Throwing Knives", "Orion", "Plate Armor",
    "Nilfgaardian Plate", "Hindarsfjall Heavy", "Temerian Bascinet", "Double Woven Trousers",
    "Armored Trousers", "Cavalry Trousers", "Padded Trousers", "Brigandine", "Steel Buckler",
    "Gnomish Buckler", "Chainmail Coif", "Dwarven Cloak", "Double Woven Hood", "Armored Hood",
    "Verden Archer's Hood", "Chainmail Hauberk", "Gnomish Chainmail", "Half-Mask Helmet",
    "Skellige Helmet", "Nilfgaardian Helmet", "Halfling Protective Doublet", "Chain Chausses",
    "Gambeson", "Aedirnian Gambeson", "Double Woven Gambeson", "Lyrian Leather Jacket",
    "Great Helm", "Pavise Shield", "Mahakaman Pavise", "Nilfgaardian Pavise", "Plate Greaves",
    "Nilfgaardian Plate Greaves", "Redanian Greaves", "Steel Kite Shield", "Skellige Raider Shield",
    "Leather Shield", "Elven Shield", "Kaedweni Shield", "Temerian Shield", "Quarterstaff",
    "Crystal Mage Staff", "Elven Walking Stick", "Iron Staff", "Gnomish Staff"
];

console.log(`Searching for ${englishTerms.length} terms in ${data.length} prompts...`);

const foundMap = {};
for (const term of englishTerms) {
    const matches = data.filter(item => item.prompt.toLowerCase().includes(term.toLowerCase()));
    if (matches.length > 0) {
        foundMap[term] = matches[0].prompt;
    }
}

console.log('Found matches:', Object.keys(foundMap).length);
console.log('Sample match for "Arming Sword":', foundMap["Arming Sword"]);
console.log('Sample match for "Vrihedd":', foundMap["Vrihedd"]);
console.log('Sample match for "Dwarven Axe":', foundMap["Dwarven Axe"]);

// Save all found matches
fs.writeFileSync('scratch/found_prompts.json', JSON.stringify(foundMap, null, 2), 'utf8');
