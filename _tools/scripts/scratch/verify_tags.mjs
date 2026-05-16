import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weaponsDir = path.resolve(__dirname, '../../src-packs/EQUIPAGGIAMENTO/witcher-weapons/');

console.log(`Starting validation in: ${weaponsDir}`);
const files = fs.readdirSync(weaponsDir).filter(f => f.endsWith('.json'));

let totalCount = 0;
let errors = [];

for (const file of files) {
    const filePath = path.join(weaponsDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        totalCount++;

        if (data.type !== 'weapon') {
            continue;
        }

        const name = data.name || file;
        const system = data.system || {};

        const hasCategory = 'category' in system;
        const hasRange = ('range' in system) || ('reach' in system);

        if (!hasCategory || !hasRange) {
            errors.push({
                file,
                name,
                hasCategory,
                hasRange,
                categoryValue: system.category,
                rangeValue: system.range
            });
        }
    } catch (e) {
        errors.push({
            file,
            error: e.message
        });
    }
}

console.log(`\nVerification Summary:`);
console.log(`- Total files checked: ${totalCount}`);
console.log(`- Files with missing or invalid tags: ${errors.length}`);

if (errors.length > 0) {
    console.log(`\n❌ Issues found:`);
    errors.forEach(err => {
        if (err.error) {
            console.log(`  - [File Error] ${err.file}: ${err.error}`);
        } else {
            console.log(`  - ${err.name} (${err.file}):`);
            console.log(`    * Category present? ${err.hasCategory ? 'Yes' : '❌ NO'}`);
            console.log(`    * Range present? ${err.hasRange ? 'Yes' : '❌ NO'}`);
        }
    });
} else {
    console.log(`\n✅ Success! Every single weapon contains both 'category' and 'range' tags under its system data.`);
}
