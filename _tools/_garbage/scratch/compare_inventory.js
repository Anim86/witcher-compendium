const fs = require('fs');
const path = require('path');

const csvPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/inventory_equip.csv';
const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/';

function getJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getJsonFiles(filePath, fileList);
        } else if (file.endsWith('.json')) {
            fileList.push(file);
        }
    });
    return fileList;
}

const actualFiles = getJsonFiles(srcPacksDir);
const actualFilesLower = actualFiles.map(f => f.toLowerCase());

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').slice(1);

const missing = [];
const found = [];
const caseMismatches = [];

lines.forEach(line => {
    if (!line.trim()) return;
    const match = line.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
    if (match) {
        const name = match[1];
        const csvFileName = match[4];
        const csvFileNameLower = csvFileName.toLowerCase();
        
        const index = actualFilesLower.indexOf(csvFileNameLower);
        if (index !== -1) {
            const actualFileName = actualFiles[index];
            if (actualFileName !== csvFileName) {
                caseMismatches.push({ name, csvFileName, actualFileName });
            }
            found.push({ name, fileName: actualFileName });
        } else {
            missing.push({ name, csvFileName });
        }
    }
});

console.log(`Summary:`);
console.log(`- Total items in CSV: ${lines.length}`);
console.log(`- Found in src-packs: ${found.length}`);
console.log(`- Case mismatches: ${caseMismatches.length}`);
console.log(`- Missing in src-packs: ${missing.length}`);

if (caseMismatches.length > 0) {
    console.log(`\nCase Mismatches (first 10):`);
    console.log(JSON.stringify(caseMismatches.slice(0, 10), null, 2));
}

if (missing.length > 0) {
    console.log(`\nMissing Items (first 20):`);
    console.log(JSON.stringify(missing.slice(0, 20), null, 2));
}
