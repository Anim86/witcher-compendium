import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const BRAIN_DIR = 'C:/Users/Manuel/.gemini/antigravity/brain/dd81a8ef-d6cb-4c7e-9b95-21bbe2a1eb41';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');

const BATCH_74_MAPPING = [
    { src: 'arieggiare_1778482755489.png', dest: 'arieggiare.webp', rel: 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells' },
    { src: 'aine_verseos_1778482770601.png', dest: 'aine_verseos.webp', rel: 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells' },
    { src: 'formula_olio_anti_ancestrali_wo_1778482789574.png', dest: 'Formula_Olio_Anti-Ancestrali_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_bestie_wo_1778482810464.png', dest: 'Formula_Olio_Anti-Bestie_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_dragonidi_wo_1778482823682.png', dest: 'Formula_Olio_Anti-Dragonidi_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_elementali_wo_1778482839742.png', dest: 'Formula_Olio_Anti-Elementali_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_ibridi_wo_1778482861570.png', dest: 'Formula_Olio_Anti-Ibridi_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_insettoidi_wo_1778482874238.png', dest: 'Formula_Olio_Anti-Insettoidi_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_maledetti_wo_1778482885866.png', dest: 'Formula_Olio_Anti-Maledetti_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_necrofagi_wo_1778482906788.png', dest: 'Formula_Olio_Anti-Necrofagi_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_orchi_wo_1778482920652.png', dest: 'Formula_Olio_Anti-Orchi_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_spettri_wo_1778482934475.png', dest: 'Formula_Olio_Anti-Spettri_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_olio_anti_vampiri_wo_1778482954467.png', dest: 'Formula_Olio_Anti-Vampiri_wo_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_veleno_dell_impiccato_wo_1778482968793.png', dest: "Formula_Veleno_dell'Impiccato_wo_.webp", rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_decotto_di_arachas_dec_1778482986819.png', dest: 'Formula_Decotto_di_Arachas_dec_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_decotto_di_demonio_dec_1778483006369.png', dest: 'Formula_Decotto_di_Demonio_dec_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' },
    { src: 'formula_decotto_di_grifone_dec_1778483020822.png', dest: 'Formula_Decotto_di_Grifone_dec_.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy' }
];

async function deploy() {
    console.log("🚀 Starting Batch 74 Deployment using sharp-cli...");
    let success = 0;
    let failed = 0;

    for (const item of BATCH_74_MAPPING) {
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
            // Utilizzo npx sharp-cli per ridimensionare e convertire
            // -i input -o output_dir format webp --quality 80 resize 512 512 --fit contain
            // Nota: sharp-cli richiede che l'output sia una cartella o un file specifico a seconda della versione.
            // La versione help suggerisce: cli.js -i ./input.jpg -o ./out resize 300 200
            // Per forzare il nome file, potremmo dover rinominare dopo.
            
            const tempOutDir = path.join(REPO_ROOT, 'temp_deploy');
            if (!fs.existsSync(tempOutDir)) fs.mkdirSync(tempOutDir);
            
            const cmd = `npx -y sharp-cli -i "${srcPath}" -o "${tempOutDir}" --format webp --quality 80 resize 512 512`;
            execSync(cmd, { stdio: 'inherit' });
            
            // Il file sarà salvato come [src_name_without_ext].webp nella tempOutDir
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
