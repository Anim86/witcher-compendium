const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const REPO_ROOT = path.resolve(__dirname, '../../');
const SOURCE_ROOT = path.join(REPO_ROOT, "temp_images");
const ASSETS_ROOT = path.join(REPO_ROOT, "witcher-compendium", "assets");

// Mappatura estesa delle sottocartelle recuperate
const SUB_MAPPING = {
    "witcher-alchemy": "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy",
    "witcher-characters": "BESTIARIO/witcher-characters",
    "witcher-components": "ALCHIMIA_E_ARTIGIANATO/Componenti_e_Materiali/witcher-components",
    "witcher-components-diario": "ALCHIMIA_E_ARTIGIANATO/Componenti_e_Materiali/witcher-components-diario",
    "witcher-components-mutageni-dw": "ALCHIMIA_E_ARTIGIANATO/Componenti_e_Materiali/witcher-components-mutageni-dw",
    "witcher-components-racconti": "ALCHIMIA_E_ARTIGIANATO/Componenti_e_Materiali/witcher-components-racconti",
    "witcher-dlc-ap-alchemy": "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-dlc-ap-alchemy",
    "witcher-dlc-ms-components": "ALCHIMIA_E_ARTIGIANATO/Componenti_e_Materiali/witcher-dlc-ms-components",
    "witcher-dlc-sl-schematics": "ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-sl-schematics",
    "witcher-dlc-sr-lore": "REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-dlc-sr-lore",
    "witcher-dlc-sw-schematics": "ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-sw-schematics",
    "witcher-dlc-ts-alchemy": "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-dlc-ts-alchemy",
    "witcher-dlc-ts-schematics": "ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-ts-schematics",
    "witcher-equipment": "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment",
    "witcher-geografia": "REGOLAMENTO_E_NARRATIVA/Geografia/witcher-geografia",
    "witcher-goetia": "MAGIA_E_MALEDIZIONI/Doni_del_Caos/witcher-goetia",
    "witcher-hexes-base": "MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture/witcher-hexes-base",
    "witcher-investigations": "REGOLAMENTO_E_NARRATIVA/Investigazioni/witcher-investigations",
    "witcher-magic-items": "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-magic-items",
    "witcher-mutations": "REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-mutations",
    "witcher-mutazioni-tc": "REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-mutazioni-tc",
    "witcher-necromanzia": "MAGIA_E_MALEDIZIONI/Necromanzia/witcher-necromanzia",
    "witcher-schematics": "ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics",
    "witcher-schematics-racconti": "ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics-racconti",
    "witcher-signs-chaos": "MAGIA_E_MALEDIZIONI/Segni/witcher-signs-chaos",
    "witcher-special": "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special",
    "witcher-special-chaos": "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos",
    "witcher-transports": "EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports",
    "witcher-trophies": "REGOLAMENTO_E_NARRATIVA/Trofei/witcher-trophies",
    "witcher-weapons": "EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons",
    "witcher-weapons-racconti": "EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons-racconti",
    "_review_orphans": "EQUIPAGGIAMENTO_E_TRASPORTI/_review_orphans"
};

async function processRecovered() {
    console.log("🚀 Avvio Ripristino Massivo Asset Recuperati...");
    let processed = 0;
    let errors = 0;

    for (const [srcSub, destSub] of Object.entries(SUB_MAPPING)) {
        const srcDir = path.join(SOURCE_ROOT, srcSub);
        if (!fs.existsSync(srcDir)) continue;

        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
        if (files.length === 0) continue;

        console.log(`\n📂 Cartella: ${srcSub} (${files.length} file)`);

        const targetDir = path.join(ASSETS_ROOT, destSub);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        for (const file of files) {
            const pngPath = path.join(srcDir, file);
            const webpName = path.parse(file).name + ".webp";
            const targetPath = path.join(targetDir, webpName);

            // Verifica se il file esistente è un placeholder (<10KB)
            if (fs.existsSync(targetPath)) {
                const stats = fs.statSync(targetPath);
                if (stats.size > 20000) {
                    // console.log(`  ⏩ Salto (già esistente e valido): ${webpName}`);
                    // Continuiamo comunque se l'utente vuole forzare il ripristino delle PNG storiche
                }
            }

            try {
                await sharp(pngPath)
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp({ quality: 80 })
                    .toFile(targetPath);
                
                process.stdout.write(".");
                processed++;
            } catch (err) {
                console.error(`\n  [ERRORE] ${file}: ${err.message}`);
                errors++;
            }
        }
    }

    console.log(`\n\n✅ Ripristino completato!`);
    console.log(`📊 Processati: ${processed}`);
    console.log(`❌ Errori: ${errors}`);
}

processRecovered();
