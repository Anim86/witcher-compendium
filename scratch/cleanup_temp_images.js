const fs = require('fs');
const path = require('path');

const REPO_ROOT = "c:/Users/apaci/Desktop/Progetti/witcher-compendium";
const SOURCE_ROOT = path.join(REPO_ROOT, "temp_images");
const ASSETS_ROOT = path.join(REPO_ROOT, "witcher-compendium", "assets");

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
    "witcher-lore": "REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore",
    "witcher-lore-chaos": "REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore-chaos",
    "witcher-dlc-np-professions": "REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-dlc-np-professions",
    "witcher-dlc-sl-schematics": "ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-sl-schematics",
    "witcher-goetia": "MAGIA_E_MALEDIZIONI/Doni_del_Caos/witcher-goetia",
    "witcher-lore-racconti": "REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore-racconti",
    "witcher-trophies": "REGOLAMENTO_E_NARRATIVA/Trofei/witcher-trophies",
    "CriticieCombattimento": "TABELLEOPERATIVE/CriticieCombattimento",
    "DisastriMagici": "TABELLEOPERATIVE/DisastriMagici"
};

const SPECIAL_FILES = {
    "Gemini_Generated_Image_lzgf8ulzgf8ulzgf.png": "illusione_interattiva.webp",
    "Gemini_Generated_Image_qrgc49qrgc49qrgc.png": "witcher-rolltable-critici-complicati.webp",
    "critici_difficili.png": "witcher-rolltable-critici-difficili.webp",
    "critici_mortali.png": "witcher-rolltable-critici-mortali.webp",
    "critici_semplici.png": "witcher-rolltable-critici-semplici.webp",
    "fumble_disarmato.png": "witcher-rolltable-fumble-disarmato.webp",
    "fumble_distanza.png": "witcher-rolltable-fumble-distanza.webp",
    "fumble_mischia_attacco.png": "witcher-rolltable-fumble-mischia-attacco.webp",
    "fumble_mischia_difesa.png": "witcher-rolltable-fumble-mischia-difesa.webp",
    "effetti_dei_disastri_elementali.png": "witcher-rolltable-disastri-elementi.webp",
    "esiti_dei_disastri_magici_mago.png": "witcher-rolltable-disastri-mago.webp",
    "pericoli_della_necromanzia.png": "witcher-rolltable-pericoli-necromanzia.webp"
};

for (const [srcSub, destSub] of Object.entries(SUB_MAPPING)) {
    const srcDir = path.join(SOURCE_ROOT, srcSub);
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
    for (const file of files) {
        let webpName = SPECIAL_FILES[file] || (path.parse(file).name + ".webp");
        const targetPath = path.join(ASSETS_ROOT, destSub, webpName);

        if (fs.existsSync(targetPath)) {
            console.log(`Deleting integrated asset: ${path.join(srcSub, file)}`);
            fs.unlinkSync(path.join(srcDir, file));
        }
    }
    
    // Remove empty dir
    try {
        if (fs.readdirSync(srcDir).length === 0) {
            fs.rmdirSync(srcDir);
        }
    } catch (e) {}
}
