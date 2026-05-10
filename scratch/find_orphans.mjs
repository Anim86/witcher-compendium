import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const PACKS_SRC_DIR = path.join(REPO_ROOT, '_tools', 'src-packs');

// 1. Trova tutte le immagini fisiche
function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            if (filePath.endsWith('.webp')) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

const physicalFiles = getAllFiles(ASSETS_DIR);
const physicalFileNames = physicalFiles.map(f => path.basename(f).toLowerCase());

// 2. Trova tutte le immagini referenziate dai JSON
const referencedFileNames = new Set();

function processJSONs(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processJSONs(fullPath);
        } else if (fullPath.endsWith('.json')) {
            try {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                // Cerca la proprietà img
                if (data.img && data.img.endsWith('.webp')) {
                    referencedFileNames.add(path.basename(data.img).toLowerCase());
                }
            } catch (e) {
                // Ignore parsing errors for now
            }
        }
    }
}

processJSONs(PACKS_SRC_DIR);

// 3. Confronto: Trova le orfane
const orphans = [];

for (const pFile of physicalFiles) {
    const bName = path.basename(pFile).toLowerCase();
    if (!referencedFileNames.has(bName)) {
        orphans.push(pFile);
    }
}

// 4. Salva il report
let report = `# Report Immagini Orfane\n\n`;
report += `Trovate ${orphans.length} immagini in assets/ che NON sono collegate a nessun oggetto del compendio.\n\n`;

for (const orphan of orphans) {
    report += `- ${path.basename(orphan)} (${path.relative(ASSETS_DIR, orphan)})\n`;
}

fs.writeFileSync(path.join(REPO_ROOT, 'scratch', 'orphan_assets_report.md'), report, 'utf8');
console.log(`Analisi completata! Trovate ${orphans.length} immagini orfane su ${physicalFiles.length} totali.`);
