import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ANALYSIS_FILE = path.join(REPO_ROOT, 'scratch', 'missing_analysis.json');
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium', 'assets');

const data = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));
const completelyMissing = data.completelyMissing;

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

const allAssets = getAllFiles(ASSETS_DIR);
const assetBaseNames = allAssets.map(f => path.basename(f).toLowerCase().replace('.webp', ''));

const stopWords = ['di', 'da', 'in', 'per', 'con', 'su', 'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'uno', 'schema', 'trofeo', 'x3', 'x5', 'x10'];

let potentialMatches = {};

for (const item of completelyMissing) {
    const itemName = item.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const tokens = itemName.split(/\s+/).filter(t => t.length > 2 && !stopWords.includes(t));
    
    for (const token of tokens) {
        for (let i = 0; i < assetBaseNames.length; i++) {
            if (assetBaseNames[i].includes(token)) {
                if (!potentialMatches[item.name]) {
                    potentialMatches[item.name] = new Set();
                }
                potentialMatches[item.name].add(allAssets[i]);
            }
        }
    }
}

let report = `## Deep Audit Candidates\n\n`;
let candidateCount = 0;

for (const [name, matches] of Object.entries(potentialMatches)) {
    report += `**${name}** might be one of:\n`;
    for (const match of matches) {
        report += `- ${path.basename(match)} (${path.relative(ASSETS_DIR, match)})\n`;
    }
    report += `\n`;
    candidateCount++;
}

fs.writeFileSync(path.join(REPO_ROOT, 'scratch', 'deep_audit_report.md'), report, 'utf8');
console.log(`Deep audit completato. Elementi con possibili match: ${candidateCount} su ${completelyMissing.length}`);
