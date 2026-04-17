const { ClassicLevel } = require('classic-level');
const path = require('path');

async function fixPack(packPath, packName) {
    console.log(`\n=== Fixing ${packName} ===`);
    const db = new ClassicLevel(packPath, { valueEncoding: 'json' });
    
    const keysToDelete = [];
    for await (const [key, value] of db.iterator()) {
        if (value && value._id === null) {
            keysToDelete.push(key);
            console.log(`  Trovato record corrotto: key=${key} | name=${value.name} | _id=null → ELIMINANDO`);
        }
    }
    
    for (const key of keysToDelete) {
        await db.del(key);
        console.log(`  Eliminato: ${key}`);
    }
    
    if (keysToDelete.length === 0) {
        console.log('  Nessun record corrotto trovato.');
    } else {
        console.log(`  Eliminati ${keysToDelete.length} record corrotti.`);
    }
    
    // Verifica finale
    console.log('\n  Verifica finale:');
    for await (const [key, value] of db.iterator()) {
        if (value && value.name) {
            console.log(`  OK: ${value.name} | _id=${value._id}`);
        }
    }
    
    await db.close();
}

const baseDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/../../witcher-compendium/packs';

(async () => {
    await fixPack(path.join(baseDir, 'witcher-races'), 'witcher-races');
    await fixPack(path.join(baseDir, 'witcher-professions'), 'witcher-professions');
    console.log('\nFatto! Riavvia Foundry per vedere i risultati.');
})();

