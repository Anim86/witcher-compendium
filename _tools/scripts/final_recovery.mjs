import fs from 'fs';
import path from 'path';

const ROOT = 'c:\\Users\\apaci\\Desktop\\Script\\witcher-compendium-main';
const missingReportPath = path.join(ROOT, '_tools\\reports\\smart-missing-assets.md');
const promptMapPath = path.join(ROOT, '_tools\\prompts_archive\\notebooklm_prompts_to_process.md');
const archiveDir = path.join(ROOT, '_tools\\prompts_archive');
const dbPath = path.join(ROOT, '_tools\\scripts\\aggressive_prompts_db.json');
const masterListPath = path.join(ROOT, '_tools\\MASTER_GENERATION_LIST.md');

// 1. Carica i mancanti
const reportContent = fs.readFileSync(missingReportPath, 'utf8');
const missingItems = [];
reportContent.split('\n').forEach(line => {
    if (line.includes('|') && !line.includes('Nome') && !line.includes('---')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts[1]) {
            missingItems.push({ originalName: parts[1], path: parts[3] });
        }
    }
});

console.log(`Caricati ${missingItems.length} asset mancanti.`);

// 2. Carica la mappa dei Batch (NotebookLM list) per matching per indice
const promptMapContent = fs.readFileSync(promptMapPath, 'utf8');
const batchToIndexMap = {}; // nameClean -> {batch, index}
let currentBatch = null;
let currentIndex = 0;

function cleanForMatch(name) {
    return name.toLowerCase()
        .replace(/schema: /g, '')
        .replace(/schema /g, '')
        .replace(/\(x\d+\)/g, '')
        .replace(/\(.*\)/g, '') // Rimuove parentesi come (Katakan) o (Spada Lunga Reliquia)
        .replace(/—/g, '-')
        .replace(/['’]/g, ' ')
        .trim();
}

promptMapContent.split('\n').forEach(line => {
    const batchMatch = line.match(/Batch (\d+):/);
    if (batchMatch) {
        currentBatch = batchMatch[1];
        currentIndex = 0;
    }
    if (line.startsWith('- ') && currentBatch) {
        const itemName = line.replace('- ', '').trim();
        batchToIndexMap[cleanForMatch(itemName)] = { batch: currentBatch, index: currentIndex };
        currentIndex++;
    }
});

// 3. Carica tutti i prompt dagli archivi JS
const promptPoolByBatch = {};
fs.readdirSync(archiveDir).forEach(file => {
    if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(archiveDir, file), 'utf8');
        // Regex più flessibile per estrarre gli array
        const arrayMatches = content.matchAll(/const prompts(\d+) = \[([\s\S]*?)\];/g);
        for (const match of arrayMatches) {
            const batchNum = match[1];
            const arrayStr = match[2];
            // Split robusto per stringhe tra virgolette doppie
            const prompts = arrayStr.split(/",\s*\r?\n\s*"/).map(p => 
                p.trim()
                .replace(/^"/, '')
                .replace(/"$/, '')
                .replace(/\\'/g, "'")
                .replace(/\\"/g, '"')
            );
            promptPoolByBatch[batchNum] = prompts;
        }
    }
});

// 4. Carica prompts dal Database JSON per ricerca testuale
const dbPrompts = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 5. Dizionario Traduzioni per Keyword Matching
const translations = {
    'lupo': 'wolf',
    'orso': 'bear',
    'gatto': 'cat',
    'grifone': 'griffin',
    'manticora': 'manticore',
    'vipera': 'viper',
    'spada': 'sword',
    'argento': 'silver',
    'acciaio': 'steel',
    'schema': 'schematic',
    'reliquia': 'relic'
};

// 6. Funzione di ricerca "Disperata" (Fuzzy/Keyword)
function findPromptHeuristically(assetName) {
    const clean = cleanForMatch(assetName);
    const words = clean.split(' ').filter(w => w.length > 3);
    const englishWords = words.map(w => translations[w] || w);

    // Cerca nel DB per parole chiave
    for (const entry of dbPrompts) {
        const p = entry.prompt.toLowerCase();
        // Se tutte le parole chiave inglesi (o almeno le più importanti) sono nel prompt
        if (englishWords.every(w => p.includes(w))) {
            return entry.prompt;
        }
    }

    // Prova con combinazioni ridotte
    if (englishWords.length > 1) {
        const crucial = englishWords.filter(w => Object.values(translations).includes(w));
        for (const entry of dbPrompts) {
            const p = entry.prompt.toLowerCase();
            if (crucial.length > 0 && crucial.every(w => p.includes(w)) && words.some(w => p.includes(w))) {
                 return entry.prompt;
            }
        }
    }

    return null;
}

// 7. Genera la Master List
let masterList = `# 🎯 Master Generation List - Witcher Compendium\n\n`;
masterList += `Ultimo aggiornamento: ${new Date().toLocaleString()}\n\n`;
masterList += `## 📋 Istruzioni Operative\n`;
masterList += `1. **Stato**: \`[ ]\` = Da fare, \`[X]\` = Completato.\n`;
masterList += `2. **Prompt**: Usa ESATTAMENTE il testo nella colonna "Prompt Complesso".\n`;
masterList += `3. **Formato**: 512x512 WebP.\n\n`;

masterList += `| Stato | Nome Oggetto | Percorso Target | Prompt Complesso |\n`;
masterList += `| :---: | :--- | :--- | :--- |\n`;

let foundCount = 0;
missingItems.forEach(item => {
    const searchKey = cleanForMatch(item.originalName);
    const mapping = batchToIndexMap[searchKey];
    let prompt = null;

    // A. Prova con matching per indice (Batch Map)
    if (mapping && promptPoolByBatch[mapping.batch] && promptPoolByBatch[mapping.batch][mapping.index]) {
        prompt = promptPoolByBatch[mapping.batch][mapping.index];
    }

    // B. Prova con ricerca testuale nel DB
    if (!prompt) {
        prompt = findPromptHeuristically(item.originalName);
    }

    if (prompt) {
        foundCount++;
    } else {
        prompt = '⚠️ Prompt non trovato - Generare manualmente basandosi sul nome';
    }

    masterList += `| [ ] | ${item.originalName} | \`${item.path}\` | ${prompt} |\n`;
});

fs.writeFileSync(masterListPath, masterList);
console.log(`Recupero completato: ${foundCount}/${missingItems.length} prompt trovati.`);
