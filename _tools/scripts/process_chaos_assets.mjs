import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.dirname(path.dirname(__dirname));
const SOURCE_DIR = path.join(REPO_ROOT, "temp_images", "witcher-special-chaos");
const DEST_EQUIP = path.join(REPO_ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO_E_TRASPORTI", "Attrezzatura_e_Oggetti", "witcher-equipment");
const DEST_CHAOS = path.join(REPO_ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO_E_TRASPORTI", "Attrezzatura_e_Oggetti", "witcher-special-chaos");
const DEST_MAGIC = path.join(REPO_ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO_E_TRASPORTI", "Reliquie_e_Artefatti", "witcher-magic-items");

const AMULET_MAPPING = {
    "amuleto_incantato_1_incantesimo.png": "Amuleto_Incantato__1_Incantesimo_.webp",
    "amuleto_incantato_2_incantesimi.png": "Amuleto_Incantato__2_Incantesimi_.webp",
    "amuleto_incantato_3_incantesimi.png": "Amuleto_Incantato__3_Incantesimi_.webp",
    "amuleto_incantato_4_incantesimi.png": "Amuleto_Incantato__4_Incantesimi_.webp"
};

async function processImages() {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log("Source directory not found: " + SOURCE_DIR);
        return;
    }

    const files = fs.readdirSync(SOURCE_DIR);
    for (const file of files) {
        const srcPath = path.join(SOURCE_DIR, file);
        
        // Handle Amulets (move to witcher-equipment)
        if (AMULET_MAPPING[file]) {
            const destPath = path.join(DEST_EQUIP, AMULET_MAPPING[file]);
            console.log(`Processing Amulet: ${file} -> ${AMULET_MAPPING[file]}`);
            await sharp(srcPath)
                .resize(512, 512)
                .webp({ quality: 85 })
                .toFile(destPath);
            continue;
        }

        // Handle other items (Chaos and Magic Items)
        const baseName = path.basename(file, path.extname(file));
        const destName = baseName.toLowerCase() + ".webp";
        
        // To Chaos folder
        const destPathChaos = path.join(DEST_CHAOS, destName);
        console.log(`Processing Chaos Item: ${file} -> ${destName}`);
        await sharp(srcPath)
            .resize(512, 512)
            .webp({ quality: 85 })
            .toFile(destPathChaos);

        // To Magic Items folder (if needed)
        const destPathMagic = path.join(DEST_MAGIC, destName);
        console.log(`Copying to Magic Items: ${destName}`);
        await sharp(srcPath)
            .resize(512, 512)
            .webp({ quality: 85 })
            .toFile(destPathMagic);
    }
    console.log("Done.");
}

processImages();
