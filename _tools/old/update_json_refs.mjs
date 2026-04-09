import fs from 'fs';
import path from 'path';

const SRC_PACKS_DIR = '../../_tools/src-packs';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function updateJsonReferences(filePath) {
    if (!filePath.endsWith('.json')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Pattern to match "modules/witcher-compendium/assets/Immagini/..." 
    // and "modules/witcher-compendium/images/..."
    // and replace with optimized path and .webp
    
    // Replace: modules/witcher-compendium/assets/Immagini/some_file.png 
    // with: modules/witcher-compendium/assets/optimized/assets/Immagini/some_file.webp
    
    // Replace: modules/witcher-compendium/images/professions/some_file.png
    // with: modules/witcher-compendium/assets/optimized/images/professions/some_file.webp

    // Generalized regex: modules/witcher-compendium/(assets/Immagini|images/professions|images/races)/([^"]+)\.(png|jpg|jpeg)
    const regex = /modules\/witcher-compendium\/(assets\/Immagini|assets\/Immagini_Chaos|images\/professions|images\/races)\/([^"]+)\.(png|jpg|jpeg)/gi;
    
    // New pattern: modules/witcher-compendium/assets/optimized/<path_after_module>/<filename>.webp
    content = content.replace(regex, (match, folder, filename, ext) => {
        return `modules/witcher-compendium/assets/optimized/${folder}/${filename}.webp`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

console.log('Starting bulk update of JSON references...');
walkDir(SRC_PACKS_DIR, updateJsonReferences);
console.log('Completed bulk update.');
