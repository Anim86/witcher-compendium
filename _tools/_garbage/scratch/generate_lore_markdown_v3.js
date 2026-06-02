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

// Smart OCR cleanup and formatting function
function ocrCleanup(html, name) {
    if (!html) return '';
    let normName = normalize(name);

    // 1. Handle special tables before stripping HTML
    if (normName.includes("glossariodialettoskellige")) {
        // Convert Skellige table to Markdown Table
        let mdTable = '\n\n| Skellige | Traduzione |\n| :--- | :--- |\n';
        const rows = html.match(/<tr>[\s\S]*?<\/tr>/g) || [];
        for (const row of rows) {
            const cells = row.match(/<td>([\s\S]*?)<\/td>/g) || [];
            if (cells.length === 2) {
                const c1 = cells[0].replace(/<[^>]*>/g, '').trim();
                const c2 = cells[1].replace(/<[^>]*>/g, '').trim();
                mdTable += `| ${c1} | ${c2} |\n`;
            }
        }
        return `Glossario del dialetto parlato nelle isole Skellige.${mdTable}`;
    }

    if (normName.includes("peculiaritedellelocande")) {
        // Convert Peculiarità table to structured list
        let listStr = 'Ogni locale del Continente è unico e ha le proprie peculiarità distintive.\n';
        const rows = html.match(/<tr>[\s\S]*?<\/tr>/g) || [];
        for (const row of rows) {
            const cells = row.match(/<td>([\s\S]*?)<\/td>/g) || [];
            if (cells.length === 2) {
                const num = cells[0].replace(/<[^>]*>/g, '').trim();
                const text = cells[1].replace(/<[^>]*>/g, '').trim();
                listStr += `${num}: ${text}\n`;
            }
        }
        return listStr.trim();
    }

    // 2. Strip standard HTML tags
    let text = html.replace(/<[^>]*>/g, '');

    // 3. Remove PDF/OCR page markers, headings and annotations
    text = text.replace(/--- Pagina \d+ ---/g, '');
    text = text.replace(/\[Immagini presenti in questa pagina: [^\]]+\]/g, '');
    
    // 4. Remove page footers and OCR metadata (e.g. "Davide Mesina - 355175" or "Alessandro Pacifico - 355698")
    text = text.replace(/(Davide Mesina|Alessandro Pacifico)\s*-\s*\d+/g, '');

    // 5. Fix hyphenated line breaks from OCR (e.g. "omo- nima" or "omo-\nnima" -> "omonima")
    text = text.replace(/(\b\w+)-\s*\r?\n?\s*(\w+)/g, '$1$2');

    // 6. Clean up multiple spaces and newlines
    text = text.replace(/\s+/g, ' ').trim();

    // 7. Targeted header prefixes removals for specific files
    if (normName.includes("accademiadibanard")) {
        text = text.replace(/^BAN ARD\s+/i, '');
    }
    if (normName.includes("veyopatisesvalblod") || normName.includes("veyopatis")) {
        text = text.replace(/^\d*\s*(SVALBLOD\s+VEYOPATIS|SVALBLOD\s*\n?\s*VEYOPATIS|SVALBLOD|VEYOPATIS)\s+/i, '');
    }
    if (normName.includes("freya")) {
        text = text.replace(/^\d*\s*(FREYA DEI DEL MARE|HEMDALL E I CLAN|FREYA)\s+/i, '');
    }
    if (normName.includes("melitele")) {
        // Melitele JSON has combined Melitele/Fuoco Eterno text. We extract Melitele's specific portion.
        const meliteleStart = text.indexOf("Il culto di Melitele, archetipo della divinità della fertilità");
        if (meliteleStart !== -1) {
            text = "Eh, dettaglio divertente sui templi di Melitele: molti credono che sia facile depredarli o roba simile. Ci abitano solo delle studiose e ci sono un sacco di statue ed erbe da rubare. Potresti anche riuscirci in un posto sperduto nei boschi, anche perché le sacerdotesse non sono addestrate al combattimento. Ma lascia che te lo dica: non ne hanno bisogno. Alcuni anni fa, ho visto con i miei occhi un gruppo di banditi provare a sfondare le porte di un tempio in Aedirn. Stavo per mettere mano alla balestra, ovviamente, quando la gente iniziò a uscire dalle capanne. Eh, arrivò ogni fratello, figlio, marito e padre. Tutti con un'arma, dalle asce da boscaiolo ai coltelli da cucina. —Rodolf Kazmer " + text.slice(meliteleStart);
        }
    }
    if (normName.includes("fuocoeterno")) {
        // Extract Fuoco Eterno specific portion
        const fuocoStart = text.indexOf("La Chiesa del Fuoco Eterno ha avuto origine a Novigrad");
        if (fuocoStart !== -1) {
            text = text.slice(fuocoStart);
        }
    }
    if (normName.includes("ilgrandesole")) {
        // Extract Grande Sole specific portion
        const soleStart = text.indexOf("Esiste un solo culto ufficiale a Nilfgaard");
        if (soleStart !== -1) {
            text = text.slice(soleStart);
        }
    }

    return text;
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

