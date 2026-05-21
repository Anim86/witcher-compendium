import { ClassicLevel } from 'classic-level';
import path from 'path';

const dbPath = 'E:/FoundryVTT_Data/Data/modules/witcher-compendium/packs/BESTIARIO/witcher-monsters';

async function run() {
    console.log(`Opening database at: ${dbPath}`);
    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    await db.open();
    
    console.log("Keys in database:");
    let found = false;
    for await (const [key, value] of db.iterator()) {
        if (key.includes('39f04128bca6d5e7') || value.name === 'Bruxa') {
            console.log(`\nFound key: ${key}`);
            console.log(JSON.stringify(value, null, 2));
            found = true;
        }
    }
    if (!found) {
        console.log("Bruxa not found in this database!");
    }
    
    await db.close();
}

run().catch(err => {
    console.error("Error reading database:", err);
});
