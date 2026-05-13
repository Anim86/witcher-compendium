import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const BRAIN_DIR = 'C:/Users/Manuel/.gemini/antigravity/brain/4a408e5d-e67b-4a6b-9a77-62f4a96b8105';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');

const BATCH_MAPPING = [
    { src: 'schema_schema_armi_di_toussaint_webp_1778582472495.png', dest: 'schema_schema_armi_di_toussaint.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_asce_da_lancio_x3_webp_1778582490188.png', dest: 'schema_asce_da_lancio_x3.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_coltelli_da_lancio_x3_webp_1778582508117.png', dest: 'schema_coltelli_da_lancio_x3.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_munizioni_a_punta_larga_x10_webp_1778582524297.png', dest: 'schema_munizioni_a_punta_larga_x10.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_munizioni_bodkin_x10_webp_1778582542607.png', dest: 'schema_munizioni_bodkin_x10.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_orione_x3_webp_1778582560942.png', dest: 'schema_orione_x3.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_rinforzo_elfico_webp_1778582579081.png', dest: 'schema_rinforzo_elfico.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' }
];

async function deploy() {
    console.log("🚀 Starting Batch 2 Deployment...");
    let success = 0;
    let failed = 0;

    const tempOutDir = path.join(REPO_ROOT, 'temp_deploy');
    if (!fs.existsSync(tempOutDir)) fs.mkdirSync(tempOutDir);

    for (const item of BATCH_MAPPING) {
        const srcPath = path.join(BRAIN_DIR, item.src);
        const destDir = path.join(ASSETS_ROOT, item.rel);
        const destPath = path.join(destDir, item.dest);

        if (!fs.existsSync(srcPath)) {
            console.error(`❌ Source not found: ${item.src}`);
            failed++;
            continue;
        }

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        console.log(`Processing: ${item.src} -> ${item.dest}`);
        try {
            const cmd = `npx -y sharp-cli -i "${srcPath}" -o "${tempOutDir}" --format webp --quality 80 resize 512 512`;
            execSync(cmd, { stdio: 'inherit' });
            
            const generatedName = path.parse(item.src).name + ".webp";
            const generatedPath = path.join(tempOutDir, generatedName);
            
            if (fs.existsSync(generatedPath)) {
                fs.copyFileSync(generatedPath, destPath);
                fs.unlinkSync(generatedPath);
                console.log(`   ✅ Deployed to ${item.rel}/${item.dest}`);
                success++;
            } else {
                console.error(`   ❌ Failed to find generated file: ${generatedName}`);
                failed++;
            }
        } catch (err) {
            console.error(`   ❌ Error processing ${item.src}: ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDeployment Summary: ${success} successful, ${failed} failed.`);
}

deploy();
