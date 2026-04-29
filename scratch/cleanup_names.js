const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const SRC_PACKS = path.join(ROOT, '_tools', 'src-packs');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

console.log('Cleaning up item names in packs...');

walkDir(SRC_PACKS, (jsonPath) => {
    if (!jsonPath.endsWith('.json')) return;

    try {
        let content = fs.readFileSync(jsonPath, 'utf8');
        let data = JSON.parse(content);
        let oldName = data.name;
        
        if (!oldName) return;

        // Common messes:
        // "à\u00a0" (UTF-8 à followed by NBSP)
        // "à " (UTF-8 à followed by space)
        // broken characters from encoding mismatches
        
        let newName = oldName
            .replace(/à\u00a0/g, 'à')
            .replace(/é\u00a0/g, 'é')
            .replace(/ì\u00a0/g, 'ì')
            .replace(/ò\u00a0/g, 'ò')
            .replace(/ù\u00a0/g, 'ù')
            .trim();

        if (newName !== oldName) {
            console.log(`Fixing name: "${oldName}" -> "${newName}" (${jsonPath})`);
            data.name = newName;
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4), 'utf8');
        }
    } catch (e) {
        // console.error(`Error processing ${jsonPath}: ${e.message}`);
    }
});

console.log('\nCleanup complete!');
