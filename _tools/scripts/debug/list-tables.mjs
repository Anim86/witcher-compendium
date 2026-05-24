import { ClassicLevel } from 'classic-level';
import path from 'path';

const packs = [
    '../../witcher-compendium/packs/REGOLAMENTO_E_NARRATIVA/CriticieCombattimento',
    '../../witcher-compendium/packs/REGOLAMENTO_E_NARRATIVA/DisastriMagici',
    '../../witcher-compendium/packs/REGOLAMENTO_E_NARRATIVA/StrumentiGM'
];

async function listPacks() {
    for (const p of packs) {
        const fullPath = path.resolve(p);
        console.log(`\nPack: ${p}`);
        try {
            const db = new ClassicLevel(fullPath, { valueEncoding: 'json' });
            await db.open();
            const keys = await db.keys().all();
            console.log(`Total keys: ${keys.length}`);
            for (let i = 0; i < Math.min(20, keys.length); i++) {
                const key = keys[i];
                const val = await db.get(key);
                console.log(` - Key: "${key}" | Name: "${val?.name}"`);
            }
            await db.close();
        } catch (err) {
            console.error(`Error opening DB at ${fullPath}:`, err);
        }
    }
}

listPacks();
