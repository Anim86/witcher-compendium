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

    let srcSubPath = packRelPath.replace(/^packs\//, '');
    let srcDir = path.join(SRC_ROOT, srcSubPath);
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
            let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
            content = content.replace(/^\uFEFF/, '');
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
            fs.rmSync(destDir, { recursive: true, force: true });
        }
        fs.mkdirSync(destDir, { recursive: true });
    } catch (e) {
        console.error(`   ❌ Impossibile pulire la cartella di destinazione: ${e.message}`);
        return;
    }

    // 3. Crea il database con opzioni di massima compatibilità
    const db = new ClassicLevel(destDir, {
        valueEncoding: 'json',
        compression: false
    });

    try {
        await db.open();

        // --- INIZIO FIX FOUNDRY V14 ---
        // Determina la collection basandoti sul 'type' dichiarato nel module.json
        // Esempi: 'Item' -> 'items', 'Actor' -> 'actors', 'JournalEntry' -> 'journal'
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

        // Creazione operazioni batch con la CHIAVE FORMATTATA (!collection!_id)
        const ops = entries.map(e => ({
            type: 'put',
            key: `!${collectionType}!${e._id}`,
            value: e
        }));
        // --- FINE FIX FOUNDRY V14 ---

        await db.batch(ops);

        // Forza la scrittura dei file .ldb
        await db.compactRange('\x00', '\xff');

        await db.close();
        console.log(`   ✅ Inserite ${entries.length} voci con successo nel formato !${collectionType}!.`);
    } catch (e) {
        console.error(`   ❌ Errore durante la scrittura del database ${packName}: ${e.message}`);
        try { await db.close(); } catch (err) { }
    }
}

async function main() {
    console.log("🚀 Inizio compilazione globale dei pacchetti Witcher Compendium (ULTRA-COMPATIBILITY MODE)...");

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
