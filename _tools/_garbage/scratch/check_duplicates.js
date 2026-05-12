const fs = require('fs');
const path = require('path');

const SRC_PACKS = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const itemsByName = {};
const duplicates = [];

console.log('Scanning for duplicates...');

walkDir(SRC_PACKS, (filePath) => {
    if (!filePath.endsWith('.json')) return;
    
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = data.name;
        const pack = path.relative(SRC_PACKS, path.dirname(filePath));
        
        if (!itemsByName[name]) {
            itemsByName[name] = [];
        }
        
        itemsByName[name].push({
            path: filePath,
            pack: pack
        });
    } catch (e) {}
});

for (const name in itemsByName) {
    if (itemsByName[name].length > 1) {
        duplicates.push({
            name: name,
            instances: itemsByName[name]
        });
    }
}

console.log(`Found ${duplicates.length} duplicate names.`);

if (duplicates.length > 0) {
    const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/duplicate_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(duplicates, null, 2));
    console.log(`Duplicate report saved to: ${reportPath}`);
}
