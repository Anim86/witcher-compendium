const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configurazione percorsi
const REPO_ROOT = path.dirname(path.dirname(__dirname));
const SOURCE_ROOT = path.join(REPO_ROOT, "temp_images");
const ASSETS_ROOT = path.join(REPO_ROOT, "witcher-compendium", "assets");

// Mapping delle sottocartelle (relative ad ASSETS_ROOT)
const SUB_MAPPING = {
    "witcher-invocations": "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-invocations",
    "witcher-rituali": "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-rituals",
    "witcher-rituals": "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-rituals",
    "witcher-rituals-chaos": "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-rituals-chaos",
    "witcher-runes": "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-runes",
    "witcher-spells": "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells",
    "witcher-spells-chaos": "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells-chaos",
    "witcher-hexes": "MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture/witcher-hexes",
    "witcher-hexes-base": "MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture/witcher-hexes-base",
    "witcher-necromanzia": "MAGIA_E_MALEDIZIONI/Necromanzia/witcher-necromanzia",
    "witcher-signs-chaos": "MAGIA_E_MALEDIZIONI/Segni/witcher-signs-chaos",
    "witcher-geografia": "REGOLAMENTO_E_NARRATIVA/Geografia/witcher-geografia",
    "witcher-investigations": "REGOLAMENTO_E_NARRATIVA/Investigazioni/witcher-investigations",
    "witcher-dlc-sr-lore": "REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-dlc-sr-lore",
    "witcher-lore": "REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore"
};

// Gestione speciale per file con nomi Gemini generici
const SPECIAL_FILES = {
    "Gemini_Generated_Image_lzgf8ulzgf8ulzgf.png": "illusione_interattiva.webp"
};

console.log("Avvio processing asset manuali (Node.js version with Sharp/CommonJS)...");

async function processImages() {
    for (const [srcSub, destSub] of Object.entries(SUB_MAPPING)) {
        const srcDir = path.join(SOURCE_ROOT, srcSub);
        if (!fs.existsSync(srcDir)) continue;

        console.log(`\nCartella: ${srcSub}`);

        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
        for (const file of files) {
            const pngPath = path.join(srcDir, file);
            let newName = SPECIAL_FILES[file] || (path.parse(file).name + ".webp");
            
            const targetDir = path.join(ASSETS_ROOT, destSub);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path.join(targetDir, newName);

            console.log(`  - ${file} -> ${newName}`);

            try {
                await sharp(pngPath)
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp({ quality: 80 })
                    .toFile(targetPath);
            } catch (err) {
                console.error(`  [ERRORE] Durante il processing di ${file}: ${err.message}`);
            }
        }
    }
    console.log("\nProcessing completato.");
}

processImages();
