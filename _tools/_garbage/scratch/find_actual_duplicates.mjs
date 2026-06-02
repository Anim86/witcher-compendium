import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const eqDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment';

function getMd5(filepath) {
    const buffer = fs.readFileSync(filepath);
    return crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
}

const files = fs.readdirSync(eqDir).filter(f => f.endsWith('.webp'));
const hashMap = {};

for (const file of files) {
    const hash = getMd5(path.join(eqDir, file));
    if (!hashMap[hash]) {
        hashMap[hash] = [];
    }
    hashMap[hash].push(file);
}

console.log("=== DUPLICATE GROUPS ON DISK ===");
for (const [hash, group] of Object.entries(hashMap)) {
    if (group.length > 1) {
        console.log(`\nGroup Hash: ${hash} (${group.length} files)`);
        console.log(group.join(', '));
    }
}
