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
    "witcher-investigations": "REGOLAMENTO_E_NARRATIVA/Investigazioni/witcher-investigations"
};

for (const [srcSub, destSub] of Object.entries(SUB_MAPPING)) {
    const srcDir = path.join(SOURCE_ROOT, srcSub);
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
    for (const file of files) {
        const webpName = path.parse(file).name + ".webp";
        const targetPath = path.join(ASSETS_ROOT, destSub, webpName);

        if (fs.existsSync(targetPath)) {
            console.log(`Deleting integrated asset: ${path.join(srcSub, file)}`);
            fs.unlinkSync(path.join(srcDir, file));
        }
    }
    
    // Remove empty dir
    if (fs.readdirSync(srcDir).length === 0) {
        fs.rmdirSync(srcDir);
    }
}
