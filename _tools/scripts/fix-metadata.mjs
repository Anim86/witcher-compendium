import fs from 'fs';
import path from 'path';

const SRC_ROOT = '_tools/src-packs';

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
                if (bytes.length <= 3) {
                    continue;
                }
                
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
                }
            } catch (e) {
                console.error(`Error processing ${fullPath}: ${e.message}`);
            }
        }
    }
}

processDir(SRC_ROOT);
