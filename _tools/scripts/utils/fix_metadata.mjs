/**
 * VERSION: 2.1.0
 * LAST_UPDATE: 2026-04-14
 * DESCRIPTION: Sanity check for JSON metadata. Normalizes coreVersion, systemId, and removes legacy systemVersion.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to repository root
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_ROOT = path.join(REPO_ROOT, '_tools/src-packs');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.json')) {
            try {
                let bytes = fs.readFileSync(fullPath);
                if (bytes.length <= 3) continue;
                
                let content = bytes.toString('utf8');
                content = content.replace(/^\uFEFF/, '');
                
                let original = content;

                // Fix coreVersion: "14" -> 14
                content = content.replace(/"coreVersion":\s*"14"/g, '"coreVersion": 14');
                
                // Remove systemVersion (handle optional trailing comma)
                content = content.replace(/"systemVersion":\s*".*?",?\s*/g, '');
                
                // Fix possible trailing comma in the object
                content = content.replace(/,\s*}/g, '\n    }');
                
                // Ensure systemId is correct
                content = content.replace(/"systemId":\s*".*?"/g, '"systemId": "TheWitcherItaNewSystem"');

                if (content !== original) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`✅ Normalized metadata in ${path.relative(REPO_ROOT, fullPath)}`);
                }
            } catch (e) {
                console.error(`❌ Error processing ${fullPath}: ${e.message}`);
            }
        }
    }
}

console.log("🔍 [METADATA] Starting normalization...");
if (fs.existsSync(SRC_ROOT)) {
    processDir(SRC_ROOT);
    console.log("✨ [DONE] Metadata normalization complete.");
} else {
    console.error(`❌ Error: Source root not found at ${SRC_ROOT}`);
}
