const fs = require('fs');
const path = require('path');

const PACKS_DIR = path.join(__dirname, 'packs');

const packs = fs.readdirSync(PACKS_DIR);
let removed = 0;

packs.forEach(packFolder => {
    const packPath = path.join(PACKS_DIR, packFolder);
    if (!fs.statSync(packPath).isDirectory()) return;

    const files = fs.readdirSync(packPath).filter(f => f.endsWith('.json'));
    const seenNames = new Set();

    files.forEach(file => {
        const filePath = path.join(packPath, file);
        try {
            const entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const nameKey = entry.name.toLowerCase().trim();
            
            if (seenNames.has(nameKey)) {
                console.log(`Removing duplicate: ${packFolder}/${file} (${entry.name})`);
                fs.unlinkSync(filePath);
                removed++;
            } else {
                seenNames.add(nameKey);
            }
        } catch (e) {
            console.error(`Error processing ${file}: ${e.message}`);
        }
    });
});

console.log(`Deduplication complete. Removed ${removed} files.`);
