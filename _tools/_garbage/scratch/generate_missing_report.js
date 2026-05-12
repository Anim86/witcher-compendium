const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const SRC_PACKS_DIR = path.join(ROOT_DIR, '_tools', 'src-packs');
const ASSETS_BASE_DIR = path.join(ROOT_DIR, 'witcher-compendium');
const OUTPUT_FILE = path.join(ROOT_DIR, 'report-da-generare.md');

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

const jsonFiles = walk(SRC_PACKS_DIR);
const packs = {};

jsonFiles.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        
        const packName = path.basename(path.dirname(filePath));
        const itemName = json.name || 'Senza Nome';
        const imgPath = json.img || '';
        
        let physicalPath = '';
        let exists = false;
        
        if (imgPath.startsWith('modules/witcher-compendium/')) {
            const relativePart = imgPath.replace('modules/witcher-compendium/', '');
            physicalPath = path.join(ASSETS_BASE_DIR, relativePart);
            exists = fs.existsSync(physicalPath);
        } else if (imgPath) {
            physicalPath = path.join(ASSETS_BASE_DIR, imgPath);
            exists = fs.existsSync(physicalPath);
        }
        
        // Only interested in missing files
        if (!exists) {
            if (!packs[packName]) {
                packs[packName] = [];
            }
            packs[packName].push({
                name: itemName,
                img: imgPath
            });
        }
    } catch (e) {
        console.error(`Errore nel file ${filePath}:`, e);
    }
});

const today = new Date().toLocaleDateString('it-IT');
let report = `# Icone da Generare — ${today}\n`;

// Convert packs object to array for sorting
const packList = Object.keys(packs).map(name => ({
    name: name,
    missingItems: packs[name],
    count: packs[name].length
}));

// Sort by missing count descending
packList.sort((a, b) => b.count - a.count);

packList.forEach(pack => {
    report += `## PACK: ${pack.name} (${pack.count} mancanti)\n`;
    report += `| Nome voce | img attuale nel JSON |\n`;
    report += `|-----------|---------------------|\n`;
    
    // Sort items by name inside the pack for better readability
    pack.missingItems.sort((a, b) => a.name.localeCompare(b.name));
    
    pack.missingItems.forEach(item => {
        // Cleaning path for the table as in the example assets/...
        let displayPath = item.img;
        if (displayPath.startsWith('modules/witcher-compendium/')) {
            displayPath = displayPath.replace('modules/witcher-compendium/', '');
        }
        report += `| ${item.name} | ${displayPath} |\n`;
    });
    report += `\n`;
});

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Report generato: ${OUTPUT_FILE}`);
console.log(`Packs con mancanti: ${packList.length}`);
