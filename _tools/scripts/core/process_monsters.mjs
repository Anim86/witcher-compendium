// Witcher Compendium Maintenance Tool: Monster Processor
// VERSION: 1.0.0
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Optimizes monster images (WebP) and automatically links them to the corresponding Actor JSON files in src-packs.

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script's home in _tools/scripts/core
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_DIR = path.join(REPO_ROOT, 'images'); // Input images folder
const DEST_DIR = path.join(REPO_ROOT, 'witcher-compendium', 'assets', 'BESTIARIO', 'MOSTRI');
const SRC_PACKS_DIRS = [
    path.join(REPO_ROOT, '_tools', 'src-packs', 'BESTIARIO', 'MOSTRI'),
    path.join(REPO_ROOT, '_tools', 'src-packs', 'BESTIARIO', 'PNG')
];

async function processMonsters() {
    if (!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    if (!fs.existsSync(SRC_DIR)) {
        console.error(`❌ Source image directory not found: ${SRC_DIR}`);
        return;
    }

    const jsonEntries = [];
    for (const dir of SRC_PACKS_DIRS) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            jsonEntries.push({
                path: path.join(dir, file),
                filename: file.toLowerCase()
            });
        }
    }

    const imageFiles = fs.readdirSync(SRC_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.webp', '.png', '.jpg', '.jpeg'].includes(ext);
    });

    console.log(`🚀 Found ${imageFiles.length} images to process.`);

    for (const imgFile of imageFiles) {
        const fullSrcPath = path.join(SRC_DIR, imgFile);
        const stats = fs.statSync(fullSrcPath);
        if (stats.isDirectory()) continue;

        const baseName = path.parse(imgFile).name.toLowerCase();
        const destFileName = `${baseName}.webp`;
        const destFullPath = path.join(DEST_DIR, destFileName);
        const relativeAssetPath = `modules/witcher-compendium/assets/BESTIARIO/MOSTRI/${destFileName}`;

        try {
            console.log(`Processing: ${imgFile}`);
            await sharp(fullSrcPath)
                .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 75 })
                .toFile(destFullPath);
            
            // Link to JSON
            const matchingJsons = jsonEntries.filter(e => {
                const jsonBase = e.filename.split('_')[0];
                return jsonBase === baseName || e.filename.includes(baseName);
            });

            for (const match of matchingJsons) {
                let content = fs.readFileSync(match.path, 'utf8');
                const data = JSON.parse(content);

                data.img = relativeAssetPath;
                if (data.prototypeToken) {
                    data.prototypeToken.texture.src = relativeAssetPath;
                }

                fs.writeFileSync(match.path, JSON.stringify(data, null, 4), 'utf8');
                console.log(`  🔗 Linked to ${path.basename(match.path)}`);
            }
        } catch (err) {
            console.error(`  ❌ Error processing ${imgFile}:`, err.message);
        }
    }
}

processMonsters()
    .then(() => console.log('✅ Monster processing complete.'))
    .catch(console.error);
