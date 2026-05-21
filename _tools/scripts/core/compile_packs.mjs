// Witcher Compendium Maintenance Tool: Pack Compiler
// VERSION: 3.0.0 (Uses Official Foundry VTT CLI Library)
// LAST_UPDATE: 2026-05-21
// DESCRIPTION: Compiles JSON source packs into LevelDB format using the official
//              @foundryvtt/foundryvtt-cli compilePack function, which correctly
//              handles embedded documents (items/effects inside actors).

import { compilePack, TYPE_COLLECTION_MAP } from '@foundryvtt/foundryvtt-cli/lib/package.mjs';
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

/**
 * Inverse map: collection name -> document type
 * e.g. "actors" -> "Actor", "items" -> "Item"
 */
const COLLECTION_TYPE_MAP = Object.fromEntries(
    Object.entries(TYPE_COLLECTION_MAP).map(([k, v]) => [v, k])
);

/**
 * Prepares a temporary source directory where each JSON file has a `_key` field
 * as required by the Foundry CLI's compilePack. The _key is derived from the
 * document type and the document's _id.
 */
/**
 * Hierarchy of embedded document collections, matching the official Foundry CLI.
 * Keys are parent collection types, values map embedded collection names.
 */
const HIERARCHY = {
    actors: { items: [], effects: [] },
    cards: { cards: [] },
    combats: { combatants: [], groups: [] },
    delta: { items: [], effects: [] },
    effects: {},
    items: { effects: [] },
    journal: { pages: [], categories: [] },
    playlists: { sounds: [] },
    tables: { results: [] },
    scenes: { drawings: [], tokens: [], levels: [], lights: [], notes: [], regions: [], sounds: [], templates: [], tiles: [], walls: [] }
};

/**
 * Recursively adds `_key` fields to a document and all its embedded documents,
 * following the same hierarchy and key format as the official Foundry CLI.
 * 
 * Key format for parent: !{collection}!{id}
 * Key format for embedded: !{parentCollection}.{embeddedCollection}!{parentId}.{embeddedId}
 */
function addKeysRecursive(doc, collection, sublevelPrefix = '', idPrefix = '') {
    const sublevel = [sublevelPrefix, collection].filter(Boolean).join('.');
    const id = [idPrefix, doc._id].filter(Boolean).join('.');
    doc._key = `!${sublevel}!${id}`;

    const hierarchyEntry = HIERARCHY[collection];
    if (!hierarchyEntry) return;

    for (const [embeddedName, type] of Object.entries(hierarchyEntry)) {
        const embeddedValue = doc[embeddedName];
        if (Array.isArray(type) && Array.isArray(embeddedValue)) {
            for (const embDoc of embeddedValue) {
                if (!embDoc) continue;
                // Generate a random _id if missing
                if (!embDoc._id) {
                    embDoc._id = [...crypto.getRandomValues(new Uint8Array(8))]
                        .map(b => b.toString(16).padStart(2, '0')).join('');
                }
                addKeysRecursive(embDoc, embeddedName, sublevel, id);
            }

        } else if (embeddedValue && typeof embeddedValue === 'object' && embeddedValue._id) {
            addKeysRecursive(embeddedValue, embeddedName, sublevel, id);
        }
    }
}

/**
 * Prepares a temporary source directory where each JSON file has `_key` fields
 * on the document and all embedded sub-documents, as required by the Foundry CLI.
 */
function prepareSourceWithKeys(srcDir, collectionType) {
    const tmpDir = path.join(srcDir, '__tmp_keyed');
    if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    let count = 0;

    for (const file of files) {
        try {
            let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
            content = content.replace(/^\uFEFF/, '');
            const data = JSON.parse(content);

            if (!data._id) {
                console.warn(`   ⚠️ Skipping ${file}: no _id field.`);
                continue;
            }

            // Add _key fields recursively to the document and all embedded documents
            addKeysRecursive(data, collectionType);

            // Write to temp directory
            fs.writeFileSync(
                path.join(tmpDir, file),
                JSON.stringify(data, null, 2) + '\n',
                'utf8'
            );
            count++;
        } catch (e) {
            console.error(`   ❌ Error processing ${file}: ${e.message}`);
        }
    }

    return { tmpDir, count };
}

async function compilePackFromMetadata(packMetadata) {
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

    // Determine collection type from pack metadata
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

    // Prepare source files with _key fields
    const { tmpDir, count } = prepareSourceWithKeys(srcDir, collectionType);

    if (count === 0) {
        console.warn(`   ⚠️ No valid JSON files found in ${srcDir}.`);
        fs.rmSync(tmpDir, { recursive: true, force: true });
        return;
    }

    // Clear destination
    try {
        if (fs.existsSync(destDir)) {
            fs.rmSync(destDir, { recursive: true, force: true });
        }
        fs.mkdirSync(destDir, { recursive: true });
    } catch (e) {
        console.error(`   ❌ Could not clear destination folder: ${e.message}`);
        fs.rmSync(tmpDir, { recursive: true, force: true });
        return;
    }

    try {
        // Use the official Foundry CLI compilePack function
        await compilePack(tmpDir, destDir, {
            log: false,
            recursive: false
        });

        console.log(`   ✅ Successfully compiled ${count} entries in !${collectionType}! format.`);
    } catch (e) {
        console.error(`   ❌ Error compiling pack ${packName}: ${e.message}`);
    } finally {
        // Clean up temp directory
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}

async function main() {
    console.log("🚀 Starting global pack compilation (Foundry VTT Official CLI Library)...");

    if (!fs.existsSync(MODULE_JSON_PATH)) {
        console.error("❌ Error: module.json not found.");
        process.exit(1);
    }

    const moduleJson = JSON.parse(fs.readFileSync(MODULE_JSON_PATH, 'utf8'));
    const packs = moduleJson.packs;

    for (const pack of packs) {
        await compilePackFromMetadata(pack);
    }

    console.log("\n✨ Compilation completed!");
}

main().catch(err => {
    console.error("\n💥 Fatal Error:");
    console.error(err);
});
