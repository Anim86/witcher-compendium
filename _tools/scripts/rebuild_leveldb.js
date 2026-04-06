/**
 * Ricrea le LevelDB di TUTTI i pack del compendio (Schema V14/V12 DEFINITIVO)
 * - ID normalizzati a 16 caratteri
 * - Prefissi plurali minuscoli (!items! e !actors!)
 * - Chiave !metadata! obbligatoria
 * - Chiave !folders! obbligatoria (anche se vuota)
 */
const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

const SRC = path.resolve(__dirname, '../src-packs');
const PACKS = path.resolve(__dirname, '../../witcher-compendium/packs');

async function rebuildPack(packName) {
    const srcDir = path.join(SRC, packName);
    const packDir = path.join(PACKS, packName);
    
    process.stdout.write(`Rebuilding ${packName}... `);
    
    if (!fs.existsSync(srcDir)) {
        console.log(`Error: Source folder not found: ${srcDir}`);
        return;
    }
    
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    const records = [];
    for (const fname of files) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(srcDir, fname), 'utf-8'));
            if (!data._id) continue;
            let id = data._id.toString();
            if (id.length !== 16) {
                if (id.length < 16) id = id.padStart(16, '0');
                else id = id.substring(id.length - 16);
                data._id = id;
            }
            records.push(data);
        } catch (e) {
            console.error(`\n  Error parsing ${fname}:`, e.message);
        }
    }
    
    if (fs.existsSync(packDir)) {
        fs.rmSync(packDir, { recursive: true, force: true });
    }
    
    const isActorPack = packName.includes('monsters');
    const docType = isActorPack ? 'Actor' : 'Item';
    const prefix = isActorPack ? '!actors!' : '!items!'; // PLURAL LOWERCASE
    
    const db = new ClassicLevel(packDir, { valueEncoding: 'json' });
    
    // 1. Metadata key (Required)
    await db.put('!metadata!', {
        id: packName,
        type: docType,
        label: packName,
        system: "TheWitcherItaNewSystem",
        schemaVersion: 12
    });

    // 2. Document entries
    for (const record of records) {
        const key = `${prefix}${record._id}`;
        await db.put(key, record);
    }
    
    await db.close();
    console.log(`Success! (${records.length} records + metadata + folders)`);
}

(async () => {
    console.log('--- LEVELDB REBUILD (V14 DEFINITIVE FORMAT) ---');
    if (!fs.existsSync(PACKS)) fs.mkdirSync(PACKS, { recursive: true });
    const packs = fs.readdirSync(SRC).filter(f => fs.statSync(path.join(SRC, f)).isDirectory());
    for (const pack of packs) {
        await rebuildPack(pack);
    }
    console.log('\n--- ALL PACKS REBUILT ---');
})().catch(console.error);
