const fs = require('fs');
const path = require('path');

const assetsFile = "e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\alchemy_assets.json";
const assets = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

const mainCategoryMap = {
    "witcher-alchemy": "Alchimia",
    "witcher-components": "Componenti",
    "witcher-mutations": "Mutageni",
    "witcher-mutazioni-tc": "Mutazioni (TC)",
    "witcher-schematics": "Schemi"
};

const processed = assets.map(asset => {
    const parts = asset.relPath.split(/[\\/]/);
    const folder = parts[0];
    const category = mainCategoryMap[folder] || folder;
    
    let useType = "";
    
    if (folder === "witcher-alchemy") {
        if (asset.name.startsWith("Formula:")) {
            useType = "Formula Alchemica (diagrams)";
        } else if (asset.type === "component") {
            useType = "Ingrediente Alchemico (component)";
        } else if (asset.type === "valuable") {
            useType = "Pozione / Olio / Elisir (valuable)";
        } else {
            useType = `Sostanza Alchemica (${asset.type})`;
        }
    } else if (folder === "witcher-components") {
        const nameLower = asset.name.toLowerCase();
        const isMonsterPart = nameLower.startsWith("carapace") || 
                              nameLower.startsWith("ceneri di fenice") || 
                              nameLower.startsWith("cerume") ||
                              nameLower.startsWith("cervello") ||
                              nameLower.startsWith("corna") ||
                              nameLower.startsWith("corno") ||
                              nameLower.startsWith("cuore") ||
                              nameLower.startsWith("denti") ||
                              nameLower.startsWith("essenza") ||
                              nameLower.startsWith("grasso") ||
                              nameLower.startsWith("linfa") ||
                              nameLower.startsWith("orecchio") ||
                              nameLower.startsWith("ossa") ||
                              nameLower.startsWith("pelle d") ||
                              nameLower.startsWith("pelle di") ||
                              nameLower.startsWith("pelliccia") ||
                              nameLower.startsWith("pietra elementale") ||
                              nameLower.startsWith("piume") ||
                              nameLower.startsWith("polvere di") ||
                              nameLower.startsWith("saliva") ||
                              nameLower.startsWith("sangue") ||
                              nameLower.startsWith("scaglie") ||
                              nameLower.startsWith("stomaco") ||
                              nameLower.startsWith("succo") ||
                              nameLower.startsWith("teschio") ||
                              nameLower.startsWith("viticci") ||
                              nameLower.startsWith("zanne");
                              
        if (isMonsterPart) {
            useType = `Componente di Origine Animale / Mostro (${asset.type})`;
        } else {
            useType = `Materiale di Artigianato (${asset.type})`;
        }
    } else if (folder === "witcher-mutations") {
        const color = asset.systemType ? ` ${asset.systemType}` : "";
        useType = `Mutageno${color} (mutagen)`;
    } else if (folder === "witcher-mutazioni-tc") {
        if (asset.name.startsWith("Regola")) {
            useType = "Regola di Mutazione GM (valuable)";
        } else {
            useType = "Tratto di Mutazione Witcher (valuable)";
        }
    } else if (folder === "witcher-schematics") {
        useType = `Schema di Artigianato (${asset.type})`;
    } else {
        useType = `${asset.type}`;
    }
    
    return {
        name: asset.name,
        category: category,
        useType: useType,
        file: asset.file,
        relPath: asset.relPath
    };
});

// Group by category
const groups = {
    "Alchimia": [],
    "Componenti": [],
    "Mutageni": [],
    "Mutazioni (TC)": [],
    "Schemi": []
};

processed.forEach(item => {
    if (groups[item.category]) {
        groups[item.category].push(item);
    } else {
        groups[item.category] = [item];
    }
});

// Sort each group alphabetically
for (const cat in groups) {
    groups[cat].sort((a, b) => a.name.localeCompare(b.name, 'it'));
}

// Build Markdown
let md = `# ⚗️ Report Alchimia e Artigianato\n\n`;
md += `Questo report elenca dettagliatamente tutti i **${processed.length}** asset presenti nelle cartelle di **Alchimia e Artigianato** (\`packs/ALCHIMIA_E_ARTIGIANATO\` o \`_tools/src-packs/ALCHIMIA_E_ARTIGIANATO\`), indicando per ciascuno il nome, la categoria nel compendio, il tipo di utilizzo nel repository (con indicazione del tipo meccanico di Foundry VTT) e il file JSON di origine.\n\n`;

md += `## 📊 Statistiche e Riepilogo delle Categorie\n\n`;
md += `| Categoria | Numero Asset | Descrizione della Categoria |\n`;
md += `| :--- | :---: | :--- |\n`;
md += `| **Alchimia** | **${groups["Alchimia"].length}** | Piante, formule alchemiche, oli, elisir e sostanze tossiche. |\n`;
md += `| **Componenti** | **${groups["Componenti"].length}** | Metalli, pelli, tessuti e parti di mostro utilizzabili per creare oggetti. |\n`;
md += `| **Mutageni** | **${groups["Mutageni"].length}** | Sostanze organiche estratte da mostri (Rosso, Verde, Blu) per le mutazioni Witcher. |\n`;
md += `| **Mutazioni (TC)** | **${groups["Mutazioni (TC)"].length}** | Regole per esperimenti di mutazione avanzati e tratti mutati da applicare. |\n`;
md += `| **Schemi** | **${groups["Schemi"].length}** | Schemi per forgiare armi, corazze, scudi e munizioni (inclusi schemi delle scuole Witcher). |\n`;
md += `| **TOTALE** | **${processed.length}** | |\n\n`;

md += `---\n\n`;

// Generate sections and tables
for (const cat in groups) {
    md += `## 📂 Categoria: ${cat} (${groups[cat].length} Asset)\n\n`;
    
    md += `| Nome Asset | Categoria Compendio | Tipo di Utilizzo (Repository) | File di Origine |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    
    groups[cat].forEach(item => {
        md += `| **${item.name}** | ${item.category} | ${item.useType} | \`${item.file}\` |\n`;
    });
    
    md += `\n---\n\n`;
}

const reportPath = "e:\\AntigravitiProgetti\\CompendioTheWitcher\\TO DO\\report_alchimia_e_artigianato.md";
fs.writeFileSync(reportPath, md, 'utf8');

console.log(`Alchemy and crafting report generated successfully at: ${reportPath}`);
