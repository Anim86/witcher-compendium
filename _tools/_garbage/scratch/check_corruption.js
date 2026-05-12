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

walk(rootDir, (filePath) => {
    if (filePath.endsWith('.json')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let aCount = (content.match(/à/g) || []).length;
        if (aCount > 50) {
            console.log(`${filePath}: ${aCount} instances of 'à'`);
        }
    }
});
