import fs from 'fs';
import path from 'path';

const ROOT_DIR = '_tools/src-packs';
const VALID_TYPES = [
    "Humanoid", "Necrophage", "Specter", "Beast", 
    "CursedOne", "Hybrid", "Insectoid", "Elementa", 
    "Relict", "Ogroid", "Draconid", "Vampire"
];

function walk(dir, callback) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath, callback);
        } else {
            callback(fullPath);
        }
    }
}

function audit() {
    let totalFound = 0;
    let mapped = 0;
    let unmapped = [];
    let invalid = [];

    walk(ROOT_DIR, (filePath) => {
        if (!filePath.endsWith('.json')) return;

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            if (data.type === 'monster') {
                totalFound++;
                const mType = data.system?.details?.monsterType;

                if (!mType) {
                    unmapped.push({ name: data.name || filePath, file: filePath });
                } else if (!VALID_TYPES.includes(mType)) {
                    invalid.push({ name: data.name || filePath, type: mType, file: filePath });
                } else {
                    mapped++;
                }
            }
        } catch (e) {
            // console.error(`Error reading ${filePath}: ${e.message}`);
        }
    });

    console.log(`Found ${totalFound} monsters.`);
    console.log(`Mapped: ${mapped} (${(totalFound > 0 ? (mapped / totalFound * 100).toFixed(1) : 0)}%)`);
    console.log(`Unmapped: ${unmapped.length}`);
    console.log(`Invalid: ${invalid.length}`);

    if (unmapped.length > 0) {
        console.log("\nUNMAPPED MONSTERS:");
        unmapped.forEach(m => console.log(`- ${m.name} (${m.file})`));
    }

    if (invalid.length > 0) {
        console.log("\nINVALID MONSTER TYPES:");
        invalid.forEach(m => console.log(`- ${m.name}: ${m.type} (${m.file})`));
    }
}

audit();
