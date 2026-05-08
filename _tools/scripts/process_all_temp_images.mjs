import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione percorsi
const REPO_ROOT = path.dirname(path.dirname(__dirname));
const SOURCE_ROOT = path.join(REPO_ROOT, "temp_images");
const ASSETS_BASE = path.join(REPO_ROOT, "witcher-compendium", "assets", "MAGIA_E_MALEDIZIONI");
const ASSETS_BASE_EQ = path.join(REPO_ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO_E_TRASPORTI");

// Mapping delle sottocartelle
const SUB_MAPPING = {
    "witcher-gifts": "Doni_del_Caos/witcher-gifts",
    "witcher-invocations": "Doni_del_Caos/witcher-invocations",
    "witcher-rituals": "Incantesimi_e_Rituali/witcher-rituals",
    "witcher-rituals-chaos": "Incantesimi_e_Rituali/witcher-rituals-chaos",
    "witcher-runes": "Incantesimi_e_Rituali/witcher-runes",
    "witcher-spells": "Incantesimi_e_Rituali/witcher-spells",
    "witcher-spells-chaos": "Incantesimi_e_Rituali/witcher-spells-chaos",
    "witcher-curses": "Maledizioni_e_Fatture/witcher-curses",
    "witcher-hexes": "Maledizioni_e_Fatture/witcher-hexes",
    "witcher-hexes-base": "Maledizioni_e_Fatture/witcher-hexes-base",
    "witcher-necromanzia": "Necromanzia/witcher-necromanzia"
};

console.log("Avvio processing asset manuali in temp_images...");

async function processImages() {
    for (const [srcSub, destSub] of Object.entries(SUB_MAPPING)) {
        const srcDir = path.join(SOURCE_ROOT, srcSub);
        if (!fs.existsSync(srcDir)) continue;

        console.log(`\nCartella: ${srcSub}`);

        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
        for (const file of files) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            
            let newName = baseName.toLowerCase().replace(/[\s\-]+/g, '_').replace(/[^a-z0-9_]/g, '') + ".webp";
            
            const targetDir = path.join(ASSETS_BASE, destSub);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path.join(targetDir, newName);

            console.log(`  - ${file} -> ${newName}`);

            try {
                await sharp(path.join(srcDir, file))
                    .resize({ width: 512, height: 512, fit: 'inside' })
                    .webp({ quality: 80 })
                    .toFile(targetPath);
            } catch (err) {
                console.error(`  [ERRORE] Durante il processing di ${file}: ${err.message}`);
            }
        }
    }
    
    // Process _review_orphans
    const orphansDir = path.join(SOURCE_ROOT, "_review_orphans");
    if (fs.existsSync(orphansDir)) {
        console.log(`\nCartella: _review_orphans`);
        const files = fs.readdirSync(orphansDir).filter(f => f.endsWith('.webp'));
        for (const file of files) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            let newName = baseName.toLowerCase().replace(/[\s\-]+/g, '_').replace(/[^a-z0-9_]/g, '') + ".webp";
            
            const targetDir = path.join(ASSETS_BASE_EQ, "_review_orphans");
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path.join(targetDir, newName);

            console.log(`  - ${file} -> ${newName}`);

            try {
                await sharp(path.join(orphansDir, file))
                    .resize({ width: 512, height: 512, fit: 'inside' })
                    .webp({ quality: 80 })
                    .toFile(targetPath);
            } catch (err) {
                console.error(`  [ERRORE] Durante il processing di ${file}: ${err.message}`);
            }
        }
    }

    console.log("\nProcessing completato.");
}

processImages();
