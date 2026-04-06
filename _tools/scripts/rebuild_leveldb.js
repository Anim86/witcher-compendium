/**
 * Ricrea le LevelDB di TUTTI i pack del compendio (Schema V14/V12)
 * dai file JSON sorgente, assicurandosi che gli ID siano di 16 caratteri
 * e che le chiavi abbiano i prefissi corretti.
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
            // Assicurati che l'ID del record sia di 16 caratteri e normalizzato
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
    const db = new ClassicLevel(packDir, { valueEncoding: 'json' });
    
    // Metadata key (Foundry V11+ requirement)
    await db.put('!metadata!', {
        id: packName,
        type: docType,
        label: packName, // Verrà comunque sovrascritto dal module.json
        system: "TheWitcherItaNewSystem"
    });

    // Documents sublevel (In V12/V14, keys should match the document type singular/capitalized or plural)
    // Most V14 packs use plural lowercase !items! / !actors! OR singular !Item! / !Actor!
    // Since my audit showed !items! didn't work, I'll use SINGULAR CAPITALIZED !Item! and !Actor!
    for (const record of records) {
        const prefix = `!${docType}!`; // !Item! or !Actor!
        const key = `${prefix}${record._id}`;
        await db.put(key, record);
    }
    
    await db.close();
    console.log(`Success! (${records.length} records + metadata)`);
}

(async () => {
    console.log('--- LEVELDB REBUILD (V14 FORMAT) ---');
    const packs = fs.readdirSync(SRC).filter(f => fs.statSync(path.join(SRC, f)).isDirectory());
    for (const pack of packs) {
        await rebuildPack(pack);
    }
    console.log('\n--- ALL PACKS REBUILT ---');
})().catch(console.error);
