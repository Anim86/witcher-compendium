import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const TARGET_DIR = path.join(REPO_ROOT, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy');

const images = [
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/formula_olio_anti_ancestrali_1778447850790.png', target: 'Formula_Olio_Anti-Ancestrali_wo_.webp' }
];

async function processImages() {
    for (const img of images) {
        const dest = path.join(TARGET_DIR, img.target);
        console.log(`Processing ${img.target}...`);
        await sharp(img.src)
            .resize(512, 512)
            .webp({ quality: 85 })
            .toFile(dest);
        console.log(`Done: ${dest}`);
    }
}

processImages().catch(console.error);
