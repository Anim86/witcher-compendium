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
    { src: 'schema_schema_spada_d_acciaio_del_manticora_webp_1778582164065.png', dest: 'schema_schema_spada_d_acciaio_del_manticora.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_acciaio_del_orso_webp_1778582184424.png', dest: 'schema_schema_spada_d_acciaio_del_orso.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_acciaio_del_vipera_webp_1778582200544.png', dest: 'schema_schema_spada_d_acciaio_del_vipera.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_argento_del_gatto_webp_1778582217923.png', dest: 'schema_schema_spada_d_argento_del_gatto.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_argento_del_grifone_webp_1778582232728.png', dest: 'schema_schema_spada_d_argento_del_grifone.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_argento_del_lupo_webp_1778582252334.png', dest: 'schema_schema_spada_d_argento_del_lupo.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_argento_del_manticora_webp_1778582267039.png', dest: 'schema_schema_spada_d_argento_del_manticora.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_argento_del_orso_webp_1778582294579.png', dest: 'schema_schema_spada_d_argento_del_orso.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_spada_d_argento_del_vipera_webp_1778582310157.png', dest: 'schema_schema_spada_d_argento_del_vipera.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_schema_zanna_del_vipera_webp_1778582325753.png', dest: 'schema_schema_zanna_del_vipera.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' }
];

async function deploy() {
    console.log("🚀 Starting Batch 1 Deployment...");
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
