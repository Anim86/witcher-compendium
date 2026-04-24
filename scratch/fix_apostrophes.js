const fs = require('fs');
const path = require('path');

const baseDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/';

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.json')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('’')) {
                console.log(`Fixing apostrophes in: ${fullPath}`);
                content = content.replace(/’/g, "'");
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

processDirectory(baseDir);
console.log('Done!');
