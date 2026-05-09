const fs = require('fs');
const path = require('path');

const REPO_ROOT = "c:/Users/apaci/Desktop/Progetti/witcher-compendium";
const SRC_PACKS = path.join(REPO_ROOT, "_tools/src-packs");
const ASSETS_ROOT = path.join(REPO_ROOT, "witcher-compendium");

const TARGET_FOLDERS = [
    "MAGIA_E_MALEDIZIONI/Necromanzia",
    "MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture",
    "MAGIA_E_MALEDIZIONI/Segni",
    "REGOLAMENTO_E_NARRATIVA/Geografia",
    "REGOLAMENTO_E_NARRATIVA/Investigazioni"
];

function getFiles(dir, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files);
        } else if (file.endsWith('.json')) {
            files.push(name);
        }
    }
    return files;
}

const missing = [];

for (const target of TARGET_FOLDERS) {
    const targetDir = path.join(SRC_PACKS, target);
    if (!fs.existsSync(targetDir)) continue;
    
    const jsonFiles = getFiles(targetDir);
    for (const jsonFile of jsonFiles) {
        try {
            const content = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
            const img = content.img;
            if (img && img.startsWith('modules/witcher-compendium/')) {
                const relativePath = img.replace('modules/witcher-compendium/', '');
                const absolutePath = path.join(ASSETS_ROOT, relativePath);
                if (!fs.existsSync(absolutePath)) {
                    missing.push({
                        file: path.relative(SRC_PACKS, jsonFile),
                        img: img
                    });
                }
            }
        } catch (e) {
            console.error(`Error parsing ${jsonFile}: ${e.message}`);
        }
    }
}

console.log(`Found ${missing.length} missing assets in target folders:`);
missing.forEach(m => console.log(`${m.file} -> ${m.img}`));
