import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_PACKS_DIR = path.join(REPO_ROOT, '_tools/src-packs');

function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD') // Normalize to decomposed form
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/[-\s]+/g, '_') // Replace spaces/dashes with underscores
        .replace(/^-+|-+$/g, ''); // Trim underscores
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.json')) {
            results.push(fullPath);
        }
    });
    return results;
}

function normalizeFilenames() {
    console.log("📂 [NORMALIZZAZIONE] Avvio rinomina file JSON...");
    
    const files = walk(SRC_PACKS_DIR);
    let renamedCount = 0;

    files.forEach(fpath => {
        try {
            let contentStr = fs.readFileSync(fpath, 'utf8');
            if (contentStr.charCodeAt(0) === 0xFEFF) contentStr = contentStr.slice(1);
            if (!contentStr.trim()) return;

            const data = JSON.parse(contentStr);
            const id = data._id;
            const name = data.name;

            if (!id || !name) {
                console.warn(`⚠️ Warning: ${path.basename(fpath)} manca di nome o ID interno.`);
                return;
            }

            const newBasename = `${slugify(name)}_${id}.json`;
            const currentDir = path.dirname(fpath);
            const newPath = path.join(currentDir, newBasename);

            if (fpath.toLowerCase() !== newPath.toLowerCase()) {
                if (fs.existsSync(newPath)) {
                    console.warn(`⚠️ Collisione: ${newBasename} esiste già. Salto.`);
                } else {
                    fs.renameSync(fpath, newPath);
                    console.log(`✅ Rinominato: ${path.basename(fpath)} -> ${newBasename}`);
                    renamedCount++;
                }
            } else if (path.basename(fpath) !== newBasename) {
                // Case change only
                fs.renameSync(fpath, newPath);
                console.log(`✅ Casing corretto: ${path.basename(fpath)} -> ${newBasename}`);
                renamedCount++;
            }
        } catch (e) {
            console.error(`❌ Errore su ${path.basename(fpath)}: ${e.message}`);
        }
    });

    console.log(`\n✨ [DONE] File rinominati: ${renamedCount}`);
}

normalizeFilenames();
