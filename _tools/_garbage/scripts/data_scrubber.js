const fs = require('fs');
const path = require('path');

const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs';
const workListPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';

// 1. Recursive JSON Fixer
function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

console.log("Starting global encoding fix...");
walk(srcPacksDir, (filePath) => {
    if (filePath.endsWith('.json')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Replacements
        content = content.replace(/Ã—/g, 'x');
        content = content.replace(/QualitÃ/g, 'Qualità');
        content = content.replace(/Qualitàà/g, 'Qualità'); // Fix double replacement if occurred
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed encoding in: ${filePath}`);
        }
    }
});

// 2. Work List Scrubber
console.log("Cleaning up work_list.json...");
let workListData = JSON.parse(fs.readFileSync(workListPath, 'utf8'));

for (const packKey in workListData) {
    let items = workListData[packKey];
    
    // Apply fixes to names
    items.forEach(item => {
        item.name = item.name.replace(/Ã—/g, 'x')
                             .replace(/QualitÃ/g, 'Qualità')
                             .replace(/Qualit/g, 'Qualità');
    });
    
    // Remove duplicates (case-insensitive name check)
    const seen = new Set();
    workListData[packKey] = items.filter(item => {
        const key = item.name.toLowerCase().trim();
        if (seen.has(key)) {
            console.log(`Removing duplicate from work_list: [${packKey}] ${item.name}`);
            return false;
        }
        seen.add(key);
        return true;
    });
}

fs.writeFileSync(workListPath, JSON.stringify(workListData, null, 2), 'utf8');
console.log("Data scrubbing complete.");
