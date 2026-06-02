const fs = require('fs');
const path = require('path');

const assetsFile = "e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\magic_assets.json";
const assets = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

const categories = {
    "1. INCANTESIMI": {
        desc: "Utilizzati dai Maghi, includono le magie elementari e le varianti necromantiche.",
        subcategories: {
            "Incantesimi Standard": [],
            "Incantesimi di Necromanzia": []
        }
    },
    "2. INVOCAZIONI": {
        desc: "Poteri derivanti dal fervore religioso o dalla natura, utilizzati da Preti e Druidi.",
        subcategories: {
            "Invocazioni Chaos": []
        }
    },
    "3. RITUALI": {
        desc: "Forme di magia che richiedono tempo e componenti. Ho separato i rituali standard da quelli delle Arti Oscure.",
        subcategories: {
            "Rituali Standard": [],
            "Rituali di Goezia (GOE)": [],
            "Rituali di Necromanzia": []
        }
    },
    "4. FATTURE": {
        desc: "Maledizioni minori basate sulla forza della volontà e dell'odio.",
        subcategories: {
            "Fatture": []
        }
    },
    "5. SEGNI WITCHER": {
        desc: "Magia rapida e limitata utilizzata dai Witcher, inclusi i segni alternativi.",
        subcategories: {
            "Segni Witcher": []
        }
    },
    "6. DONI MAGICI": {
        desc: "Piccoli talenti magici innati posseduti da individui non addestrati professionalmente.",
        subcategories: {
            "Doni Magici": []
        }
    },
    "7. MALEDIZIONI": {
        desc: "Effetti narrativi e meccanici devastanti solitamente gestiti dal GM.",
        subcategories: {
            "Maledizioni GM": []
        }
    },
    "8. RUNE, GLIFI E RELIQUIE": {
        desc: "Incisioni magiche e oggetti di immenso potere.",
        subcategories: {
            "Rune, Glifi e Reliquie": []
        }
    },
    "REGOLE DI SUPPORTO GM (NECROMANZIA)": {
        desc: "Asset relativi alle regole di supporto per il GM (difficoltà di controllo dei non-morti). Non sono incantesimi lanciabili.",
        subcategories: {
            "Regole Necromanzia": []
        }
    }
};

assets.forEach(asset => {
    const parts = asset.relPath.split(/[\\/]/);
    const mainDir = parts[0];
    const subDir = parts[1];
    
    let categoryKey = "";
    let subCategoryKey = "";
    
    if (subDir === "witcher-spells") {
        categoryKey = "1. INCANTESIMI";
        subCategoryKey = "Incantesimi Standard";
    } else if (subDir === "witcher-necromanzia") {
        if (asset.name.startsWith("Incantesimo Necromante:")) {
            categoryKey = "1. INCANTESIMI";
            subCategoryKey = "Incantesimi di Necromanzia";
        } else if (asset.name.startsWith("Rituale Necromante:")) {
            categoryKey = "3. RITUALI";
            subCategoryKey = "Rituali di Necromanzia";
        } else if (asset.name.startsWith("Regola Necromanzia:")) {
            categoryKey = "REGOLE DI SUPPORTO GM (NECROMANZIA)";
            subCategoryKey = "Regole Necromanzia";
        } else {
            categoryKey = "REGOLE DI SUPPORTO GM (NECROMANZIA)";
            subCategoryKey = "Regole Necromanzia";
        }
    } else if (subDir === "witcher-invocations") {
        categoryKey = "2. INVOCAZIONI";
        subCategoryKey = "Invocazioni Chaos";
    } else if (subDir === "witcher-rituals") {
        categoryKey = "3. RITUALI";
        subCategoryKey = "Rituali Standard";
    } else if (subDir === "witcher-goetia") {
        categoryKey = "3. RITUALI";
        subCategoryKey = "Rituali di Goezia (GOE)";
    } else if (subDir === "witcher-hexes") {
        categoryKey = "4. FATTURE";
        subCategoryKey = "Fatture";
    } else if (subDir === "witcher-signs") {
        categoryKey = "5. SEGNI WITCHER";
        subCategoryKey = "Segni Witcher";
    } else if (subDir === "witcher-gifts") {
        categoryKey = "6. DONI MAGICI";
        subCategoryKey = "Doni Magici";
    } else if (subDir === "witcher-curses") {
        categoryKey = "7. MALEDIZIONI";
        subCategoryKey = "Maledizioni GM";
    } else if (subDir === "witcher-runes") {
        categoryKey = "8. RUNE, GLIFI E RELIQUIE";
        subCategoryKey = "Rune, Glifi e Reliquie";
    }
    
    if (categoryKey && subCategoryKey) {
        categories[categoryKey].subcategories[subCategoryKey].push(asset);
    }
});

