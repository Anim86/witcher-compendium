import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const ANALYSIS_FILE = path.join(REPO_ROOT, 'scratch', 'missing_analysis.json');

console.log("🚀 Inizio allineamento immagini (180 elementi)...");

const data = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));

let copiedCount = 0;
let errorCount = 0;

for (const item of data.foundElsewhere) {
    const actualPath = item.actual;
    const expectedPath = path.join(ASSETS_ROOT, item.expected);
    
    // Assicuriamoci che la cartella di destinazione esista
    const targetDir = path.dirname(expectedPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
        if (fs.existsSync(actualPath)) {
            // Copiamo il file mantenendo l'originale
            fs.copyFileSync(actualPath, expectedPath);
            console.log(`✅ Copiato: ${path.basename(actualPath)} -> ${item.expected}`);
            copiedCount++;
        } else {
            console.warn(`⚠️ Errore: File sorgente non trovato -> ${actualPath}`);
            errorCount++;
        }
    } catch (err) {
        console.error(`❌ Errore durante la copia di ${item.name}: ${err.message}`);
        errorCount++;
    }
}

console.log(`\n🎉 Allineamento completato!`);
console.log(`File copiati con successo: ${copiedCount}`);
console.log(`Errori: ${errorCount}`);
