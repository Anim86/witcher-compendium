import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { slugify, getFiles } from './core/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');

function normalizeAssets() {
    console.log("📂 [ASSETS] Avvio normalizzazione nomi file iconografia...");
    
    const files = getFiles(ASSETS_ROOT, (f) => f.match(/\.(webp|png|jpg)$/i));
    let renamedCount = 0;
    let collisions = 0;

    files.forEach(fpath => {
        const dirname = path.dirname(fpath);
        const filename = path.basename(fpath);
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);

        const newBase = slugify(base);
        const newFilename = newBase + ext.toLowerCase();
        const newPath = path.join(dirname, newFilename);

        if (filename !== newFilename) {
            if (fs.existsSync(newPath)) {
                // If the target exists, check if it's the same file (case insensitive) or a real collision
                if (filename.toLowerCase() === newFilename.toLowerCase()) {
                    // Case only change on case-insensitive FS (Windows)
                    // We need a temporary rename
                    const tempPath = newPath + ".tmp";
                    fs.renameSync(fpath, tempPath);
                    fs.renameSync(tempPath, newPath);
                    console.log(`✅ Casing corretto: ${filename} -> ${newFilename}`);
                    renamedCount++;
                } else {
                    console.warn(`⚠️ Collisione in ${path.relative(ASSETS_ROOT, dirname)}: ${filename} -> ${newFilename} (esiste già).`);
                    collisions++;
                }
            } else {
                fs.renameSync(fpath, newPath);
                console.log(`✅ Rinominato: ${filename} -> ${newFilename}`);
                renamedCount++;
            }
        }
    });

    console.log(`\n✨ [DONE] File rinominati: ${renamedCount}`);
    if (collisions > 0) console.log(`⚠️ Collisioni saltate: ${collisions}`);
}

normalizeAssets();
