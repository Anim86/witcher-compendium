import fs from 'fs';
import path from 'path';

const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs';
const todoFile = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/COMPENDIO_COMPONENTI.md';

const encodingMap = {
    'Ã ': 'à',
    'Ã¨': 'è',
    'Ã©': 'é',
    'Ã¬': 'ì',
    'Ã²': 'ò',
    'Ã¹': 'ù',
    'Ã ': 'à', // Sometimes it appears with a trailing space if not handled correctly
};

function fixContent(content) {
    let fixed = content;
    for (const [broken, correct] of Object.entries(encodingMap)) {
        fixed = fixed.split(broken).join(correct);
    }
    return fixed;
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.json')) {
            results.push(file);
        }
    });
    return results;
}

// 1. Fix JSON files
console.log("Fixing JSON source packs...");
const files = walk(srcPacksDir);
let jsonCount = 0;
for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const fixed = fixContent(content);
    if (content !== fixed) {
        fs.writeFileSync(file, fixed, 'utf8');
        jsonCount++;
    }
}
console.log(`Fixed ${jsonCount} JSON files.`);

// 2. Fix the documentation file
console.log("Fixing COMPENDIO_COMPONENTI.md...");
if (fs.existsSync(todoFile)) {
    const content = fs.readFileSync(todoFile, 'utf8');
    const fixed = fixContent(content);
    if (content !== fixed) {
        fs.writeFileSync(todoFile, fixed, 'utf8');
        console.log("Fixed COMPENDIO_COMPONENTI.md.");
    }
}
