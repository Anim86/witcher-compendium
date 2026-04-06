const { ClassicLevel } = require('classic-level');
const path = require('path');
const os = require('os');

const WORLD_DIR = path.join(os.homedir(), 'AppData', 'Local', 'FoundryVTT', 'Data', 'worlds', 'test-witcher', 'data', 'items');
const PACKS_DIR = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs';

async function readAll(dbPath, label) {
    console.log(`\n=== ${label} ===`);
    console.log(`Path: ${dbPath}`);
    try {
        const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
        let count = 0;
        for await (const [key, value] of db.iterator()) {
            if (value && (value.type === 'race' || value.type === 'profession')) {
                console.log(`  key=${key} | name=${value.name} | _id=${value._id}`);
                count++;
            }
        }
        if (count === 0) console.log('  (nessun record race/profession)');
        await db.close();
    } catch(e) {
        console.log(`  ERRORE: ${e.message}`);
    }
}

(async () => {
    // Controlla il LevelDB del mondo (items salvati nel mondo)
    await readAll(WORLD_DIR, 'MONDO - Items');
    
    // Controlla i compendi del modulo
    await readAll(path.join(PACKS_DIR, 'witcher-races'), 'MODULO - witcher-races');
    await readAll(path.join(PACKS_DIR, 'witcher-professions'), 'MODULO - witcher-professions');
})();
