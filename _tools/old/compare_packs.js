const { ClassicLevel } = require('classic-level');
const path = require('path');

async function debugPack(packPath, label) {
    console.log(`\n--- Debugging: ${label} ---`);
    console.log(`Path: ${packPath}`);
    try {
        const db = new ClassicLevel(packPath, { valueEncoding: 'json' });
        let count = 0;
        for await (const [key, value] of db.iterator()) {
            count++;
            if (count <= 5) {
                const idPart = key.split('!').pop();
                console.log(`Key: ${key} | ID Len: ${idPart.length} | Name: ${value ? value.name : 'N/A'}`);
            }
        }
        console.log(`Total: ${count}`);
        await db.close();
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

(async () => {
    // Working System Pack
    const systemPack = path.resolve(__dirname, '../../TheWitcherItaNewSystem/packs/combat');
    await debugPack(systemPack, 'SYSTEM WORKING PACK');

    // My Broken Pack
    const myPack = path.resolve(__dirname, '../../witcher-compendium/packs/witcher-spells');
    await debugPack(myPack, 'MY BROKEN PACK');
})();
