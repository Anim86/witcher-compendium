const fs = require('fs');
const path = require('path');

const packsDir = path.join(__dirname, 'packs');
let totalEntries = 0;
let errors = [];
let ids = new Set();

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.json')) {
            totalEntries++;
            try {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                if (!data._id || data._id.length !== 16) {
                    errors.push(`Invalid ID in ${file}: ${data._id}`);
                }
                if (ids.has(data._id)) {
                    errors.push(`Duplicate ID: ${data._id} in ${file}`);
                }
                ids.add(data._id);
            } catch (e) {
                errors.push(`JSON Parse error in ${file}: ${e.message}`);
            }
        }
    }
}

console.log("Analyzing packs...");
walk(packsDir);
console.log(`✅ Total entries: ${totalEntries}`);
if (errors.length > 0) {
    console.log("❌ Anomalies found:");
    errors.forEach(e => console.log(`  - ${e}`));
} else {
    console.log("✅ No duplicate IDs or parse errors found.");
}
