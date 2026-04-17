// Witcher Compendium Maintenance Tool: Sign Variant Icon Updater
// VERSION: 1.0.0
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Maps Witcher Sign variants to their specific icons and updates JSON metadata in src-packs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const JSON_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'MAGIA', 'base', 'witcher-signs-variant');
const ASSETS_PREFIX = 'modules/witcher-compendium/assets/MAGIA/segni/';

const MAPPINGS = {
    'Aard': 'Aard.webp',
    'Igni': 'Igni.webp',
    'Yrden': 'Yrden.webp',
    'Quen': 'Quen.webp',
    'Axii': 'Axii.webp'
};

function processSignVariants() {
    if (!fs.existsSync(JSON_DIR)) return;

    let updated = 0;
    const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const fpath = path.join(JSON_DIR, file);
        try {
            const content = fs.readFileSync(fpath, 'utf8');
            const data = JSON.parse(content);
            const name = data.name || '';
            
            for (const [key, icon] of Object.entries(MAPPINGS)) {
                if (name.includes(key)) {
                    const newImg = `${ASSETS_PREFIX}${icon}`;
                    if (data.img !== newImg) {
                        data.img = newImg;
                        fs.writeFileSync(fpath, JSON.stringify(data, null, 4), 'utf8');
                        updated++;
                    }
                    break;
                }
            }
        } catch (e) {
            console.error(`❌ Error processing ${file}: ${e.message}`);
        }
    }
    console.log(`✅ Updated ${updated} Witcher Sign variants.`);
}

processSignVariants();
