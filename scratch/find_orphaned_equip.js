const fs = require('fs');
const path = require('path');

const csvPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/inventory_equip.csv';
const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/EQUIPAGGIAMENTO_E_TRASPORTI/';

function getJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getJsonFiles(filePath, fileList);
        } else if (file.endsWith('.json')) {
            fileList.push({ name: file, path: filePath });
        }
    });
    return fileList;
}

const actualFiles = getJsonFiles(srcPacksDir);
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').slice(1);

const csvFileNames = lines.map(line => {
    const match = line.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
    return match ? match[4].toLowerCase() : null;
}).filter(n => n !== null);

const csvBaseNames = csvFileNames.map(f => f.replace(/_[a-z0-9]{16}\.json$/, '').replace(/\.json$/, ''));

const orphans = [];

actualFiles.forEach(f => {
    const fileNameLower = f.name.toLowerCase();
    const baseNameLower = fileNameLower.replace(/_[a-z0-9]{16}\.json$/, '').replace(/\.json$/, '');
    
    if (!csvFileNames.includes(fileNameLower) && !csvBaseNames.includes(baseNameLower)) {
        orphans.push(f);
    }
});

console.log(`Orphaned Files in EQUIPAGGIAMENTO_E_TRASPORTI: ${orphans.length}`);
if (orphans.length > 0) {
    console.log(`\nOrphans (first 20):`);
    orphans.slice(0, 20).forEach(o => console.log(o.name));
}
