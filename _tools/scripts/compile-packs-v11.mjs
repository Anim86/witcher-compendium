import { ClassicLevel } from 'classic-level';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const MODULE_ROOT = path.join(REPO_ROOT, 'witcher-compendium');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const MODULE_JSON_PATH = path.join(MODULE_ROOT, 'module.json');

async function compilePack(packMetadata) {
    const packName = packMetadata.name;
    const packRelPath = packMetadata.path; 
    
    const srcSubPath = packRelPath.replace(/^packs\//, '');
    const srcDir = path.join(SRC_ROOT, srcSubPath);
    const destDir = path.join(MODULE_ROOT, packRelPath);

    console.log(`\n📦 Compilazione pacchetto: ${packName}`);

    if (!fs.existsSync(srcDir)) {
        console.warn(`   ⚠️ Cartella sorgente non trovata: ${srcDir}. Salto.`);
        return;
    }

    // 1. Leggi tutti i file JSON nella sorgente
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    const entries = [];
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
            const data = JSON.parse(content);
            entries.push(data);
        } catch (e) {
            console.error(`   ❌ Errore nel caricamento di ${file}: ${e.message}`);
        }
    }

    if (entries.length === 0) {
        console.warn(`   ⚠️ Nessun file JSON trovato in ${srcDir}.`);
        return;
    }

    // 2. Prepara la destinazione (PULIZIA TOTALE)
    try {
        if (fs.existsSync(destDir)) {
            // Eliminiamo la cartella per assicurarci un database pulito
            // Nota: Se Foundry è aperto e il pack è in uso, questo fallirà.
            fs.rmSync(destDir, { recursive: true, force: true });
        }
        fs.mkdirSync(destDir, { recursive: true });
    } catch (e) {
        console.error(`   ❌ Impossibile pulire la cartella di destinazione (forse è aperta in Foundry?): ${e.message}`);
        return;
    }

    // 3. Scrittura Database
    const db = new ClassicLevel(destDir, { valueEncoding: 'json' });
    await db.open();

    try {
        const writeOps = entries.map(entry => {
            const key = entry._id;
            if (!key) {
                console.warn(`   ⚠️ L'entry "${entry.name}" non ha un _id. Verrà saltata.`);
                return null;
            }
            return { type: 'put', key, value: entry };
        }).filter(op => op !== null);

        await db.batch(writeOps);
        
        // --- NUOVO: Forza la compattazione per creare i file .ldb ---
        if (typeof db.compactRange === 'function') {
            await db.compactRange('\x00', '\xff');
        }
        
        console.log(`   ✅ Inserite ${writeOps.length} voci con successo.`);

    } catch (e) {
        console.error(`   ❌ Errore durante la scrittura del database: ${e.message}`);
    } finally {
        await db.close();
    }
}

async function main() {
    console.log("🚀 Inizio compilazione globale dei pacchetti Witcher Compendium...");
    
    if (!fs.existsSync(MODULE_JSON_PATH)) {
        console.error("❌ Errore: module.json non trovato.");
        process.exit(1);
    }

    const moduleJson = JSON.parse(fs.readFileSync(MODULE_JSON_PATH, 'utf8'));
    const packs = moduleJson.packs;

    for (const pack of packs) {
        await compilePack(pack);
    }

    console.log("\n✨ Compilazione completata!");
}

main().catch(err => {
    console.error("\n💥 Errore fatale:");
    console.error(err);
});
