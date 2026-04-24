const fs = require('fs');
const path = require('path');

function checkPacks(packDirs) {
    packDirs.forEach(packDir => {
        if (!fs.existsSync(packDir)) {
            console.log(`Directory not found: ${packDir}`);
            return;
        }
        const files = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));
        const names = new Set();
        const itemsByName = {};

        files.forEach(file => {
            const filePath = path.join(packDir, file);
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const name = content.name.replace(/[’‘]/g, "'").trim();
                names.add(name);
                if (!itemsByName[name]) itemsByName[name] = [];
                itemsByName[name].push(file);
            } catch (e) {}
        });

        console.log(`\nPack: ${path.basename(packDir)}`);
        console.log(`Total Files: ${files.length}`);
        console.log(`Unique Names: ${names.size}`);
        console.log(`Duplicates: ${files.length - names.size}`);
        
        if (files.length - names.size > 0) {
            console.log("Duplicate items:");
            Object.keys(itemsByName).forEach(name => {
                if (itemsByName[name].length > 1) {
                    console.log(`  - ${name}: ${itemsByName[name].join(', ')}`);
                }
            });
        }
    });
}

const baseDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/';
const packs = [
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-armor'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment'),
    path.join(baseDir, 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy'),
    path.join(baseDir, 'BESTIARIO/witcher-monsters'),
    path.join(baseDir, 'BESTIARIO/witcher-characters'),
    path.join(baseDir, 'BESTIARIO/witcher-animals'),
    path.join(baseDir, 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells'),
    path.join(baseDir, 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-rituals'),
    path.join(baseDir, 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-runes'),
    path.join(baseDir, 'MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture/witcher-hexes'),
    path.join(baseDir, 'MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture/witcher-curses'),
    path.join(baseDir, 'ALCHIMIA_E_ARTIGIANATO/Componenti/witcher-dlc-ms-components'),
    path.join(baseDir, 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-dlc-ap-alchemy'),
    path.join(baseDir, 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-dlc-ts-alchemy'),
    path.join(baseDir, 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-sl-schematics'),
    path.join(baseDir, 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-sw-schematics'),
    path.join(baseDir, 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-ts-schematics'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-dlc-ap-equipment'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-dlc-ms-equipment'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-dlc-sl-equipment'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-dlc-sr-equipment'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-dlc-sw-equipment'),
    path.join(baseDir, 'EQUIPAGGIAMENTO_E_TRASPORTI/Protesi/witcher-dlc-dp-equipment')
];

checkPacks(packs);
