/**
 * VERSION: 1.1.0
 * LAST_UPDATE: 2026-04-14
 * DESCRIPTION: Dumps the first item from a LevelDB pack for inspection. 
 * NOTE: Edit PACK_PATH variable to target different packs.
 */

import { ClassicLevel } from 'classic-level';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../');

// Change this to target the desired pack
const PACK_PATH = path.join(REPO_ROOT, 'witcher-compendium/packs/PROFESSIONI_E_ABILITA/witcher-professions');

async function dumpFirstItem() {
    console.log(`🔍 [DUMP] Opening pack: ${PACK_PATH}`);
    if (!fs.existsSync(PACK_PATH)) {
        console.error("❌ Error: Pack path does not exist.");
        return;
    }

    const db = new ClassicLevel(PACK_PATH, { valueEncoding: 'json' });
    try {
        await db.open();
        
        let first = null;
        for await (const [key, value] of db.iterator()) {
            first = { key, value };
            break;
        }
        await db.close();
        
        if (first) {
            console.log("💎 Key:", first.key);
            const dumpPath = path.join(__dirname, 'item_dump.json');
            fs.writeFileSync(dumpPath, JSON.stringify(first.value, null, 2));
            console.log(`✨ [DONE] Item dumped to: ${path.relative(REPO_ROOT, dumpPath)}`);
        } else {
            console.log("⚠️ Database is empty.");
        }
    } catch (e) {
        console.error(`❌ Error reading database: ${e.message}`);
    }
}

dumpFirstItem();
