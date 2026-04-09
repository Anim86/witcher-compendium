const { ClassicLevel } = require('classic-level');
const path = require('path');

async function debugPack(packPath) {
    console.log(`\n--- Debugging Pack at ${packPath} ---`);
    try {
        const db = new ClassicLevel(packPath, { valueEncoding: 'json' });
        let count = 0;
        const keys = [];
        for await (const [key, value] of db.iterator()) {
            count++;
            if (count <= 10) {
                keys.push(key);
                console.log(`Found Key: ${key} | Name: ${value ? value.name : 'N/A'}`);
            }
        }
        console.log(`Total records in DB: ${count}`);
        await db.close();
    } catch (e) {
        console.error(`Error reading LevelDB: ${e.message}`);
    }
}

const baseDir = path.resolve(__dirname, '../../witcher-compendium/packs');

(async () => {
    await debugPack(path.join(baseDir, 'witcher-races'));
    await debugPack(path.join(baseDir, 'witcher-spells'));
    await debugPack(path.join(baseDir, 'witcher-monsters'));
})();
