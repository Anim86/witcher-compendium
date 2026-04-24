const fs = require('fs');
const path = require('path');

const packDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';
const baseImgPath = 'modules/witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';

const manualMapping = {
    "Amico dell'Avvelenatore": "amico_dellavvelenatore.webp",
    "Formula: Amico dell'Avvelenatore": "formula_amico_dellavvelenatore.webp",
    "Formula: Tomba d'Adda": "formula_tomba_dadda.webp",
    "Formula: Veleno dell'Impiccato": "formula_veleno_dellimpiccato.webp",
    "Tomba d'Adda": "tomba_dadda.webp",
    "Formula: Decotto di Viverna": "formula_decotto_di_viverna.webp",
    "Sacca d'Aria": "sacca_daria.webp",
    "Speranza di Malaspezia": "speranza_di_malaspezia.webp"
};

const jsonFiles = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));

let updatedCount = 0;

jsonFiles.forEach(jf => {
    const filePath = path.join(packDir, jf);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let iconName = "";
    if (manualMapping[content.name]) {
        iconName = manualMapping[content.name];
    } else {
        iconName = content.name.toLowerCase()
            .replace(/[:']/g, '') // Remove colons and apostrophes
            .replace(/[^a-z0-9]/g, '_') // Replace spaces and other chars with underscores
            .replace(/_+/g, '_') // Remove double underscores
            .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        iconName += ".webp";
    }

    const newPath = baseImgPath + iconName;
    
    if (content.img !== newPath) {
        content.img = newPath;
        fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} out of ${jsonFiles.length} JSON files.`);
