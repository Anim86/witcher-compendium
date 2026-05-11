
const fs = require('fs');
const path = require('path');

const trophiesDir = '_tools/src-packs/REGOLAMENTO_E_NARRATIVA/Trofei/witcher-trophies';

if (!fs.existsSync(trophiesDir)) {
    console.error('Directory not found');
    process.exit(1);
}

const files = fs.readdirSync(trophiesDir).filter(f => f.endsWith('.json'));
const seen = new Map(); // Key: Name + Description, Value: fileName
const toDelete = [];
const toRename = [];

console.log(`Analyzing ${files.length} trophy files...`);

files.forEach(file => {
    const fpath = path.join(trophiesDir, file);
    const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    
    // Normalize name and description for comparison
    const name = data.name.trim();
    const desc = (data.system.description || '').trim();
    const key = `${name}|${desc}`;

    if (seen.has(key)) {
        console.log(`Duplicate found: ${file} is a duplicate of ${seen.get(key)}`);
        toDelete.push(fpath);
    } else {
        seen.set(key, file);
        
        // Check if it's an elemental trophy to rename it better
        if (name === 'Trofeo: Elementale') {
            let suffix = '';
            if (desc.includes('Ghiaccio')) suffix = ' (Ghiaccio)';
            else if (desc.includes('Fuoco')) suffix = ' (Fuoco)';
            else if (desc.includes('Terra')) suffix = ' (Terra)';
            
            if (suffix) {
                data.name = `Trofeo: Elementale${suffix}`;
                toRename.push({ fpath, data });
            }
        }
    }
});

console.log(`\n--- CLEANUP ---`);
toDelete.forEach(f => {
    fs.unlinkSync(f);
    console.log(`Deleted: ${path.basename(f)}`);
});

toRename.forEach(item => {
    fs.writeFileSync(item.fpath, JSON.stringify(item.data, null, 4), 'utf8');
    console.log(`Updated Name: ${item.data.name}`);
});

console.log(`\nCleaned up ${toDelete.length} duplicates and updated ${toRename.length} names.`);
