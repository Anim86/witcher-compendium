import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const RITUALS_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'MAGIA_E_MALEDIZIONI', 'Incantesimi_e_Rituali', 'witcher-rituals');
const REPORT_FILE = path.join(REPO_ROOT, 'TO DO', 'report_rituali.md');

function run() {
    console.log("🧼 Cleaning '(Dato Integrato)' prefix from all rituals...");

    if (!fs.existsSync(RITUALS_DIR)) {
        console.error("❌ Rituals directory not found.");
        return;
    }

    const files = fs.readdirSync(RITUALS_DIR).filter(f => f.endsWith('.json'));
    let jsonCount = 0;

    files.forEach(file => {
        const fullPath = path.join(RITUALS_DIR, file);
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            const data = JSON.parse(content);

            let updated = false;

            if (data.system) {
                if (data.system.description && data.system.description.includes("(Dato Integrato) ")) {
                    data.system.description = data.system.description.replace("(Dato Integrato) ", "");
                    updated = true;
                }
                if (data.system.description && data.system.description.includes("(Dato Integrato)")) {
                    data.system.description = data.system.description.replace("(Dato Integrato)", "");
                    updated = true;
                }
                if (data.system.effect && data.system.effect.includes("(Dato Integrato) ")) {
                    data.system.effect = data.system.effect.replace("(Dato Integrato) ", "");
                    updated = true;
                }
                if (data.system.effect && data.system.effect.includes("(Dato Integrato)")) {
                    data.system.effect = data.system.effect.replace("(Dato Integrato)", "");
                    updated = true;
                }
            }

            if (updated) {
                fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
                console.log(`✅ Cleaned: ${file} (${data.name})`);
                jsonCount++;
            }
        } catch (e) {
            console.error(`❌ Error updating JSON ${file}: ${e.message}`);
        }
    });

    // Also update report_rituali.md
    if (fs.existsSync(REPORT_FILE)) {
        try {
            let report = fs.readFileSync(REPORT_FILE, 'utf8');
            if (report.includes("(Dato Integrato) ")) {
                report = report.replaceAll("(Dato Integrato) ", "");
                fs.writeFileSync(REPORT_FILE, report, 'utf8');
                console.log("✅ Cleaned '(Dato Integrato)' from report_rituali.md");
            }
        } catch (e) {
            console.error(`❌ Error updating report: ${e.message}`);
        }
    }

    console.log(`\n🎉 Cleanup complete! Cleaned ${jsonCount} JSON files and updated the report.`);
}

run();
