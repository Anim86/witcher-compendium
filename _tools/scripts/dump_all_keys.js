const { ClassicLevel } = require('classic-level');
const path = require('path');

async function dumpKeys(packPath, label) {
    console.log(`\n--- ALL KEYS: ${label} ---`);
    try {
        const db = new ClassicLevel(packPath);
        let count = 0;
        for await (const key of db.keys()) {
            count++;
            console.log(`Key ${count}: ${key}`);
            if (count > 100) break;
        }
        await db.close();
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

(async () => {
    // My pack that appears empty 
    const myPack = path.resolve(__dirname, '../../witcher-compendium/packs/witcher-spells');
    await dumpKeys(myPack, 'MY SPELLS PACK');
    
    // System pack to compare
    const sysPack = path.resolve(__dirname, '../../TheWitcherItaNewSystem/packs/combat');
    await dumpKeys(sysPack, 'SYSTEM COMBAT PACK');
})();
