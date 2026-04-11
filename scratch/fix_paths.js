const fs = require('fs');
const path = require('path');

const rootDir = path.join('c:', 'Users', 'apaci', 'Desktop', 'Script', 'witcher-compendium-main', '_tools', 'src-packs');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

let count = 0;

walk(rootDir, (filePath) => {
    if (filePath.endsWith('.json')) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            // Remove BOM if present
            content = content.replace(/^\uFEFF/, '');
            
            // Matches "img": "assets/..." or "img": "/assets/..." but NOT already "modules/witcher-compendium/"
            const pattern = /"img":\s*"(?!\/?modules\/witcher-compendium\/)(\/?assets\/[^"]+)"/g;
            
            let newContent = content.replace(pattern, (match, p1) => {
                let p = p1;
                if (p.startsWith('/')) p = p.substring(1);
                return `"img": "modules/witcher-compendium/${p}"`;
            });
            
            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                count++;
                console.log(`Fixed: ${filePath}`);
            }
        } catch (e) {
            console.error(`Error in ${filePath}: ${e.message}`);
        }
    }
});

console.log(`\nDone! Fixed ${count} files.`);
