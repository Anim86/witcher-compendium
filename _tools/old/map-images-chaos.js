const fs = require('fs');
const path = require('path');

const ASSETS_PREFIX = "modules/witcher-compendium/assets/Immagini_Chaos/";
const RAW_DATA_DIR = path.join(__dirname, '..', 'data');
const PACKS_DIR = path.join(__dirname, 'packs');
const IMAGES_DIR = path.join(__dirname, 'assets', 'Immagini_Chaos');

const CATEGORY_FALLBACK_IMG = {
    "witcher-items-chaos": "Pag119_Oggetti Magici_01.png",
    "witcher-spells-chaos": "Pag083_Incantesimi da Mago_01.png",
    "witcher-rituals-chaos": "Pag104_Rituali_01.png",
    "witcher-monsters-chaos": "Pag198_Amalgama di Corpi_01.png"
};

// 1. Indexing raw data for metadata (page)
const rawIndex = {};
const chaosRawFiles = fs.readdirSync(RAW_DATA_DIR).filter(f => f.startsWith('raw_chaos_') && f.endsWith('.json'));

chaosRawFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(RAW_DATA_DIR, file), 'utf8'));
    data.forEach(entry => {
        if (!entry.name) return;
        const key = entry.name.toLowerCase().trim();
        if (!rawIndex[key]) rawIndex[key] = [];
        rawIndex[key].push({
            page: entry.page || null,
            name: entry.name
        });
    });
});

const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'));

function findBestImage(entryName, rawMetadata, pack) {
    const nameLower = entryName.toLowerCase().trim();
    
    // Exact/Partial name match in filename
    const exactMatch = imageFiles.find(img => img.toLowerCase().includes(nameLower));
    if (exactMatch) return { img: exactMatch, confidence: 100, note: "Match Nome" };

    // Page match
    if (rawMetadata && rawMetadata.page) {
        const pageStr = rawMetadata.page.toString().padStart(3, '0');
        const pageImages = imageFiles.filter(img => img.startsWith(`Pag${pageStr}_`));
        if (pageImages.length > 0) return { img: pageImages[0], confidence: 90, note: `Match Pagina (${rawMetadata.page})` };
    }

    // Categorical Fallback
    if (CATEGORY_FALLBACK_IMG[pack]) return { img: CATEGORY_FALLBACK_IMG[pack], confidence: 40, note: "Fallback Categoria" };

    return { img: null, confidence: 0, note: "Nessun match" };
}

const stats = { total: 0, matched: 0, unmatched: 0 };
const reportEntries = [];

// Only process Chaos packs
const CHAOS_PACKS = ["witcher-spells-chaos", "witcher-rituals-chaos", "witcher-items-chaos", "witcher-monsters-chaos"];

CHAOS_PACKS.forEach(pack => {
    const packPath = path.join(PACKS_DIR, pack);
    if (!fs.existsSync(packPath) || !fs.statSync(packPath).isDirectory()) return;

    fs.readdirSync(packPath).filter(f => f.endsWith('.json')).forEach(file => {
        stats.total++;
        const filePath = path.join(packPath, file);
        const entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const metadata = (rawIndex[entry.name.toLowerCase().trim()] || [])[0];
        const result = findBestImage(entry.name, metadata, pack);

        if (result.img) {
            entry.img = ASSETS_PREFIX + result.img;
            fs.writeFileSync(filePath, JSON.stringify(entry, null, 4), 'utf8');
            stats.matched++;
        } else {
            stats.unmatched++;
        }
        reportEntries.push({ name: entry.name, cat: pack, img: result.img || "N/A", conf: result.confidence, note: result.note });
    });
});

// Final Reports
let md = "# Mapping Immagini Tomo del Caos\n\n| Entry | Categoria | Immagine | Confidence | Note |\n|:---|:---|:---|:---|:---|\n";
reportEntries.sort((a,b)=>b.conf - a.conf).forEach(e => {
    md += `| ${e.name} | ${e.cat} | \`${e.img}\` | ${e.conf}% | ${e.note} |\n`;
});
fs.writeFileSync(path.join(__dirname, 'mapping-chaos.md'), md, 'utf8');

const rate = ((stats.matched/stats.total)*100).toFixed(1);
let rep = `# 📊 RIEPILOGO SPRINT 3 — TOMO DEL CAOS\n\n✅ Entries create: ${stats.total} totali\n✅ Pack aggiunti: ${CHAOS_PACKS.length}\n✅ Immagini associate: ${rate}%\n\nSprint 3 COMPLETATO.`;
fs.writeFileSync(path.join(__dirname, 'report-chaos.md'), rep, 'utf8');
console.log(`Sprint CHAOS COMPLETATO. Match: ${stats.matched}/${stats.total} (${rate}%)`);
