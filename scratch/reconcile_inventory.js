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
            fileList.push({ name: file, path: filePath });
        }
    });
    return fileList;
}

const actualFiles = getJsonFiles(srcPacksDir);

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').slice(1);

const reconciliation = [];

lines.forEach(line => {
    if (!line.trim()) return;
    const match = line.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
    if (match) {
        const itemName = match[1];
        const csvFileName = match[4];
        
        // Try to find a file that starts with the same name (ignoring hash)
        // Extract base name from CSV filename (everything before the hash)
        const csvBaseName = csvFileName.replace(/_[a-z0-9]{16}\.json$/, '').toLowerCase();
        
        const bestMatches = actualFiles.filter(f => {
            const fBaseName = f.name.replace(/_[a-z0-9]{16}\.json$/, '').toLowerCase();
            return fBaseName === csvBaseName;
        });

        if (bestMatches.length > 0) {
            const exactMatch = bestMatches.find(f => f.name === csvFileName);
            if (exactMatch) {
                reconciliation.push({ status: 'OK', itemName, csvFileName, actualFileName: exactMatch.name });
            } else {
                reconciliation.push({ status: 'HASH_MISMATCH', itemName, csvFileName, actualFileName: bestMatches[0].name });
            }
        } else {
            reconciliation.push({ status: 'MISSING', itemName, csvFileName });
        }
    }
});

const stats = {
    OK: reconciliation.filter(r => r.status === 'OK').length,
    HASH_MISMATCH: reconciliation.filter(r => r.status === 'HASH_MISMATCH').length,
    MISSING: reconciliation.filter(r => r.status === 'MISSING').length
};

console.log(`Reconciliation Stats:`);
console.log(JSON.stringify(stats, null, 2));

console.log(`\nHash Mismatches (first 10):`);
console.log(JSON.stringify(reconciliation.filter(r => r.status === 'HASH_MISMATCH').slice(0, 10), null, 2));

console.log(`\nMissing Items (first 10):`);
console.log(JSON.stringify(reconciliation.filter(r => r.status === 'MISSING').slice(0, 10), null, 2));
