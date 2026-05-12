const fs = require('fs');
const path = require('path');

const csvPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/inventory_equip.csv';
const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/EQUIPAGGIAMENTO_E_TRASPORTI/';
const orphanDir = path.join(srcPacksDir, '_review_orphans');

if (!fs.existsSync(orphanDir)) {
    fs.mkdirSync(orphanDir);
}

// 1. Read CSV and map items
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').slice(1);

const csvItems = [];
lines.forEach(line => {
    if (!line.trim()) return;
    const match = line.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
    if (match) {
        const name = match[1];
        const fileName = match[4];
        const baseNameLower = fileName.replace(/_[a-z0-9]{16}\.json$/, '').replace(/\.json$/, '').toLowerCase();
        csvItems.push({ name, fileName, baseNameLower });
    }
});

// 2. Get all actual files
function getJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== '_review_orphans') {
                getJsonFiles(filePath, fileList);
            }
        } else if (file.endsWith('.json')) {
            fileList.push({ name: file, path: filePath });
        }
    });
    return fileList;
}

const actualFiles = getJsonFiles(srcPacksDir);

const report = {
    renamed: [],
    movedToOrphans: [],
    alreadyCorrect: [],
    missing: []
};

const foundCsvItems = new Set();

// 3. Process actual files
actualFiles.forEach(f => {
    const fileNameLower = f.name.toLowerCase();
    const baseNameLower = f.name.replace(/_[a-z0-9]{16}\.json$/, '').replace(/\.json$/, '').toLowerCase();
    
    // Find matching CSV item
    let match = csvItems.find(item => item.fileName.toLowerCase() === fileNameLower);
    if (!match) {
        match = csvItems.find(item => item.baseNameLower === baseNameLower);
    }

    if (match) {
        foundCsvItems.add(match.fileName);
        const targetPath = path.join(path.dirname(f.path), match.fileName);
        
        if (f.name === match.fileName) {
            report.alreadyCorrect.push(f.name);
        } else {
            console.log(`Renaming: ${f.name} -> ${match.fileName}`);
            fs.renameSync(f.path, targetPath);
            report.renamed.push({ from: f.name, to: match.fileName });
        }
    } else {
        console.log(`Moving to orphans: ${f.name}`);
        const orphanPath = path.join(orphanDir, f.name);
        fs.renameSync(f.path, orphanPath);
        report.movedToOrphans.push(f.name);
    }
});

// 4. Identify missing
csvItems.forEach(item => {
    if (!foundCsvItems.has(item.fileName)) {
        report.missing.push(item);
    }
});

// 5. Final Report
fs.writeFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/sanitization_report.json', JSON.stringify(report, null, 2));

console.log(`\nSanitization Complete:`);
console.log(`- Already correct: ${report.alreadyCorrect.length}`);
console.log(`- Renamed: ${report.renamed.length}`);
console.log(`- Moved to Orphans: ${report.movedToOrphans.length}`);
console.log(`- Missing: ${report.missing.length}`);
