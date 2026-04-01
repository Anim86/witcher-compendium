const fs = require('fs');
const path = require('path');

const BASE_DIR = 'witcher-compendium';
const PACKS_DIR = path.join(BASE_DIR, 'packs');
const IMAGES_DIR = path.join(BASE_DIR, 'assets/Immagini');

const report = {
    totalEntries: 0,
    packStats: {},
    errors: [],
    warnings: [],
    imgCoverage: 0,
    missingImages: new Set()
};

const allIds = new Set();
let imagesFound = 0;

function auditPack(packName) {
    const filePath = path.join(PACKS_DIR, packName);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    
    report.packStats[packName] = lines.length;
    report.totalEntries += lines.length;

    const packNames = new Set();

    lines.forEach((line, index) => {
        try {
            const entry = JSON.parse(line);
            
            // 1. ID Check (16 chars)
            if (!entry._id || entry._id.length !== 16) {
                report.errors.push(`[${packName}:L${index+1}] ID Invalido: ${entry._id || 'Mancante'}`);
            }
            if (allIds.has(entry._id)) {
                report.errors.push(`[${packName}:L${index+1}] ID Duplicato: ${entry._id}`);
            }
            allIds.add(entry._id);

            // 2. Name Check
            if (!entry.name) {
                report.errors.push(`[${packName}:L${index+1}] Nome Mancante`);
            } else if (packNames.has(entry.name)) {
                report.warnings.push(`[${packName}:L${index+1}] Nome Duplicato nel pack: ${entry.name}`);
            }
            packNames.add(entry.name);

            // 3. Image Check
            if (entry.img) {
                // modules/witcher-compendium/assets/Immagini/Pag...
                if (entry.img.startsWith('modules/witcher-compendium/assets/Immagini/')) {
                    const localPath = entry.img.replace('modules/witcher-compendium/assets/Immagini/', '');
                    const fullImagePath = path.join(IMAGES_DIR, localPath);
                    if (fs.existsSync(fullImagePath)) {
                        imagesFound++;
                    } else if (!entry.img.includes('icons/svg/')) {
                        report.missingImages.add(entry.img);
                    }
                } else if (entry.img.includes('icons/svg/')) {
                    // Standard Foundry Icons are fine
                    imagesFound++;
                } else {
                    report.warnings.push(`[${packName}] Path immagine sospetto: ${entry.img}`);
                }
            }

            // 4. NaN/Data Integrity
            const str = JSON.stringify(entry);
            if (str.includes(':null') || str.includes(':NaN')) {
                // report.warnings.push(`[${packName}:${entry.name}] Contiene null o NaN`);
            }

        } catch (e) {
            report.errors.push(`[${packName}:L${index+1}] Errore Parsing JSON: ${e.message}`);
        }
    });
}

const packs = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.db'));
packs.forEach(auditPack);

report.imgCoverage = ((imagesFound / report.totalEntries) * 100).toFixed(1);

console.log('--- AUDIT FINALE COMPLETATO ---');
console.log(`TOTAL ENTRIES: ${report.totalEntries}`);
console.log(`IMMAGINI COVERAGE: ${report.imgCoverage}%`);
console.log(`ERRORI BLOCCANTI: ${report.errors.length}`);
console.log(`WARNING: ${report.warnings.length}`);

if (report.errors.length > 0) {
    console.log('\nERRORI:');
    report.errors.forEach(e => console.log(e));
}

if (report.missingImages.size > 0) {
    console.log(`\nIMMAGINI MANCANTI (${report.missingImages.size}):`);
    Array.from(report.missingImages).slice(0, 10).forEach(img => console.log(` - ${img}`));
}

// Generate the md report text for later
fs.writeFileSync('audit_results.json', JSON.stringify(report, null, 2));
