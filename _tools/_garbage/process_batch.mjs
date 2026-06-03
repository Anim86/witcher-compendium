import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const brainDir = 'C:/Users/Manuel/.gemini/antigravity/brain/1bee2bd6-1e4d-4155-95d2-1433390c7ed5';
const tempDir = path.join(REPO_ROOT, 'temp_images');
const destDir = path.join(REPO_ROOT, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/witcher-schematics');
const reportPath = path.join(REPO_ROOT, 'TO DO/report_schemi_asset.md');

const targets = [
    { name: "Brocchiero Gnomesco", clean: "schema_brocchiero_gnomesco" },
    { name: "Camaglio", clean: "schema_camaglio" },
    { name: "Cappa Nanica", clean: "schema_cappa_nanica" },
    { name: "Cappuccio a Doppia Trama", clean: "schema_cappuccio_a_doppia_trama" },
    { name: "Cappuccio Corazzato", clean: "schema_cappuccio_corazzato" },
    { name: "Cappuccio da Arciere Verden", clean: "schema_cappuccio_da_arciere_verden" },
    { name: "Cotta di Maglia", clean: "schema_cotta_di_maglia" },
    { name: "Cotta Gnomesca", clean: "schema_cotta_gnomesca" },
    { name: "Elmo a Mezza Maschera", clean: "schema_elmo_a_mezza_maschera" },
    { name: "Elmo di Skellige", clean: "schema_elmo_di_skellige" },
    { name: "Elmo Nilfgaardiano", clean: "schema_elmo_nilfgaardiano" },
    { name: "Farsetto Protettivo Halfling", clean: "schema_farsetto_protettivo_halfling" },
    { name: "Gambali di Maglia di Hindarsfjall", clean: "schema_gambali_di_maglia_di_hindarsfjall" },
    { name: "Gambesone", clean: "schema_gambesone" },
    { name: "Gambesone Aedirniano", clean: "schema_gambesone_aedirniano" },
    { name: "Gambesone a Doppia Trama", clean: "schema_gambesone_a_doppia_trama" },
    { name: "Giubba di Cuoio Lyriano", clean: "schema_giubba_di_cuoio_lyriano" },
    { name: "Grande Elmo", clean: "schema_grande_elmo" },
    { name: "Palvese", clean: "schema_palvese" },
    { name: "Palvese Mahakaman", clean: "schema_palvese_mahakaman" },
    { name: "Palvese Nilfgaardiano", clean: "schema_palvese_nilfgaardiano" },
    { name: "Schinieri di Piastre", clean: "schema_schinieri_di_piastre" },
    { name: "Schinieri Nilfgaardiani", clean: "schema_schinieri_nilfgaardiani" },
    { name: "Schinieri Redaniani", clean: "schema_schinieri_redaniani" },
    { name: "Scudo d'Acciaio a Goccia", clean: "schema_scudo_d_acciaio_a_goccia" },
    { name: "Scudo da Razziatore di Skellige", clean: "schema_scudo_da_razziatore_di_skellige" },
    { name: "Scudo di Cuoio", clean: "schema_scudo_di_cuoio" },
    { name: "Scudo Elfico", clean: "schema_scudo_elfico" },
    { name: "Scudo Kaedweni", clean: "schema_scudo_kaedweni" },
    { name: "Scudo Temeriano", clean: "schema_scudo_temeriano" },
    { name: "Brache di Cuoio Lyriano", clean: "schema_brache_di_cuoio_lyriano" },
    { name: "Bastone", clean: "schema_bastone" },
    { name: "Bastone con Cristallo", clean: "schema_bastone_con_cristallo" },
    { name: "Bastone da Passeggio Elfico", clean: "schema_bastone_da_passeggio_elfico" },
    { name: "Bastone di Ferro", clean: "schema_bastone_di_ferro" },
    { name: "Bastone Gnomesco", clean: "schema_bastone_gnomesco" },
    { name: "Pugnale", clean: "schema_pugnale" },
    { name: "Daga a Rondelle Halfling", clean: "schema_daga_a_rondelle_halfling" },
    { name: "Jambiya", clean: "schema_jambiya" },
    { name: "Bastone Uncinato", clean: "schema_bastone_uncinato" },
    { name: "Asce da Lancio", clean: "schema_asce_da_lancio" }
];

async function main() {
    console.log("🚀 Starting processing batch from _tools/scripts...");

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    if (!fs.existsSync(brainDir)) {
        console.error(`❌ Brain directory not found: ${brainDir}`);
        return;
    }

    const brainFiles = fs.readdirSync(brainDir);

    const processedTargets = [];

    for (const t of targets) {
        const regex = new RegExp(`^${t.clean}_\\d+\\.png$`);
        const match = brainFiles.find(f => regex.test(f));
        if (match) {
            const srcPath = path.join(brainDir, match);
            const tempPngPath = path.join(tempDir, `${t.clean}.png`);
            
            // Copy to temp_images
            fs.copyFileSync(srcPath, tempPngPath);
            console.log(`📌 Copied ${match} -> temp_images/${t.clean}.png`);

            // Optimize and output to destDir as webp
            const destWebpPath = path.join(destDir, `${t.clean}.webp`);
            
            await sharp(tempPngPath)
                .resize(512, 512, { fit: 'inside' })
                .webp({ quality: 82 })
                .toFile(destWebpPath);
                
            console.log(`✨ Optimized and saved: ${t.clean}.webp (512x512px WebP Q82)`);
            processedTargets.push(t);
        } else {
            console.warn(`⚠️ Could not find brain image starting with ${t.clean}`);
        }
    }

    // Now update report_schemi_asset.md
    if (fs.existsSync(reportPath)) {
        let content = fs.readFileSync(reportPath, 'utf8');
        let updatedCount = 0;
        
        for (const t of processedTargets) {
            // We want to replace "| [ ] | **Schema: Spada d'Arme**" with "| [x] | **Schema: Spada d'Arme**"
            const searchStr = `| [ ] | **Schema: ${t.name}**`;
            const replaceStr = `| [x] | **Schema: ${t.name}**`;
            
            if (content.includes(searchStr)) {
                content = content.replace(searchStr, replaceStr);
                updatedCount++;
                console.log(`✅ Checked [x] for ${t.name} in report_schemi_asset.md`);
            }
        }
        
        fs.writeFileSync(reportPath, content, 'utf8');
        console.log(`📝 Updated ${updatedCount} items in the report tracking checklist.`);
    } else {
        console.error("❌ report_schemi_asset.md not found!");
    }
}

main().catch(err => {
    console.error("❌ Error running process:", err);
});
