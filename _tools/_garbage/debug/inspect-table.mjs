import { ClassicLevel } from 'classic-level';
import path from 'path';

async function showTempra() {
    const fullPath = path.resolve('../../witcher-compendium/packs/PROFESSIONI_E_ABILITA/witcher-skills');
    try {
        const db = new ClassicLevel(fullPath, { valueEncoding: 'json' });
        await db.open();
        const val = await db.get('!items!0b9c99bed937928b');
        console.log(JSON.stringify(val, null, 2));
        await db.close();
    } catch (err) {
        console.error("Error:", err);
    }
}

showTempra();



