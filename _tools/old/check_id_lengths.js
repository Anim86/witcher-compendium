const { ClassicLevel } = require('classic-level');
const path = require('path');

async function checkIds(packPath) {
    console.log(`Checking IDs in: ${packPath}`);
    const db = new ClassicLevel(packPath, { valueEncoding: 'json' });
    const stats = {};
    for await (const [key, value] of db.iterator()) {
        const id = key.split('!').pop();
        const len = id.length;
        stats[len] = (stats[len] || 0) + 1;
        if (len !== 16) {
            // console.log(`Invalid ID: ${id} (${len}) for ${value.name}`);
        }
    }
    console.log('ID Length Distribution:', stats);
    await db.close();
}

const baseDir = path.resolve(__dirname, '../../witcher-compendium/packs');
(async () => {
    await checkIds(path.join(baseDir, 'witcher-races'));
    await checkIds(path.join(baseDir, 'witcher-spells'));
    await checkIds(path.join(baseDir, 'witcher-monsters'));
})();
