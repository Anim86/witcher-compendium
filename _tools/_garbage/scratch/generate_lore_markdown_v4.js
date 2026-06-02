const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-lore';
const outputDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO';
const mdFile = path.join(outputDir, 'report_lore_compendio.md');

// Robust normalization function replacing accented chars with standard ASCII
function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents (e.g. à -> a)
        .replace(/[^a-z0-9]/g, '') // remove remaining non-alphanumeric characters
        .trim();
}

// Map of categories and their ordered items
const categories = [
    {
        name: "🏢 Accademie e Istituzioni",
        items: [
            "Accademia di Ban Ard",
            "Accademia di Oxenfurt",
            "Scuola di Aretuza",
            "Confraternita dei Maghi",
            "Loggia delle Maghe",
            "Società delle Maghe dell'Alto Monte"
        ]
    },
    {
        name: "🐺 I Witcher e le loro Scuole",
        items: [
            "L'Epoca d'Oro dei Witcher",
            "La Vita di un Witcher",
            "Scuola del Gatto",
            "Scuola del Grifone",
            "Scuola del Lupo",
            "Scuola dell'Orso",
            "Scuola della Manticora",
            "Scuola della Vipera"
        ]
    },
    {
        name: "⛪ Religioni e Culti",
        items: [
            "Chiesa di Kreve",
            "Druidismo",
            "Freya",
            "Fuoco Eterno",
            "Il Grande Sole",
            "Melitele",
            "Niya (Lilit)",
            "Ordine della Rosa Fiammeggiante",
            "San Gregory",
            "Storia dei Druidi",
            "Veyopatis (e Svalblod)"
        ]
    },
    {
        name: "🌍 Geografia e Luoghi",
        items: [
            "Isola di Thanedd",
            "Kaer Morhen",
            "Strade e Distanze del Continente",
            "Valle del Pontar"
        ]
    },
    {
        name: "🔮 Lore sulla Magia, Demoni e Linee Geomantiche",
        items: [
            "Demoni Maggiori e Veri Nomi",
            "La Vita da Mago",
            "Lore: Linee Geomantiche — Definizione",
            "Lore: Linee Geomantiche — Elemento Acqua",
            "Lore: Linee Geomantiche — Elemento Aria",
            "Lore: Linee Geomantiche — Elemento Fuoco",
            "Lore: Linee Geomantiche — Elemento Terra",
            "Lore: Linee Geomantiche — Preti e Druidi",
            "Lore: Linee Geomantiche — Trarre Potere",
            "Lore: Luoghi di Potere (Unita alle nozioni base del Manuale)",
            "Lore: Redigere uno Scritto (Introduzione TC)",
            "Vita Scolastica dei Maghi"
        ]
    },
    {
        name: "⚔️ Organizzazioni e Popolazioni",
        items: [
            "Cacciatori di Maghi",
            "Havekar",
            "Luna Crescente",
            "Scoia'tael"
        ]
    },
    {
        name: "🗣️ Glossario e Viaggi",
        items: [
            "Glossario Dialetto Skellige",
            "Tipi di Locali e Taverne",
            "Peculiarità delle Locande",
            "Locanda La Spada Canterina"
        ]
    }
];

// Read files in witcher-lore directory to create metadata index
const jsonFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
const loreDb = {};

