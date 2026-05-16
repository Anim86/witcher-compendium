/**
 * VERSION: 2.0.0
 * LAST_UPDATE: 2026-04-14
 * DESCRIPTION: Audits and fixes missing or duplicate IDs in the source JSON packs.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to repository root
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_PACKS_DIR = path.join(REPO_ROOT, '_tools/src-packs');
const ID_REGEX = /^[0-9a-f]{16}$/;

function generateUUID() {
    return crypto.randomBytes(8).toString('hex');
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.json')) {
            results.push(fullPath);
        }
    });
    return results;
}

function main() {
    console.log("🔍 [UUID] Audit & Remediation started...");
    
    if (!fs.existsSync(SRC_PACKS_DIR)) {
        console.error(`❌ Error: Source directory not found at ${SRC_PACKS_DIR}`);
        process.exit(1);
    }

    const files = walk(SRC_PACKS_DIR);
    const idMap = new Map(); // id -> [files]
    const invalidFiles = [];

    // First pass: scan all IDs
    files.forEach(file => {
        try {
            let contentStr = fs.readFileSync(file, 'utf8');
            // Strip BOM if present
            if (contentStr.charCodeAt(0) === 0xFEFF) {
                contentStr = contentStr.slice(1);
            }
            
            if (!contentStr.trim()) {
                console.warn(`⚠️ Warning: ${file} is empty.`);
                return;
            }

            const content = JSON.parse(contentStr);
            const id = content._id;
            if (!id || !ID_REGEX.test(id)) {
                invalidFiles.push(file);
            } else {
                if (!idMap.has(id)) {
                    idMap.set(id, []);
                }
                idMap.get(id).push(file);
            }
        } catch (e) {
            console.error(`❌ Error reading ${file}: ${e.message}`);
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

    console.log(`📊 Found ${invalidFiles.length} files with invalid IDs.`);
    console.log(`📊 Found ${duplicateIds.length} duplicate ID sets.`);

    let fixedCount = 0;

    // Fix invalid IDs
    invalidFiles.forEach(file => {
        let contentStr = fs.readFileSync(file, 'utf8');
        if (contentStr.charCodeAt(0) === 0xFEFF) contentStr = contentStr.slice(1);
        const content = JSON.parse(contentStr);
        
        const oldId = content._id;
        const newId = getUniqueReplacement();
        content._id = newId;
        fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
        console.log(`✅ Fixed Invalid ID: ${oldId} -> ${newId} in ${path.relative(REPO_ROOT, file)}`);
        fixedCount++;
    });

    // Fix duplicate IDs (keep the first one, change others)
    duplicateIds.forEach(([id, fileList]) => {
        // Keep the first file, change the others
        for (let i = 1; i < fileList.length; i++) {
            const file = fileList[i];
            let contentStr = fs.readFileSync(file, 'utf8');
            if (contentStr.charCodeAt(0) === 0xFEFF) contentStr = contentStr.slice(1);
            const content = JSON.parse(contentStr);

            const newId = getUniqueReplacement();
            content._id = newId;
            fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
            console.log(`✅ Fixed Duplicate ID: ${id} -> ${newId} in ${path.relative(REPO_ROOT, file)}`);
            fixedCount++;
        }
    });

    console.log(`✨ [DONE] Total IDs fixed: ${fixedCount}`);
}

main();
