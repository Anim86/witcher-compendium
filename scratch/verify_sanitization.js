const fs = require('fs');
const path = require('path');

const packsRoot = '_tools/src-packs';

function findFile(dir, pattern) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            const res = findFile(fullPath, pattern);
            if (res) return res;
        } else if (f.includes(pattern)) {
            return fullPath;
        }
    }
    return null;
}

const crogioloFile = findFile(packsRoot, 'crogiolo');
if (crogioloFile) {
    console.log(`Found file: ${crogioloFile}`);
    const content = JSON.parse(fs.readFileSync(crogioloFile, 'utf8'));
    console.log(`Img path: ${content.img}`);
} else {
    console.log('File not found');
}
