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

// Map of all descriptions by item name (for items that are NOT schemas)
const itemDescriptions = {};

console.log('Mapping item descriptions...');

walkDir(SRC_PACKS, (filePath) => {
    if (!filePath.endsWith('.json')) return;
    if (filePath.includes('Schemi_di_Fabbricazione')) return; // Skip schemas for mapping
    
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const desc = data.system.description || "";
        
        // Skip broken descriptions even in items
        if (desc.match(/[TPCS]\s\d\s[DSR]/)) return;
        
        if (desc.length > 20) {
            itemDescriptions[data.name] = desc;
        }
    } catch (e) {}
});

console.log('Sanitizing broken descriptions in schemas...');

walkDir(SRC_PACKS, (filePath) => {
    if (!filePath.endsWith('.json')) return;
    if (!filePath.includes('Schemi_di_Fabbricazione')) return; // Only target schemas
    
    try {
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let desc = data.system.description || "";
        let itemName = data.name.replace('Schema: ', '');
        
        // Check if broken
        if (desc.match(/[TPCS]\s\d\s[DSR]/) || desc.match(/\d[dD]\d\+\d\s\d+\s\d+/) || desc.match(/Portata\sN\/A/)) {
            console.log(`Cleaning up broken description for: ${data.name}`);
            
            // Try to find matching item description
            if (itemDescriptions[itemName]) {
                data.system.description = itemDescriptions[itemName];
                console.log(`  -> Restored from item: ${itemName}`);
            } else {
                data.system.description = `<p>Uno schema dettagliato che illustra i procedimenti necessari per forgiare o fabbricare: <strong>${itemName}</strong>.</p>`;
                console.log(`  -> Set to standard placeholder.`);
            }
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        }
    } catch (e) {}
});

console.log('Sanitization complete.');