for (const file of jsonFiles) {
    const filePath = path.join(srcDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const norm = normalize(content.name || '');
    
    loreDb[norm] = {
        name: content.name,
        img: content.img || '',
        sourcebook: content.system?.sourcebook || ''
    };
}

// Custom manual resolutions for special/merged entries
const customMatches = {
    "veyopatisesvalblod": "veyopatis",
    "loreluoghidipotereunitaallenozionibasedelmanuale": "loreluoghidipotere"
};

// Find matching JSON metadata for an item
function findMetadata(itemName) {
    const normName = normalize(itemName);
    
    // Check manual custom matches
    if (customMatches[normName]) {
        const key = normalize(customMatches[normName]);
        const meta = loreDb[key];
        if (meta) {
            if (normName === "loreluoghidipotereunitaallenozionibasedelmanuale") {
                return {
                    img: "modules/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/witcher-lore/lore_luoghi_di_potere.webp",
                    sourcebook: "TC 10 / MB 122"
                };
            }
            return meta;
        }
    }
    
    // Check direct match
    if (loreDb[normName]) {
        return loreDb[normName];
    }
    
    // Substring matching as fallback
    for (const key in loreDb) {
        if (normName.includes(key) || key.includes(normName)) {
            return loreDb[key];
        }
    }
    
    return { img: '', sourcebook: '' };
}

function cleanDescriptionForTable(text) {
    if (!text) return '';
    // Format description: replace newlines with <br> to render correctly in Markdown table
    // Also escape pipes to avoid breaking table syntax
    let clean = text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
    return clean;
}

async function run() {
    console.log("Reading report_lore_compendio.md...");
    const content = fs.readFileSync(mdFile, 'utf8');
    const lines = content.split('\n');
    
    // Find where the user's raw text begins (Line 96 -> index 95)
    let startIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "Accademie e Istituzioni") {
            startIndex = i;
            break;
        }
    }
    
    if (startIndex === -1) {
        throw new Error("Could not find the starting line 'Accademie e Istituzioni' of the appended text!");
    }
    
    console.log(`User's raw text starts at line ${startIndex + 1}`);
    const rawLines = lines.slice(startIndex);
    
    // Parse descriptions from appended raw text
    const extractedDescs = {};
    let currentItem = null;
    let descLines = [];
    
    const allItemNames = [];
    for (const cat of categories) {
        allItemNames.push(...cat.items);
    }
    
    const itemNormMap = {};
    for (const name of allItemNames) {
        itemNormMap[normalize(name)] = name;
    }
    
    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        const normLine = normalize(line);
        
        if (itemNormMap[normLine]) {
            if (currentItem) {
                extractedDescs[normalize(currentItem)] = descLines.join('\n').trim();
            }
            currentItem = itemNormMap[normLine];
            descLines = [];
        } else if (line === "Accademie e Istituzioni" || 
                   line === "🐺 I Witcher e le loro Scuole" || 
                   line === "⛪ Religioni e Culti" || 
                   line === "🌍 Geografia e Luoghi" || 
                   line === "🔮 Lore sulla Magia, Demoni e Linee Geomantiche" || 
                   line === "⚔️ Organizzazioni e Popolazioni" || 
                   line === "🗣️ Glossario e Viaggi") {
            if (currentItem) {
                extractedDescs[normalize(currentItem)] = descLines.join('\n').trim();
                currentItem = null;
                descLines = [];
            }
        } else {
            if (currentItem) {
                descLines.push(rawLines[i]);
            }
        }
    }
    
    if (currentItem) {
        extractedDescs[normalize(currentItem)] = descLines.join('\n').trim();
    }
    
    // Verify all 49 items are parsed
    console.log("Parsed items count:", Object.keys(extractedDescs).length);
    
    // Build final Markdown content
    let mdContent = `# 📖 Report Compendio LORE\n\n`;
    mdContent += `Questo report raccoglie tutte le **49 voci di Lore** presenti all'interno del compendio *REGOLAMENTO E NARRATIVA*, suddivise per categorie ed organizzate in tabelle riassuntive complete.\n\n`;
    
    for (const cat of categories) {
        mdContent += `## ${cat.name}\n\n`;
        mdContent += `| Nome Compendio | Path Immagine | Sourcebook | Descrizione |\n`;
        mdContent += `| :--- | :--- | :---: | :--- |\n`;
        
        for (const itemName of cat.items) {
            const meta = findMetadata(itemName);
            const desc = extractedDescs[normalize(itemName)] || '';
            
            if (!desc) {
                console.warn(`WARNING: Missing description for "${itemName}"`);
            }
            
            const tableDesc = cleanDescriptionForTable(desc);
            mdContent += `| **${itemName}** | \`${meta.img}\` | *${meta.sourcebook}* | ${tableDesc} |\n`;
        }
        mdContent += `\n`;
    }
    
    fs.writeFileSync(mdFile, mdContent, 'utf8');
    console.log(`Report LORE MD rigenerato ed allineato con successo in: ${mdFile}`);
}

run().catch(console.error);
