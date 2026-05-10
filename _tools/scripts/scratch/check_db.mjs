import { ClassicLevel } from 'classic-level';
import path from 'path';

async function checkPacks() {
    const packs = [
        { name: 'Arma Benedetta', dir: 'E:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs/MAGIA_E_MALEDIZIONI/Doni_del_Caos/witcher-invocations' },
        { name: 'Umano', dir: 'E:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-races' }
    ];

    for (const p of packs) {
        const db = new ClassicLevel(p.dir, { valueEncoding: 'json' });
        await db.open();
        console.log(`\nChecking Pack: ${p.dir}`);
        for await (const [key, value] of db.iterator()) {
            if (value.name === p.name) {
                console.log(`Found: ${value.name}`);
                console.log(`Img: ${value.img}`);
                break;
            }
        }
        await db.close();
    }
}

checkPacks().catch(console.error);
