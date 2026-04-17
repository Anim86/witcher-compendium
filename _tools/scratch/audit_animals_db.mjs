import { ClassicLevel } from 'classic-level';
import path from 'path';

const dbPath = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/witcher-compendium/packs/BESTIARIO/Animali/witcher-animals';

async function audit() {
    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    await db.open();
    
    console.log("Reading witcher-animals pack:");
    for await (const [key, value] of db.iterator()) {
        console.log(` - ${value.name} (${key})`);
    }
    
    await db.close();
}

audit().catch(err => console.error(err));
