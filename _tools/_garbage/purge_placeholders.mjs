import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFiles } from './core/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');

const PLACEHOLDER_SIZE = 17144;

function purgePlaceholders() {
    console.log("🔥 Purging all 17KB placeholders from assets...");
    const files = getFiles(ASSETS_ROOT);
    let count = 0;

    files.forEach(f => {
        const stat = fs.statSync(f);
        if (stat.size === PLACEHOLDER_SIZE) {
            fs.unlinkSync(f);
            console.log(`🗑️ Deleted: ${path.relative(ASSETS_ROOT, f)}`);
            count++;
        }
    });

    console.log(`\n✅ Done! Purged ${count} placeholders.`);
}

purgePlaceholders();
