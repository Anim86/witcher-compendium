import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');

const targetText = `<p><i>Tutto l'equipaggiamento presentato in questo capitolo è più che raro. Questi oggetti e formule dovrebbero essere le ricompense per missioni importanti o quando un personaggio li cerca appositamente.</i> — MB 246</p>\n<p><b>Rarità:</b> Molto Raro. Non vendibile (MB 246-250).</p>`;

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath, callback);
        } else if (file.endsWith('.json')) {
            callback(fullPath);
        }
    }
}

let updatedCount = 0;
let checkedCount = 0;

console.log(`Starting cleanup in: ${SRC_ROOT}`);

walkDir(SRC_ROOT, (filePath) => {
    checkedCount++;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (data.system && typeof data.system.description === 'string') {
            let desc = data.system.description;
            let updated = false;

            if (desc.includes('\n' + targetText)) {
                desc = desc.replace('\n' + targetText, '');
                updated = true;
            } else if (desc.includes(targetText)) {
                desc = desc.replace(targetText, '');
                updated = true;
            }

            if (updated) {
                data.system.description = desc;
                // Write back JSON format with 4 spaces indent, adding newline at end of file if it had one
                const formatted = JSON.stringify(data, null, 4) + '\n';
                fs.writeFileSync(filePath, formatted, 'utf8');
                console.log(`✅ Updated: ${path.relative(SRC_ROOT, filePath)}`);
                updatedCount++;
            }
        }
    } catch (e) {
        console.error(`❌ Error processing ${filePath}: ${e.message}`);
    }
});

console.log(`\nCleanup finished.`);
console.log(`Checked files: ${checkedCount}`);
console.log(`Updated files: ${updatedCount}`);
