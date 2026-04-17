// Witcher Compendium Maintenance Tool: Pack Compiler
// VERSION: 1.1.0 (V14 Compatible)
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Compiled JSON source packs into LevelDB format for Foundry VTT.

import { ClassicLevel } from 'classic-level';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script's new home in _tools/scripts/core
const REPO_ROOT = path.resolve(__dirname, '../../../');
const MODULE_ROOT = path.join(REPO_ROOT, 'witcher-compendium');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const MODULE_JSON_PATH = path.join(MODULE_ROOT, 'module.json');

async function compilePack(packMetadata) {
    const packName = packMetadata.name;
    const packRelPath = packMetadata.path;

    let srcSubPath = packRelPath.replace(/^packs\//, '');
    let srcDir = path.join(SRC_ROOT, srcSubPath);
    const destDir = path.join(MODULE_ROOT, packRelPath);

    console.log(`\n📦 Compiling pack: ${packName}`);

    if (!fs.existsSync(srcDir)) {
        console.warn(`   ⚠️ Source folder not found: ${srcDir}. Skipping.`);
        return;
    }

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    const entries = [];
    for (const file of files) {
        try {
            let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
            content = content.replace(/^\uFEFF/, '');
            const data = JSON.parse(content);
            entries.push(data);
        } catch (e) {
            console.error(`   ❌ Error loading ${file}: ${e.message}`);
        }
    }

    if (entries.length === 0) {
        console.warn(`   ⚠️ No JSON files found in ${srcDir}.`);
        return;
    }

    // Prepare destination
    try {
        if (fs.existsSync(destDir)) {
            fs.rmSync(destDir, { recursive: true, force: true });
        }
        fs.mkdirSync(destDir, { recursive: true });
    } catch (e) {
        console.error(`   ❌ Could not clear destination folder: ${e.message}`);
        return;
    }

    const db = new ClassicLevel(destDir, {
        valueEncoding: 'json',
        compression: false
    });

    try {
        await db.open();

        // Foundry V14 Collection Type Mapping
        let collectionType = 'items';
        if (packMetadata.type) {
            if (packMetadata.type === 'JournalEntry') {
                collectionType = 'journal';
            } else if (packMetadata.type === 'RollTable') {
                collectionType = 'tables';
            } else {
                collectionType = packMetadata.type.toLowerCase() + 's';
            }
        }

        const ops = entries.map(e => ({
            type: 'put',
            key: `!${collectionType}!${e._id}`,
            value: e
        }));

        await db.batch(ops);
        await db.compactRange('\x00', '\xff');
        await db.close();
        console.log(`   ✅ Successfully compiled ${entries.length} entries in !${collectionType}! format.`);
    } catch (e) {
        console.error(`   ❌ Error writing database ${packName}: ${e.message}`);
        try { await db.close(); } catch (err) { }
    }
}

async function main() {
    console.log("🚀 Starting global pack compilation (Foundry V14 Compatibility Mode)...");

    if (!fs.existsSync(MODULE_JSON_PATH)) {
        console.error("❌ Error: module.json not found.");
        process.exit(1);
    }

    const moduleJson = JSON.parse(fs.readFileSync(MODULE_JSON_PATH, 'utf8'));
    const packs = moduleJson.packs;

    for (const pack of packs) {
        await compilePack(pack);
    }

    console.log("\n✨ Compilation completed!");
}

main().catch(err => {
    console.error("\n💥 Fatal Error:");
    console.error(err);
});
