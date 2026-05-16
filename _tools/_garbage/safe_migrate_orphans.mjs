import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const ORPHAN_ASSETS_DIR = path.join(ASSETS_ROOT, 'EQUIPAGGIAMENTO_E_TRASPORTI', '_review_orphans');
const ORPHAN_JSON_DIR = path.join(SRC_ROOT, 'EQUIPAGGIAMENTO_E_TRASPORTI', '_review_orphans');

// Mappa delle sottocartelle basata sulle parole chiave nei nomi dei file
const PACK_KEYWORDS = {
    'spada': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'balestra': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'zanna': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'scudo': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'armatura': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-armor',
    'protesi': 'EQUIPAGGIAMENTO_E_TRASPORTI/Protesi/witcher-dlc-dp-equipment',
    'sedia': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'carro': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'assali': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'ruote': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'schema': 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics',
    'formula': 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy'
};

const DEFAULT_EQUIP_PACK = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment';

async function findItemInMainPacks(name, excludeOrphans = true) {
    const results = [];
    // Pulizia nome per ricerca più elastica
    const cleanSearch = name.toLowerCase().replace(/['\s_]/g, '');
    
    const walk = (dir) => {
        if (excludeOrphans && dir.includes('_review_orphans')) return;
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    if (content.name) {
                        const cleanItemName = content.name.toLowerCase().replace(/['\s_]/g, '');
                        if (cleanItemName.includes(cleanSearch) || cleanSearch.includes(cleanItemName)) {
                            results.push({ path: fullPath, data: content });
                        }
                    }
                } catch (e) {}
            }
        }
    };
    walk(SRC_ROOT);
    return results;
}

function getTargetPack(name) {
    const lower = name.toLowerCase();
    for (const [kw, pack] of Object.entries(PACK_KEYWORDS)) {
        if (lower.includes(kw)) return pack;
    }
    return DEFAULT_EQUIP_PACK;
}

async function main() {
    console.log("🚀 Avvio Integrazione Sicura Asset Orfani...");
    const report = { updated: [], created: [], skipped: [] };

    // 1. Analisi Immagini Orfane
    if (!fs.existsSync(ORPHAN_ASSETS_DIR)) {
        console.log("Cartella asset orfani non trovata.");
        return;
    }
    const orphanImages = fs.readdirSync(ORPHAN_ASSETS_DIR).filter(f => f.endsWith('.webp'));
    console.log(`Trovate ${orphanImages.length} immagini orfane.`);

    for (const imgName of orphanImages) {
        const baseName = path.parse(imgName).name;
        console.log(`\nElaborazione immagine: ${imgName}`);

        const matches = await findItemInMainPacks(baseName);
        
        if (matches.length > 0) {
            for (const match of matches) {
                const jsonRelPath = path.relative(SRC_ROOT, match.path);
                const packDir = path.dirname(jsonRelPath);
                const destAssetDir = path.join(ASSETS_ROOT, packDir);
                const destAssetPath = path.join(destAssetDir, imgName);

                if (!fs.existsSync(destAssetDir)) fs.mkdirSync(destAssetDir, { recursive: true });

                // Copia sicura: se esiste già, non sovrascrivere se hanno lo stesso nome ma verifica se sono item diversi
                if (fs.existsSync(destAssetPath)) {
                    const existingSize = fs.statSync(destAssetPath).size;
                    const newSize = fs.statSync(path.join(ORPHAN_ASSETS_DIR, imgName)).size;
                    if (existingSize === newSize) {
                        console.log(`  ℹ️ File già presente e identico in ${packDir}.`);
                    } else {
                        const renamedDestPath = path.join(destAssetDir, baseName + "_rev.webp");
                        fs.copyFileSync(path.join(ORPHAN_ASSETS_DIR, imgName), renamedDestPath);
                        console.log(`  ⚠️ Conflitto risolto rinominando in ${baseName}_rev.webp`);
                        match.data.img = `modules/witcher-compendium/assets/${packDir.replace(/\\/g, '/')}/${baseName}_rev.webp`;
                    }
                } else {
                    fs.copyFileSync(path.join(ORPHAN_ASSETS_DIR, imgName), destAssetPath);
                    match.data.img = `modules/witcher-compendium/assets/${packDir.replace(/\\/g, '/')}/${imgName}`;
                    console.log(`  ✅ Copiata in ${packDir}`);
                }

                fs.writeFileSync(match.path, JSON.stringify(match.data, null, 4), 'utf8');
                report.updated.push({ name: match.data.name, pack: packDir, img: match.data.img });
            }
        } else {
            console.log(`  ❓ Nessun item corrispondente trovato per "${baseName}".`);
            report.skipped.push({ img: imgName, reason: "No matching item" });
        }
    }

    // 2. Analisi JSON Orfani (se non migrati)
    if (fs.existsSync(ORPHAN_JSON_DIR)) {
        const orphanJsons = fs.readdirSync(ORPHAN_JSON_DIR).filter(f => f.endsWith('.json'));
        console.log(`\nControllo ${orphanJsons.length} JSON orfani...`);

        for (const jsonName of orphanJsons) {
            const orphanPath = path.join(ORPHAN_JSON_DIR, jsonName);
            const content = JSON.parse(fs.readFileSync(orphanPath, 'utf8'));
            
            // Verifico se questo item esiste già nel main compendium (per ID o nome esatto)
            const exists = await findItemInMainPacks(content.name);
            if (exists.length === 0) {
                const targetPack = getTargetPack(content.name);
                const destJsonDir = path.join(SRC_ROOT, targetPack);
                const destJsonPath = path.join(destJsonDir, jsonName);

                console.log(`  🆕 Spostamento nuovo item: ${content.name} -> ${targetPack}`);
                if (!fs.existsSync(destJsonDir)) fs.mkdirSync(destJsonDir, { recursive: true });
                
                // Aggiorno l'immagine prima di spostare se l'immagine è stata spostata
                const imgBasename = path.basename(content.img);
                content.img = `modules/witcher-compendium/assets/${targetPack}/${imgBasename}`;
                
                fs.writeFileSync(destJsonPath, JSON.stringify(content, null, 4), 'utf8');
                // fs.unlinkSync(orphanPath); // Non elimino per ora per cautela
                report.created.push({ name: content.name, pack: targetPack });
            } else {
                console.log(`  ℹ️ Item "${content.name}" già presente nei pack principali. Salto.`);
            }
        }
    }

    fs.writeFileSync(path.join(REPO_ROOT, 'scratch', 'safe_migration_report.json'), JSON.stringify(report, null, 2));
    console.log(`\n✅ Operazione conclusa. Aggiornati: ${report.updated.length}, Creati: ${report.created.length}.`);
}

main().catch(console.error);
