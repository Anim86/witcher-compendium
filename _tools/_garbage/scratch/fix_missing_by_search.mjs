import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const MISSING_REPORT = path.join(REPO_ROOT, '_tools', 'reports', 'missing-assets.md');

// 1. Leggi i file mancanti dal report
const lines = fs.readFileSync(MISSING_REPORT, 'utf8').split('\n');
const missingExpectedPaths = [];

for (const line of lines) {
    if (line.includes('|') && line.includes('.webp') && !line.includes('Percorso Atteso')) {
        const parts = line.split('|');
        if (parts.length >= 4) {
            const expectedPath = parts[3].trim();
            if (expectedPath.endsWith('.webp')) {
                missingExpectedPaths.push(expectedPath);
            }
        }
    }
}

console.log(`Trovati ${missingExpectedPaths.length} file mancanti da risolvere.`);

// 2. Trova tutte le immagini fisiche disponibili (per nome base)
const physicalFilesMap = new Map();

function getAllFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath);
        } else {
            if (filePath.endsWith('.webp')) {
                const bName = path.basename(filePath).toLowerCase();
                // Memorizza la prima occorrenza trovata per quel nome
                if (!physicalFilesMap.has(bName)) {
                    physicalFilesMap.set(bName, filePath);
                }
            }
        }
    }
}

getAllFiles(ASSETS_DIR);
console.log(`Scannerizzate ${physicalFilesMap.size} immagini uniche su disco.`);

// 3. Risolvi copiando il file corretto
let copiedCount = 0;
let notFoundCount = 0;

for (const expectedRelPath of missingExpectedPaths) {
    const bName = path.basename(expectedRelPath).toLowerCase();
    const expectedAbsPath = path.join(ASSETS_DIR, expectedRelPath);

    if (physicalFilesMap.has(bName)) {
        const sourcePath = physicalFilesMap.get(bName);
        
        // Evita di copiare un file su se stesso
        if (sourcePath !== expectedAbsPath) {
            const targetDir = path.dirname(expectedAbsPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            fs.copyFileSync(sourcePath, expectedAbsPath);
            copiedCount++;
            console.log(`✅ Risolto: ${bName} -> ${expectedRelPath}`);
        }
    } else {
        console.warn(`❌ Non trovato in tutto assets/: ${bName}`);
        notFoundCount++;
    }
}

console.log(`\n🎉 Ricerca e copia completata!`);
console.log(`File recuperati e copiati al path giusto: ${copiedCount}`);
console.log(`File ancora introvabili: ${notFoundCount}`);