// Build report markdown
let md = `# 🔮 Report Unificato Magia e Maledizioni\n\n`;
md += `Come richiesto, le **Arti Oscure** (Goezia, Necromanzia, Mutazione) sono state integrate nelle rispettive categorie di base (Incantesimi o Rituali), con una specifica distinzione per i Rituali di Goezia. Questo report segue ora fedelmente la gerarchia del manuale e facilita la gestione e il trascinamento degli elementi all'interno dei compendi di **Foundry VTT** rispettando la logica del sistema di gioco.\n\n`;

md += `## 📊 Riepilogo delle Categorie\n\n`;
md += `| N° | Categoria Principale | Totale Asset | Descrizione Breve |\n`;
md += `| :---: | :--- | :---: | :--- |\n`;

let totalCompendiumAssets = 0;
for (const [cat, info] of Object.entries(categories)) {
    let catCount = 0;
    for (const [sub, list] of Object.entries(info.subcategories)) {
        catCount += list.length;
    }
    if (cat !== "REGOLE DI SUPPORTO GM (NECROMANZIA)") {
        totalCompendiumAssets += catCount;
    }
    md += `| ${cat.split(".")[0]} | **${cat.replace(/^\d+\.\s+/, '')}** | **${catCount}** | ${info.desc} |\n`;
}
md += `| | **TOTALE ASSET ATTIVI** | **${totalCompendiumAssets}** | (Escluse le regole di supporto per il GM) |\n`;
md += `| | **TOTALE GLOBALE** | **${totalCompendiumAssets + categories["REGOLE DI SUPPORTO GM (NECROMANZIA)"].subcategories["Regole Necromanzia"].length}** | (Comprensivo di regole di supporto GM) |\n\n`;

md += `---\n\n`;

// Generate detailed sections
for (const [cat, info] of Object.entries(categories)) {
    let catCount = 0;
    for (const [sub, list] of Object.entries(info.subcategories)) {
        catCount += list.length;
    }
    
    md += `## ${cat} (${catCount} Asset)\n`;
    md += `> ${info.desc}\n\n`;
    
    for (const [sub, list] of Object.entries(info.subcategories)) {
        md += `### 📂 ${sub} (${list.length} Asset)\n\n`;
        
        // Sort list alphabetically by name
        list.sort((a, b) => a.name.localeCompare(b.name, 'it'));
        
        md += `| Nome Asset | Tipo Meccanico | File di Origine |\n`;
        md += `| :--- | :---: | :--- |\n`;
        
        list.forEach(item => {
            md += `| **${item.name}** | \`${item.type}\` | \`${item.file}\` |\n`;
        });
        
        md += `\n`;
    }
    
    md += `---\n\n`;
}

md += `\n> **Nota sulla Necromanzia:** All'interno del database sono presenti anche 3 asset relativi alle regole degli *Spiriti Senza Pace (Novizio, Esperto, Maestro)*, che definiscono la difficoltà di controllo dei non-morti. Questi non sono incantesimi lanciabili ma regole di supporto per il GM, e sono stati isolati nell'ultima sezione di questo report per chiarezza organizzativa.\n`;

const reportPath = "e:\\AntigravitiProgetti\\CompendioTheWitcher\\TO DO\\report_magia_e_maledizioni.md";
fs.writeFileSync(reportPath, md, 'utf8');

console.log(`Reclassified report generated successfully at: ${reportPath}`);
