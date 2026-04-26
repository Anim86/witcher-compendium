const fs = require('fs');
const path = require('path');

const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs';
const workListPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';

// 1. Recursive JSON Fixer
function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

console.log("Starting targeted data scrub...");

walk(srcPacksDir, (filePath) => {
    if (filePath.endsWith('.json')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Fix double/triple replacement of Qualità
        content = content.replace(/Qualitàà+/g, 'Qualità');
        
        // Fix specific truncation
        content = content.replace(/Pugnale di Diaspro Sang\./g, 'Pugnale di Diaspro Sanguigno');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath}`);
        }
    }
});

// 2. Work List Scrubber
console.log("Syncing work_list.json...");
let workListData = JSON.parse(fs.readFileSync(workListPath, 'utf8'));

for (const packKey in workListData) {
    workListData[packKey].forEach(item => {
        // Fix Qualità
        item.name = item.name.replace(/Qualitàà+/g, 'Qualità');
        
        // Fix Dagger
        if (item.name === 'Pugnale di Diaspro Sang.') {
            item.name = 'Pugnale di Diaspro Sanguigno';
            item.filename = 'Pugnale_di_Diaspro_Sanguigno.webp'; // Update filename for consistency
        }
    });
}

fs.writeFileSync(workListPath, JSON.stringify(workListData, null, 2), 'utf8');
console.log("Targeted scrubbing complete.");
