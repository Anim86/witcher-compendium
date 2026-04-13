import { ClassicLevel } from 'classic-level';
import fs from 'fs';

const PACK_PATH = 'E:\\FoundryVTT_Data\\Data\\modules\\witcher-compendium\\packs\\EQUIPAGGIAMENTO\\base\\witcher-armor';

async function dumpFirstItem() {
    const db = new ClassicLevel(PACK_PATH, { valueEncoding: 'json' });
    await db.open();
    
    let first = null;
    for await (const [key, value] of db.iterator()) {
        first = { key, value };
        break;
    }
    await db.close();
    
    if (first) {
        console.log("CHIAVE:", first.key);
        console.log("VALORE (JSON):", JSON.stringify(first.value, null, 2).substring(0, 1000));
        fs.writeFileSync('item_dump.json', JSON.stringify(first.value, null, 2));
    } else {
        console.log("DATABASE VUOTO!");
    }
}

dumpFirstItem();
