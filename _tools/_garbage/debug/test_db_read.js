import { ClassicLevel } from 'classic-level';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');

const PACK_PATH = path.join(REPO_ROOT, 'witcher-compendium', 'packs', 'EQUIPAGGIAMENTO', 'base', 'witcher-equipment');

async function testRead() {
    console.log(`🔍 Test lettura DB: ${PACK_PATH}`);
    const db = new ClassicLevel(PACK_PATH, { valueEncoding: 'json' });
    await db.open();
    
    let count = 0;
    for await (const [key, value] of db.iterator()) {
        if (count < 5) {
            console.log(`   🔑 Key: ${key} | Nome: ${value.name}`);
        }
        count++;
    }
    
    console.log(`\n✅ Totale voci lette: ${count}`);
    await db.close();
}

testRead().catch(console.error);
