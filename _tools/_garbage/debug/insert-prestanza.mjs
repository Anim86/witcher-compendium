import { ClassicLevel } from 'classic-level';
import path from 'path';
import fs from 'fs';

const skillData = {
  "_id": "physique00000000",
  "name": "Prestanza",
  "type": "skill",
  "img": "modules/witcher-compendium/assets/PROFESSIONI_E_ABILITA/witcher-skills/prestanza.webp",
  "system": {
    "attribute": "body",
    "description": "<p>Rappresenta la forza fisica pura, la massa muscolare e la capacità di sollevare pesi, sfondare porte o compiere sforzi atletici brutali.</p>",
    "sourcebook": "MB 56",
    "value": 0,
    "label": "",
    "isOpened": false,
    "modifiers": [],
    "activeEffectModifiers": 0,
    "isProfession": false,
    "isPickup": false,
    "isLearned": false
  },
  "effects": [],
  "folder": null,
  "sort": 0,
  "ownership": {
    "default": 0
  },
  "flags": {},
  "_stats": {
    "systemId": "TheWitcherItaNewSystem",
    "coreVersion": 14
  }
};

async function insertSkill() {
    // 1. Write to LevelDB
    const fullPath = path.resolve('../../witcher-compendium/packs/PROFESSIONI_E_ABILITA/witcher-skills');
    try {
        const db = new ClassicLevel(fullPath, { valueEncoding: 'json' });
        await db.open();
        await db.put('!items!physique00000000', skillData);
        console.log("✅ Successfully inserted Prestanza into LevelDB!");
        await db.close();
    } catch (err) {
        console.error("Error writing to LevelDB:", err);
    }

    // 2. Write to src-packs
    const srcPath = path.resolve('../src-packs/PROFESSIONI_E_ABILITA/witcher-skills/prestanza_physique00000000.json');
    try {
        fs.writeFileSync(srcPath, JSON.stringify(skillData, null, 2), 'utf8');
        console.log("✅ Successfully wrote prestanza_physique00000000.json to src-packs!");
    } catch (err) {
        console.error("Error writing JSON file:", err);
    }
}

insertSkill();
