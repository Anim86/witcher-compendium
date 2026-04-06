const { ClassicLevel } = require('classic-level');
const path = require('path');

async function readPack(packPath, packName) {
    console.log(`\n=== ${packName} ===`);
    try {
        const db = new ClassicLevel(packPath, { valueEncoding: 'json' });
        const records = [];
        for await (const [key, value] of db.iterator()) {
            if (value && value.name && (value.type === 'race' || value.type === 'profession')) {
                records.push({ key, name: value.name, type: value.type, _id: value._id });
                console.log(`  key=${key} | name=${value.name} | _id=${value._id}`);
            }
        }
        console.log(`  Totale: ${records.length}`);
        
        // Trova duplicati per nome
        const byName = {};
        for (const r of records) {
            if (!byName[r.name]) byName[r.name] = [];
            byName[r.name].push(r);
        }
        for (const [name, entries] of Object.entries(byName)) {
            if (entries.length > 1) {
                console.log(`  DUPLICATO: "${name}" appare ${entries.length} volte!`);
                for (const e of entries) {
                    console.log(`    key=${e.key} | _id=${e._id}`);
                }
            }
        }
        
        await db.close();
        return records;
    } catch (e) {
        console.log(`  Errore: ${e.message}`);
        return [];
    }
}

const baseDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs';

(async () => {
    await readPack(path.join(baseDir, 'witcher-races'), 'witcher-races');
    await readPack(path.join(baseDir, 'witcher-professions'), 'witcher-professions');
})();
