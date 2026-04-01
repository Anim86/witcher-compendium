const fs = require('fs');
const path = require('path');

const ASSETS_PREFIX = "modules/witcher-compendium/assets/Immagini/";
const RAW_DATA_DIR = path.join(__dirname, '..', 'data');
const PACKS_DIR = path.join(__dirname, 'packs');
const IMAGES_DIR = path.join(__dirname, 'assets', 'Immagini');

const TRANSLATIONS = { "annegato": "drowner", "ghoul": "ghoul" };

const FILE_PAGE_FALLBACK = {
    "raw_spells_mago.json": 103, "raw_magic.json": 101, "raw_rituals_hexes.json": 118,
    "raw_monsters.json": 270, "raw_alchemy_items.json": 145, "raw_weapons.json": 75,
    "raw_armors.json": 80, "raw_general_items.json": 95
};

const CATEGORY_FALLBACK_IMG = {
    "witcher-alchemy": "Pag145_Sostanze Alchemiche_02.png",
    "witcher-components": "Pag131_Componenti per la Manifattura_10.png",
    "witcher-equipment": "Pag073_Equipaggiamento_09.png",
    "witcher-special": "Pag089_Prodotti Alchemici_08.png",
    "witcher-spells": "Pag101_La Magia in The Witcher_01.png",
    "witcher-rituals": "Pag118_Rituali_05.png",
    "witcher-schematics": "Pag132_Schemi di Manifattura_10.png"
};

const rawIndex = {};
const rawFiles = fs.readdirSync(RAW_DATA_DIR).filter(f => f.startsWith('raw_') && f.endsWith('.json'));
rawFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(RAW_DATA_DIR, file), 'utf8'));
    data.forEach(entry => {
        if (!entry.name) return;
        const key = entry.name.toLowerCase().trim();
        if (!rawIndex[key]) rawIndex[key] = [];
        rawIndex[key].push({
            page: entry.page || entry.page_num || FILE_PAGE_FALLBACK[file] || null,
            name: entry.name
        });
    });
});

const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'));

function findBestImage(entryName, rawMetadata, pack) {
    const nameLower = entryName.toLowerCase().trim();
    let searchName = TRANSLATIONS[nameLower] || nameLower;

    const exactMatch = imageFiles.find(img => img.toLowerCase().includes(searchName));
    if (exactMatch) return { img: exactMatch, confidence: 100, note: "Match Nome" };

    if (rawMetadata && rawMetadata.page) {
        const pageStr = rawMetadata.page.toString().padStart(3, '0');
        const pageImages = imageFiles.filter(img => img.startsWith(`Pag${pageStr}_`));
        if (pageImages.length > 0) return { img: pageImages[0], confidence: 90, note: `Match Pagina (${rawMetadata.page})` };
    }

    if (CATEGORY_FALLBACK_IMG[pack]) return { img: CATEGORY_FALLBACK_IMG[pack], confidence: 40, note: "Fallback Categoria" };

    return { img: null, confidence: 0, note: "Nessun match" };
}

const stats = { total: 0, matched: 0, unmatched: 0 };
const reportEntries = [];
fs.readdirSync(PACKS_DIR).forEach(pack => {
    const packPath = path.join(PACKS_DIR, pack);
    if (!fs.statSync(packPath).isDirectory()) return;

    fs.readdirSync(packPath).filter(f => f.endsWith('.json')).forEach(file => {
        stats.total++;
        const filePath = path.join(packPath, file);
        const entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const result = findBestImage(entry.name, (rawIndex[entry.name.toLowerCase().trim()] || [])[0], pack);

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

let md = "| Entry | Categoria | Immagine | Confidence | Note |\n|:---|:---|:---|:---|:---|\n";
reportEntries.sort((a,b)=>b.conf - a.conf).forEach(e => {
    md += `| ${e.name} | ${e.cat} | \`${e.img}\` | ${e.conf}% | ${e.note} |\n`;
});
fs.writeFileSync(path.join(__dirname, 'mapping-img.md'), md, 'utf8');

let rep = `# 📊 RIEPILOGO SPRINT IMG\n\n✅ Associate: ${stats.matched}/${stats.total} (${((stats.matched/stats.total)*100).toFixed(1)}%)\n⚠️ Mancanti: ${stats.unmatched}\n\nSprint COMPLETATO.`;
fs.writeFileSync(path.join(__dirname, 'report-img.md'), rep, 'utf8');
console.log(`Sprint IMG COMPLETATO. Match: ${stats.matched}/${stats.total}`);
