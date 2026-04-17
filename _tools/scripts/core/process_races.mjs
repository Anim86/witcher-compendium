// Witcher Compendium Maintenance Tool: Race Benefit Processor
// VERSION: 1.0.0
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Maps racial benefit names to specific icons and updates JSON metadata in src-packs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const JSON_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'CORE', 'witcher-races');
const ASSETS_PREFIX = 'modules/witcher-compendium/assets/RAZZE/';

const MAPPINGS = {
    'Vista Acuta': 'Occhio_Bianco.webp',
    'Sensibilità Magica': 'Occhio_Bianco.webp',
    'Resistenza alla Corruzione': 'Difesa_Bianca.webp',
    'Robusto': 'Difesa_Bianca.webp',
    'Pelle Coriacea': 'Difesa_Bianca.webp',
    'Artigianato': 'Tecnica_Bianca.webp',
    'Ingegno': 'Tecnica_Bianca.webp',
    'Commercio': 'Sociale_Bianca.webp',
    'Carismatico': 'Sociale_Bianca.webp',
    'Furtivo': 'Fisico_Bianco.webp'
};

function processRaces() {
    if (!fs.existsSync(JSON_DIR)) return;

    let updated = 0;
    const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const fpath = path.join(JSON_DIR, file);
        try {
            const content = fs.readFileSync(fpath, 'utf8');
            const data = JSON.parse(content);
            let changed = false;

            if (data.items) {
                for (const item of data.items) {
                    for (const [key, icon] of Object.entries(MAPPINGS)) {
                        if (item.name.includes(key)) {
                            const newImg = `${ASSETS_PREFIX}${icon}`;
                            if (item.img !== newImg) {
                                item.img = newImg;
                                changed = true;
                                updated++;
                            }
                        }
                    }
                }
            }

            if (changed) {
                fs.writeFileSync(fpath, JSON.stringify(data, null, 4), 'utf8');
            }
        } catch (e) {
            console.error(`❌ Error processing ${file}: ${e.message}`);
        }
    }
    console.log(`✅ Updated ${updated} racial benefits.`);
}

processRaces();
