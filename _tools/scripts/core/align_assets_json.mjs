// Witcher Compendium Maintenance Tool: JSON Path Aligner
// VERSION: 1.0.0
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Normalizes 'img' fields in src-packs JSON files to match the expected assets folder hierarchy.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script's new home in _tools/scripts/core
const REPO_ROOT = path.resolve(__dirname, '../../../');
const srcRoot = path.join(REPO_ROOT, '_tools', 'src-packs');
const assetsPrefix = 'modules/witcher-compendium/assets';

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const idRegex = /_([a-z0-9]{16})$/;

console.log("🚀 Starting JSON image path alignment...");

walkDir(srcRoot, (filePath) => {
    if (!filePath.endsWith('.json')) return;

    const relPath = path.relative(srcRoot, filePath);
    const dirName = path.dirname(relPath).replace(/\\/g, '/');
    let fileName = path.basename(relPath, '.json');

    // Strip internal ID if present (e.g. _7e2ac369b1344d85)
    fileName = fileName.replace(idRegex, '');
    
    // Normalize filename
    fileName = fileName.replace(/\s+/g, '_');

    const newImgPath = `${assetsPrefix}/${dirName}/${fileName}.webp`;

    try {
        let rawContent = fs.readFileSync(filePath, 'utf8');
        // Handle BOM
        if (rawContent.charCodeAt(0) === 0xFEFF) {
            rawContent = rawContent.slice(1);
        }
        
        const data = JSON.parse(rawContent);
        const currentImg = data.img || "";
        
        // We only update if it points to our module or is a placeholder/default
        const isInternal = currentImg.startsWith("modules/witcher-compendium/") || 
                           currentImg.includes("assets/placeholder.webp") || 
                           currentImg === "icons/svg/item-bag.svg" || 
                           currentImg === "";
        
        if (currentImg === newImgPath) return;

        if (isInternal) {
            console.log(`Updating ${relPath}: ${currentImg} -> ${newImgPath}`);
            data.img = newImgPath;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        }
    } catch (e) {
        console.error(`❌ Error processing ${filePath}: ${e.message}`);
    }
});

console.log("✅ JSON Alignment complete.");
