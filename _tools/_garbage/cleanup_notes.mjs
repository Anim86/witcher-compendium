import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/EQUIPAGGIAMENTO/';

function processDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
        const filePath = path.join(currentDir, file);
        if (fs.statSync(filePath).isDirectory()) {
            processDir(filePath);
        } else if (file.endsWith('.json')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('"notes": "Nessuno"')) {
                console.log(`Replacing in ${filePath}`);
                content = content.replace(/"notes": "Nessuno"/g, '"notes": ""');
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
}

processDir(baseDir);
