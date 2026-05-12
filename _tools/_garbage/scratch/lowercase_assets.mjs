import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../');
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium', 'assets');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

console.log("🚀 Lowercasing all assets in " + ASSETS_DIR);

walkDir(ASSETS_DIR, (filePath) => {
    if (!filePath.endsWith('.webp') && !filePath.endsWith('.png')) return;

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const newName = base.toLowerCase() + ext.toLowerCase();
    const newPath = path.join(dir, newName);

    if (filePath !== newPath) {
        if (fs.existsSync(newPath) && filePath.toLowerCase() === newPath.toLowerCase()) {
            // Case-only change on case-insensitive FS
            const tempPath = filePath + ".tmp";
            fs.renameSync(filePath, tempPath);
            fs.renameSync(tempPath, newPath);
            console.log(`✅ Fixed casing: ${path.basename(filePath)} -> ${newName}`);
        } else if (!fs.existsSync(newPath)) {
            fs.renameSync(filePath, newPath);
            console.log(`✅ Renamed: ${path.basename(filePath)} -> ${newName}`);
        } else {
             console.warn(`⚠️ Collision for ${newName}, skipping.`);
        }
    }
});

console.log("✅ Asset normalization complete.");
