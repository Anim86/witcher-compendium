const { ClassicLevel } = require('classic-level');
const path = require('path');

async function testRead() {
    const dbPath = path.resolve(__dirname, '../../witcher-compendium/packs/EQUIPAGGIAMENTO/base/witcher-weapons');
    console.log(`Reading from: ${dbPath}`);
    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    try {
        await db.open();
        let count = 0;
        for await (const [key, value] of db.iterator()) {
            count++;
            console.log(`Key: ${key}, Name: ${value.name}`);
            if (count >= 5) break;
        }
        console.log(`Found total: ${count} (limited to 5)`);
        await db.close();
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

testRead();
