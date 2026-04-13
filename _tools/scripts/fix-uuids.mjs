import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SRC_PACKS_DIR = '_tools/src-packs';
const ID_REGEX = /^[0-9a-f]{16}$/;

function generateUUID() {
    return crypto.randomBytes(8).toString('hex');
}

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

function main() {
    console.log("--- UUID Audit & Remediation ---");
    const files = walk(SRC_PACKS_DIR);
    const idMap = new Map(); // id -> [files]
    const invalidFiles = [];

    // First pass: scan all IDs
    files.forEach(file => {
        try {
            const content = JSON.parse(fs.readFileSync(file, 'utf8'));
            const id = content._id;
            if (!ID_REGEX.test(id)) {
                invalidFiles.push(file);
            } else {
                if (!idMap.has(id)) {
                    idMap.set(id, []);
                }
                idMap.get(id).push(file);
            }
        } catch (e) {
            console.error(`Error reading ${file}: ${e.message}`);
        }
    });

    const duplicateIds = [...idMap.entries()].filter(([id, files]) => files.length > 1);
    const allExistingIds = new Set([...idMap.keys()]);

    function getUniqueReplacement() {
        let newId = generateUUID();
        while (allExistingIds.has(newId)) {
            newId = generateUUID();
        }
        allExistingIds.add(newId);
        return newId;
    }

    console.log(`Found ${invalidFiles.length} files with invalid IDs.`);
    console.log(`Found ${duplicateIds.length} duplicate ID sets.`);

    let fixedCount = 0;

    // Fix invalid IDs
    invalidFiles.forEach(file => {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const oldId = content._id;
        const newId = getUniqueReplacement();
        content._id = newId;
        fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
        console.log(`Fixed Invalid ID: ${oldId} -> ${newId} in ${file}`);
        fixedCount++;
    });

    // Fix duplicate IDs (keep the first one, change others)
    duplicateIds.forEach(([id, fileList]) => {
        // Keep the first file, change the others
        for (let i = 1; i < fileList.length; i++) {
            const file = fileList[i];
            const content = JSON.parse(fs.readFileSync(file, 'utf8'));
            const newId = getUniqueReplacement();
            content._id = newId;
            fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
            console.log(`Fixed Duplicate ID: ${id} -> ${newId} in ${file}`);
            fixedCount++;
        }
    });

    console.log(`Total IDs fixed: ${fixedCount}`);
}

main();
