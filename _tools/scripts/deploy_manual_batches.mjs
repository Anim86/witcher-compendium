import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Jimp } from 'jimp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione percorsi
const REPO_ROOT = path.dirname(path.dirname(__dirname));
const SOURCE_ROOT = path.join(REPO_ROOT, "temp_images");
const ASSETS_BASE = path.join(REPO_ROOT, "witcher-compendium", "assets", "MAGIA_E_MALEDIZIONI");

// Mapping delle sottocartelle
const SUB_MAPPING = {
    "witcher-invocations": "Incantesimi_e_Rituali/witcher-invocations",
    "witcher-rituali": "Incantesimi_e_Rituali/witcher-rituals",
    "witcher-rituals": "Incantesimi_e_Rituali/witcher-rituals",
    "witcher-rituals-chaos": "Incantesimi_e_Rituali/witcher-rituals-chaos",
    "witcher-runes": "Incantesimi_e_Rituali/witcher-runes",
    "witcher-spells": "Incantesimi_e_Rituali/witcher-spells",
    "witcher-spells-chaos": "Incantesimi_e_Rituali/witcher-spells-chaos"
};

// Gestione speciale per file con nomi Gemini generici
const SPECIAL_FILES = {
    "Gemini_Generated_Image_lzgf8ulzgf8ulzgf.png": "illusione_interattiva.webp"
};

console.log("Avvio processing asset manuali (Node.js version with Jimp)...");

async function processImages() {
    for (const [srcSub, destSub] of Object.entries(SUB_MAPPING)) {
        const srcDir = path.join(SOURCE_ROOT, srcSub);
        if (!fs.existsSync(srcDir)) continue;

        console.log(`\nCartella: ${srcSub}`);

        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
        for (const file of files) {
            const pngPath = path.join(srcDir, file);
            let newName = SPECIAL_FILES[file] || (path.parse(file).name + ".webp");
            
            const targetDir = path.join(ASSETS_BASE, destSub);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path.join(targetDir, newName);

            console.log(`  - ${file} -> ${newName}`);

            try {
                const image = await Jimp.read(pngPath);
                await image
                    .resize({ w: 512, h: 512 })
                    .quality(80)
                    .write(targetPath);
            } catch (err) {
                console.error(`  [ERRORE] Durante il processing di ${file}: ${err.message}`);
            }
        }
    }
    console.log("\nProcessing completato.");
}

processImages();
