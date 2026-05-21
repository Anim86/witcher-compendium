import { ClassicLevel } from 'classic-level';
import path from 'path';

const dbPath = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/witcher-compendium/packs/BESTIARIO/witcher-monsters';

async function run() {
    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    await db.open();
    
    for await (const [key, value] of db.iterator()) {
        if (key.includes('39f04128bca6d5e7') || value.name === 'Bruxa') {
            console.log(`\nFound key: ${key}`);
            console.log(JSON.stringify(value, null, 2));
        }
    }
    
    await db.close();
}

run().catch(console.error);
