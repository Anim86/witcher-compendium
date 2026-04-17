const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.resolve(__dirname, '../src-packs');

function fixId(id) {
    if (!id) return null;
    let newId = id.toString();
    if (newId.length === 16) return newId;
    
    if (newId.length < 16) {
        // Pad with leading zeros
        return newId.padStart(16, '0');
    } else {
        // Truncate to 16 characters (last 16)
        return newId.substring(newId.length - 16);
    }
}

async function processDir(dir) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    let fixedCount = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const oldId = data._id;
        const newId = fixId(oldId);
        
        if (oldId !== newId) {
            data._id = newId;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            fixedCount++;
        }
    }
    return fixedCount;
}

(async () => {
    console.log('--- FIXING ID LENGTHS IN SRC-PACKS ---');
    const folders = fs.readdirSync(SRC_ROOT).filter(f => fs.statSync(path.join(SRC_ROOT, f)).isDirectory());
    
    let totalFixed = 0;
    for (const folder of folders) {
        const fixed = await processDir(path.join(SRC_ROOT, folder));
        if (fixed > 0) {
            console.log(`Folder ${folder}: Fixed ${fixed} IDs`);
            totalFixed += fixed;
        }
    }
    
    console.log(`\nTotal IDs normalized to 16 characters: ${totalFixed}`);
    console.log('Now run node rebuild_leveldb.js to apply changes to the packs.');
})();
