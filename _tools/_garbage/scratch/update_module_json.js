const fs = require('fs');
const path = require('path');

const MODULE_JSON_PATH = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\witcher-compendium\\module.json';
const data = JSON.parse(fs.readFileSync(MODULE_JSON_PATH, 'utf8'));

const newPacks = [
  {
    "name": "witcher-rolltable-critici",
    "label": "Tabelle: Critici e Fumble",
    "path": "packs/TABELLEOPERATIVE/CriticieCombattimento",
    "type": "RollTable",
    "system": "TheWitcherItaNewSystem"
  },
  {
    "name": "witcher-rolltable-disastri",
    "label": "Tabelle: Disastri Magici",
    "path": "packs/TABELLEOPERATIVE/DisastriMagici",
    "type": "RollTable",
    "system": "TheWitcherItaNewSystem"
  },
  {
    "name": "witcher-rolltable-strumentigm",
    "label": "Tabelle: Strumenti GM",
    "path": "packs/TABELLEOPERATIVE/StrumentiGM",
    "type": "RollTable",
    "system": "TheWitcherItaNewSystem"
  }
];

// Check if they already exist
newPacks.forEach(newPack => {
    if (!data.packs.find(p => p.name === newPack.name)) {
        data.packs.push(newPack);
        console.log(`Added pack: ${newPack.name}`);
    } else {
        console.log(`Pack already exists: ${newPack.name}`);
    }
});

fs.writeFileSync(MODULE_JSON_PATH, JSON.stringify(data, null, 2) + '\n');
console.log('module.json updated successfully.');
