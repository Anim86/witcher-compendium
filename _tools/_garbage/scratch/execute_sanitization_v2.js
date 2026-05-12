const fs = require('fs');
const path = require('path');

const csvPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/inventory_equip.csv';
const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/EQUIPAGGIAMENTO_E_TRASPORTI/';
const orphanDir = path.join(srcPacksDir, '_review_orphans');

// Normalized base name helper
function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
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
        const baseName = fileName.replace(/_[a-z0-9]{16}\.json$/, '').replace(/\.json$/, '');
        csvItems.push({ 
            name, 
            fileName, 
            normBaseName: normalize(baseName)
        });
    }
});

// 2. Get all actual files
function getJsonFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
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

const report = {
    renamed: [],
    movedToOrphans: [],
    restoredFromOrphans: [],
    alreadyCorrect: [],
    missing: [],
    errors: []
};

const foundCsvItems = new Set();

// 3. Process actual files
actualFiles.forEach(f => {
    const baseName = f.name.replace(/_[a-z0-9]{16}\.json$/, '').replace(/\.json$/, '');
    const normBaseName = normalize(baseName);
    
    // Find matching CSV item
    let match = csvItems.find(item => item.fileName.toLowerCase() === f.name.toLowerCase());
    if (!match) {
        match = csvItems.find(item => item.normBaseName === normBaseName);
    }

    if (match) {
        foundCsvItems.add(match.fileName);
        
        let targetDir = path.dirname(f.path);
        if (targetDir.includes('_review_orphans')) {
            const itemName = match.name.toLowerCase();
            if (itemName.includes('armatura') || itemName.includes('brache') || itemName.includes('elmo') || itemName.includes('scudo')) {
                targetDir = path.join(srcPacksDir, 'Armi_e_Armature', 'witcher-armor');
            } else if (itemName.includes('spada') || itemName.includes('arco') || itemName.includes('balestra') || itemName.includes('pugnale')) {
                targetDir = path.join(srcPacksDir, 'Armi_e_Armature', 'witcher-weapons');
            } else {
                targetDir = path.join(srcPacksDir, 'Attrezzatura_e_Oggetti', 'witcher-equipment');
            }
            report.restoredFromOrphans.push(f.name);
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetPath = path.join(targetDir, match.fileName);
        
        if (f.name === match.fileName && f.path === targetPath) {
            report.alreadyCorrect.push(f.name);
        } else {
            try {
                console.log(`Renaming/Moving: ${f.name} -> ${match.fileName}`);
                fs.renameSync(f.path, targetPath);
                report.renamed.push({ from: f.name, to: match.fileName, path: targetPath });
            } catch (err) {
                console.error(`Error renaming ${f.name}: ${err.message}`);
                report.errors.push({ file: f.name, error: err.message });
            }
        }
    } else {
        if (!f.path.includes('_review_orphans')) {
            console.log(`Moving to orphans: ${f.name}`);
            if (!fs.existsSync(orphanDir)) fs.mkdirSync(orphanDir);
            const orphanPath = path.join(orphanDir, f.name);
            try {
                fs.renameSync(f.path, orphanPath);
                report.movedToOrphans.push(f.name);
            } catch (err) {
                console.error(`Error moving to orphans ${f.name}: ${err.message}`);
                report.errors.push({ file: f.name, error: err.message });
            }
        }
    }
});

// 4. Identify missing
csvItems.forEach(item => {
    if (!foundCsvItems.has(item.fileName)) {
        report.missing.push(item);
    }
});

// 5. Final Report
fs.writeFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/sanitization_report_v2.json', JSON.stringify(report, null, 2));

console.log(`\nSanitization V2 Complete (with error handling):`);
console.log(`- Already correct: ${report.alreadyCorrect.length}`);
console.log(`- Renamed/Moved: ${report.renamed.length}`);
console.log(`- Restored from Orphans: ${report.restoredFromOrphans.length}`);
console.log(`- Moved to Orphans: ${report.movedToOrphans.length}`);
console.log(`- Missing: ${report.missing.length}`);
console.log(`- Errors: ${report.errors.length}`);
