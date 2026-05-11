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

// Carico la lista di asset generici dall'audit per riferimento
const GENERIC_AUDIT_CONTENT = fs.readFileSync(path.join(REPO_ROOT, 'scratch', 'generic_assets_audit.md'), 'utf8');
const GENERIC_PLACEHOLDERS = GENERIC_AUDIT_CONTENT.match(/- (.+\.webp)/g)?.map(m => m.replace('- ', '')) || [];

async function findItemInMainPacks(itemName, excludeOrphans = true) {
    const results = [];
    const walk = (dir) => {
        if (excludeOrphans && dir.includes('_review_orphans')) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.json')) {
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                // Confronto case-insensitive del nome
                if (content.name && content.name.toLowerCase().includes(itemName.toLowerCase())) {
                    results.push({ path: fullPath, data: content });
                }
            }
        }
    };
    walk(SRC_ROOT);
    return results;
}

async function main() {
    console.log("🚀 Analisi asset orfani e riallineamento...");

    const orphanImages = fs.readdirSync(ORPHAN_ASSETS_DIR).filter(f => f.endsWith('.webp'));
    console.log(`Trovate ${orphanImages.length} immagini orfane.`);

    const report = [];

    for (const imgName of orphanImages) {
        // Rimuovo estensione e snake_case per cercare il nome
        const baseName = path.parse(imgName).name.replace(/_/g, ' ');
        console.log(`\nCerco item per: ${imgName} ("${baseName}")`);

        const matches = await findItemInMainPacks(baseName);
        
        if (matches.length === 0) {
            console.log(`  ⚠️ Nessun match trovato nei pack principali.`);
            report.push({ img: imgName, status: "MISSING_ITEM", matches: 0 });
            continue;
        }

        console.log(`  ✅ Trovati ${matches.length} match.`);
        for (const match of matches) {
            const currentImg = match.data.img || "";
            const isGeneric = GENERIC_PLACEHOLDERS.some(p => currentImg.endsWith(p));
            
            console.log(`    - Match: ${match.data.name} in ${path.relative(SRC_ROOT, match.path)}`);
            console.log(`      Img attuale: ${currentImg} ${isGeneric ? '[GENERIC]' : ''}`);

            // Determino la destinazione dell'immagine
            // Basata sulla posizione del JSON sorgente
            const jsonRelPath = path.relative(SRC_ROOT, match.path);
            const jsonDir = path.dirname(jsonRelPath); // es: EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons
            
            const targetAssetDir = path.join(ASSETS_ROOT, jsonDir);
            const targetAssetPath = path.join(targetAssetDir, imgName);

            // Sposto l'immagine
            if (!fs.existsSync(targetAssetDir)) fs.mkdirSync(targetAssetDir, { recursive: true });
            
            // Copio (non sposto per sicurezza in questa fase di test, o sposto se sono sicuro)
            fs.copyFileSync(path.join(ORPHAN_ASSETS_DIR, imgName), targetAssetPath);
            
            // Aggiorno il JSON
            const newImgPath = `modules/witcher-compendium/assets/${jsonDir.replace(/\\/g, '/')}/${imgName}`;
            match.data.img = newImgPath;
            fs.writeFileSync(match.path, JSON.stringify(match.data, null, 4), 'utf8');
            
            console.log(`      ✨ Aggiornato a: ${newImgPath}`);
            report.push({ img: imgName, item: match.data.name, pack: jsonDir, status: "UPDATED" });
        }
    }

    // Gestione specifica per "armi" sbagliate
    // Il cliente dice che dentro armi ci sono immagini sbagliate.
    // Probabilmente si riferisce a "Scuola dell'Orso" e simili che usavano placeholder.
    
    fs.writeFileSync(path.join(REPO_ROOT, 'scratch', 'orphan_migration_report.json'), JSON.stringify(report, null, 2));
    console.log("\n✅ Migrazione completata. Report salvato in scratch/orphan_migration_report.json");
}

main().catch(console.error);
