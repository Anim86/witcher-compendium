import { ClassicLevel } from 'classic-level';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'e:/AntigravitiProgetti/CompendioTheWitcher';
const MODULE_ROOT = path.join(REPO_ROOT, 'witcher-compendium');
const SRC_DIR = path.join(REPO_ROOT, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-components');
const DEST_DIR = path.join(MODULE_ROOT, 'packs/ALCHIMIA_E_ARTIGIANATO/witcher-components');

async function compile() {
    console.log(`📦 Compiling: witcher-components`);
    
    if (!fs.existsSync(SRC_DIR)) {
        console.error(`❌ Source not found: ${SRC_DIR}`);
        return;
    }

    const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.json'));
    const entries = files.map(f => JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8')));

    if (fs.existsSync(DEST_DIR)) {
        fs.rmSync(DEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DEST_DIR, { recursive: true });

    const db = new ClassicLevel(DEST_DIR, { valueEncoding: 'json' });
    await db.open();
    
    const ops = entries.map(e => ({
        type: 'put',
        key: `!items!${e._id}`,
        value: e
    }));

    await db.batch(ops);
    await db.close();
    
    console.log(`✅ Compiled ${entries.length} components.`);
}

compile().catch(console.error);
