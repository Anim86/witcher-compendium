const fs = require('fs');
const path = require('path');

// Mappings for the main categories (folders in MAGIA_E_MALEDIZIONI)
const mainCategoryMap = {
    "Doni_del_Caos": "Doni del Caos",
    "Incantesimi_e_Rituali": "Incantesimi e rituali",
    "Maledizioni_e_Fatture": "Maledizioni e Fatture",
    "Necromanzia": "Necromanzia",
    "Segni": "Segni"
};

// Mappings for subcategories (witcher-xxx folders / packs)
const subCategoryMap = {
    "witcher-gifts": "Doni Magici",
    "witcher-goetia": "Goezia",
    "witcher-invocations": "Invocazioni Chaos",
    "witcher-rituals": "Rituali",
    "witcher-runes": "Rune, Glifi e Reliquie",
    "witcher-spells": "Incantesimi",
    "witcher-curses": "Maledizioni GM",
    "witcher-hexes": "Fatture",
    "witcher-necromanzia": "Necromanzia (TC)",
    "witcher-signs": "Segni Witcher"
};

const assetsFile = "e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\magic_assets.json";
const assets = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

// Format and enhance each asset
const processed = assets.map(asset => {
    const parts = asset.relPath.split(/[\\/]/);
    const mainDir = parts[0];
    const subDir = parts[1];
    
    const mainCategory = mainCategoryMap[mainDir] || mainDir;
    const subCategory = subCategoryMap[subDir] || subDir;
    
    return {
        name: asset.name,
        type: asset.type,
        subCategory: subCategory,
        mainCategory: mainCategory,
        file: asset.file,
        relPath: asset.relPath
    };
});

// Sort by: Main Category -> Subcategory -> Name
processed.sort((a, b) => {
    const mainComp = a.mainCategory.localeCompare(b.mainCategory, 'it');
    if (mainComp !== 0) return mainComp;
    
    const subComp = a.subCategory.localeCompare(b.subCategory, 'it');
    if (subComp !== 0) return subComp;
    
    return a.name.localeCompare(b.name, 'it');
});

// Build markdown
let markdown = `# 🔮 Report Magia e Maledizioni\n\n`;
markdown += `Questo report elenca tutti gli asset presenti all'interno della cartella **MAGIA e MALEDIZIONI** (\`packs/MAGIA_E_MALEDIZIONI\` o \`_tools/src-packs/MAGIA_E_MALEDIZIONI\`), suddivisi dettagliatamente per categoria e sottocategoria all'interno del compendio.\n\n`;

// Generate stats summary table
const stats = {};
processed.forEach(item => {
    const key = `${item.mainCategory} > ${item.subCategory}`;
    stats[key] = (stats[key] || 0) + 1;
});

markdown += `## 📊 Statistiche e Riepilogo\n\n`;
markdown += `In totale sono stati trovati **${processed.length}** asset magici organizzati come segue:\n\n`;
markdown += `| Categoria Principale | Sottocategoria Compendio | Numero Asset |\n`;
markdown += `| :--- | :--- | :---: |\n`;
for (const [key, count] of Object.entries(stats)) {
    const [main, sub] = key.split(" > ");
    markdown += `| ${main} | ${sub} | **${count}** |\n`;
}
markdown += `| **TOTALE** | | **${processed.length}** |\n\n`;

// Generate the main table
markdown += `## 📋 Tabella Dettagliata degli Asset\n\n`;
markdown += `Di seguito viene riportato l'elenco completo di tutti gli asset ordinati per categoria e sottocategoria.\n\n`;
markdown += `| Nome Asset | Sottocategoria (Compendio) | Categoria Principale | File di Origine |\n`;
markdown += `| :--- | :--- | :--- | :--- |\n`;

processed.forEach(item => {
    markdown += `| **${item.name}** | ${item.subCategory} | ${item.mainCategory} | \`${item.file}\` |\n`;
});

const reportPath = "e:\\AntigravitiProgetti\\CompendioTheWitcher\\TO DO\\report_magia_e_maledizioni.md";
fs.writeFileSync(reportPath, markdown, 'utf8');

console.log(`Report generated successfully with ${processed.length} entries at: ${reportPath}`);
