import fs from 'fs';
import path from 'path';

const missingMd = fs.readFileSync('E:/AntigravitiProgetti/CompendioTheWitcher/_tools/reports/missing-assets.md', 'utf8');
const assetsDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets';

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const allAssets = getAllFiles(assetsDir);
const assetNames = allAssets.map(f => path.basename(f).toLowerCase());

const missingLines = missingMd.split('\n').filter(l => l.startsWith('|') && !l.includes('Nome | File JSON'));

let foundElsewhere = [];
let completelyMissing = [];

for (const line of missingLines) {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 4) continue;
    const name = parts[1];
    const expectedPath = parts[3];
    const expectedName = path.basename(expectedPath).toLowerCase();
    
    let matchIndex = assetNames.indexOf(expectedName);
    if (matchIndex !== -1) {
        foundElsewhere.push({ name, expected: expectedPath, actual: allAssets[matchIndex] });
    } else {
        // Simple fuzzy match: string inclusion
        const baseNameNoExt = expectedName.replace('.webp', '');
        let fuzzyMatch = allAssets.find(a => {
            const actualName = path.basename(a).toLowerCase().replace('.webp', '');
            return actualName.includes(baseNameNoExt) || baseNameNoExt.includes(actualName) && actualName.length > 4;
        });
        
        if (fuzzyMatch) {
            foundElsewhere.push({ name, expected: expectedPath, actual: fuzzyMatch });
        } else {
            completelyMissing.push({ name, expected: expectedPath });
        }
    }
}

console.log(`Totale analizzati: ${foundElsewhere.length + completelyMissing.length}`);
console.log(`Esistono ma in path/nome errato: ${foundElsewhere.length}`);
console.log(`Completamente mancanti: ${completelyMissing.length}`);

fs.writeFileSync('E:/AntigravitiProgetti/CompendioTheWitcher/scratch/missing_analysis.json', JSON.stringify({foundElsewhere, completelyMissing}, null, 2));
