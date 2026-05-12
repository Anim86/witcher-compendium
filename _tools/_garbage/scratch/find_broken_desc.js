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

const brokenItems = [];

console.log('Scanning for broken descriptions...');

walkDir(SRC_PACKS, (filePath) => {
    if (!filePath.endsWith('.json')) return;
    
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const desc = data.system.description || "";
        
        // Pattern: look for weapon stats strings like "T 0 D" or "2d6+1 10 1" or "P/C 0 D"
        if (desc.match(/[TPCS]\s\d\s[DSR]/) || desc.match(/\d[dD]\d\+\d\s\d+\s\d+/) || desc.match(/Portata\sN\/A/)) {
            brokenItems.push({
                name: data.name,
                path: filePath,
                snippet: desc.substring(0, 100)
            });
        }
    } catch (e) {}
});

console.log(`Found ${brokenItems.length} items with potentially broken descriptions.`);

if (brokenItems.length > 0) {
    const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/broken_desc_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(brokenItems, null, 2));
    console.log(`Report saved to: ${reportPath}`);
}
