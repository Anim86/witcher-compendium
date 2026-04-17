import fs from 'fs';
import path from 'path';

const SRC_DIR = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/BESTIARIO/Mostri';
const ASSETS_DIR = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/witcher-compendium/assets/BESTIARIO/Mostri';

const packs = ['witcher-monsters', 'witcher-dlc-ms-monsters'];
const missing = [];

for (const pack of packs) {
    const packDir = path.join(SRC_DIR, pack);
    if (!fs.existsSync(packDir)) continue;

    const files = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
        const data = JSON.parse(fs.readFileSync(path.join(packDir, file), 'utf8'));
        const img = data.img;

        if (!img || img.startsWith('icons/')) {
            missing.push({ name: data.name, pack, file, img, reason: 'Placeholder icons/' });
            continue;
        }

        // Check if local file exists
        if (img.includes('assets/BESTIARIO/Mostri/')) {
            const relativePath = img.split('assets/BESTIARIO/Mostri/')[1];
            const fullPath = path.join(ASSETS_DIR, relativePath);
            if (!fs.existsSync(fullPath)) {
                missing.push({ name: data.name, pack, file, img, reason: 'File missing in assets' });
            }
        }
    }
}

console.log(JSON.stringify(missing, null, 2));