const swordInnCompletedDesc = `Collocata sui Monti Amell, a metà strada tra Cintra e Nazair, la Spada Canterina è la storia del successo di Caed Aep Clamadh, ex-soldato divenuto locandiere e signore, anche se alcuni dicono abbia ottenuto il titolo con la forza. Per migliorare la propria reputazione, Caed ha iniziato a organizzare feste ogni mese, in corrispondenza della luna piena. In tali occasioni, clienti e personale possono bere tutto ciò che vogliono per sole 12 corone. Il Servizio Segreto Imperiale adora queste feste, perché è facile strappare informazioni ai clienti ubriachi prima che perdano i sensi. Nilfgaard è molto più aperta verso i non-umani, ma ciò non include i witcher. Gli impiegati di Caed hanno ordine di non affittare mai stanze ai cacciatori di mostri. Possono dormire solo nella sala comune dopo la chiusura. Dato che la Spada Canterina chiude dopo mezzanotte e riapre all'alba, i witcher dormono persino meno dei viaggiatori più poveri. Caed preferisce che i “mutanti” se ne vadano dopo una notte, a meno che abbiano abbastanza oro da pagare per mesi. Poco dopo la Seconda Guerra Settentrionale, Caed comprò una piccola caserma fortificata, eretta dall'esercito Nilfgaardiano nella Valle di Marnadal come parte dei preparativi per l'Assedio di Cintra, e ne fece una locanda. Le robuste mura proteggono il locale dai mostri e sono un simbolo di protezione per tutti i viaggiatori stanchi. Il luogo si dimostrò ideale e Caed non esitò a ristrutturare i dormitori per ricavarne altre stanze, oltre a ordinare la costruzione di alcuni annessi. Oggi la Spada Canterina ha un bagno pubblico, una forgia, grandi stalle e oltre venti stanze divise in quattro strutture. Per procurarsi in fretta i fondi, Caed fece un patto con il Servizio Segreto Imperiale: in cambio del denaro necessario a espandere il locale, l'agenzia avrebbe potuto sfruttare gratuitamente la Spada Canterina come base operativa e collocarvi un ricettatore che intercetta la refurtiva proveniente dai Regni Settentrionali… tutto per la gloria di Nilfgaard. Se non vogliono dormire all'aperto, i viaggiatori che valicano i Monti Amell sono quasi obbligati a fermarsi alla Spada Canterina e Caed ha adeguato i prezzi. Chi vuole pace e tranquillità può affittare una stanza singola per quasi cento Corone Redaniane (al cambio attuale). In alternativa ci sono sette camere doppie o il vecchio dormitorio militare, che contiene quarantaquattro letti. I viaggiatori più poveri possono affittare un pagliericcio nella sala comune per poche monete, ma è piuttosto scomodo. Per ospitare tutti gli impiegati, attorno al locale è sorto un piccolo villaggio, di cui Caed Aep Clamadh è stato nominato signore.`;

// Read files in witcher-lore directory to create an index
const jsonFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
const loreDb = {};

for (const file of jsonFiles) {
    const filePath = path.join(srcDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const norm = normalize(content.name || '');
    
    loreDb[norm] = {
        name: content.name,
        img: content.img || '',
        sourcebook: content.system?.sourcebook || '',
        description: content.system?.description || ''
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
                    sourcebook: "TC 10 / MB 122",
                    description: meta.description
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
    
    return { img: '', sourcebook: '', description: '' };
}

function cleanDescriptionForTable(text) {
    if (!text) return '';
    // Format description: replace newlines with <br> to render correctly in Markdown table
    // Also escape pipes to avoid breaking table syntax
    let clean = text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
    return clean;
}

async function run() {
    console.log("Generating Markdown Report using cleaned up LORE database...");
    
    let mdContent = `# 📖 Report Compendio LORE\n\n`;
    mdContent += `Questo report raccoglie tutte le **49 voci di Lore** presenti all'interno del compendio *REGOLAMENTO E NARRATIVA*, suddivise per categorie ed organizzate in tabelle riassuntive complete.\n\n`;
    
    for (const cat of categories) {
        mdContent += `## ${cat.name}\n\n`;
        mdContent += `| Nome Compendio | Path Immagine | Sourcebook | Descrizione |\n`;
        mdContent += `| :--- | :--- | :---: | :--- |\n`;
        
        for (const itemName of cat.items) {
            const meta = findMetadata(itemName);
            
            let desc = '';
            if (normalize(itemName) === normalize("Locanda La Spada Canterina")) {
                desc = swordInnCompletedDesc;
            } else {
                desc = ocrCleanup(meta.description, itemName);
            }
            
            // Clean up description for the markdown table cell
            const tableDesc = cleanDescriptionForTable(desc);
            
            mdContent += `| **${itemName}** | \`${meta.img}\` | *${meta.sourcebook}* | ${tableDesc} |\n`;
        }
        mdContent += `\n`;
    }
    
    fs.writeFileSync(mdFile, mdContent, 'utf8');
    console.log(`Report LORE MD rigenerato con successo in: ${mdFile}`);
}

run().catch(console.error);
