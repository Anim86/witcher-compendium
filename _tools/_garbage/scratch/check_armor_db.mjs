import { ClassicLevel } from 'classic-level';
import path from 'path';

const PACK_PATH = 'c:\\Users\\apaci\\Desktop\\Script\\witcher-compendium-main\\witcher-compendium\\packs\\EQUIPAGGIAMENTO\\base\\witcher-armor';

async function testRead() {
    console.log(`🔍 Test lettura DB Armor: ${PACK_PATH}`);
    try {
        const db = new ClassicLevel(PACK_PATH, { valueEncoding: 'json' });
        await db.open();
        
        let count = 0;
        for await (const [key, value] of db.iterator()) {
            if (count < 3) {
                console.log(`   🔑 Key: ${key} | Nome: ${value.name}`);
                console.log(`      Data Keys: ${Object.keys(value)}`);
                if (value.system) {
                    console.log(`      System Keys: ${Object.keys(value.system)}`);
                }
            }
            count++;
        }
        
        console.log(`\n✅ Totale voci lette: ${count}`);
        await db.close();
    } catch (err) {
        console.error(`❌ Errore: ${err.message}`);
    }
}

testRead();
