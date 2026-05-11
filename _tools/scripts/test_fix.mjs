import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { slugify } from './core/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy');

const name = "Formula: Bufera di Neve";
const targetBase = slugify(name); // formula_bufera_di_neve
const suffix = "_wp_";

console.log(`Target Base: ${targetBase}`);

if (fs.existsSync(ASSETS_DIR)) {
    const files = fs.readdirSync(ASSETS_DIR);
    files.forEach(f => {
        const base = path.basename(f, path.extname(f)).toLowerCase();
        console.log(`Checking file: ${f} (base: ${base})`);
        if (base === (targetBase + suffix)) {
            console.log(`MATCH FOUND! Renaming ${f} to ${targetBase}.webp`);
            // fs.renameSync(path.join(ASSETS_DIR, f), path.join(ASSETS_DIR, targetBase + ".webp"));
        }
    });
} else {
    console.log(`Dir not found: ${ASSETS_DIR}`);
}
