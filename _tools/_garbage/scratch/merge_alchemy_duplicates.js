const fs = require('fs');
const path = require('path');

const alchemyDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';

const merges = [
    {
        canonical: 'amico_dellavvelenatore_8e0f7b69e906a7fa.json',
        source: 'amico_dellavvelenatore_8d84fe6e6c7b4810.json'
    },
    {
        canonical: 'tomba_dadda_43f49e3aeb411b79.json',
        source: 'tomba_dadda_0620dfcfc28b4d46.json'
    }
];

merges.forEach(m => {
    const canonicalPath = path.join(alchemyDir, m.canonical);
    const sourcePath = path.join(alchemyDir, m.source);
    
    const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
    const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    
    const lore = source.system.description.value;
    const mechanics = canonical.system.description.value;
    
    // Merge: Lore first, then mechanics
    canonical.system.description.value = lore + mechanics;
    
    fs.writeFileSync(canonicalPath, JSON.stringify(canonical, null, 2), 'utf8');
    fs.unlinkSync(sourcePath);
    console.log(`Merged ${m.source} into ${m.canonical}`);
});
