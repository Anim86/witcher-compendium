import fs from 'fs';
import path from 'path';

// Configurazione percorsi
const ROOT = 'c:\\Users\\apaci\\Desktop\\Script\\witcher-compendium-main';
const missingReportPath = path.join(ROOT, '_tools\\reports\\smart-missing-assets.md');
const promptMapPath = path.join(ROOT, '_tools\\prompts_archive\\notebooklm_prompts_to_process.md');
const archiveDir = path.join(ROOT, '_tools\\prompts_archive');
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

// 2. Carica la mappa dei Batch (NotebookLM list)
const promptMapContent = fs.readFileSync(promptMapPath, 'utf8');
const batchMap = {}; // name -> {batch, index}
let currentBatch = null;
let currentIndex = 0;

function cleanForMatch(name) {
    return name.toLowerCase()
        .replace(/schema: /g, '')
        .replace(/schema /g, '')
        .replace(/\(x\d+\)/g, '')
        .replace(/—/g, '-')
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
        batchMap[cleanForMatch(itemName)] = { batch: currentBatch, index: currentIndex };
        currentIndex++;
    }
});

// 3. Carica i prompt
const promptStrings = {};
fs.readdirSync(archiveDir).forEach(file => {
    if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(archiveDir, file), 'utf8');
        const arrayMatches = content.matchAll(/const prompts(\d+) = \[([\s\S]*?)\];/g);
        for (const match of arrayMatches) {
            const batchNum = match[1];
            const arrayStr = match[2];
            // Split più robusto
            const prompts = arrayStr.split(/",\s*\n\s*"/).map(p => 
                p.trim()
                .replace(/^"/, '')
                .replace(/"$/, '')
                .replace(/\\'/g, "'")
                .replace(/\\"/g, '"')
            );
            promptStrings[batchNum] = prompts;
        }
    }
});

// 4. Genera la lista Master
let masterList = `# 🎯 Master Generation List - Witcher Compendium\n\n`;
masterList += `Ultimo aggiornamento: ${new Date().toLocaleString()}\n\n`;
masterList += `## 📋 Istruzioni Operative (A PROVA DI BOMBA)\n`;
masterList += `1. **Scegli un oggetto** dalla lista qui sotto che abbia lo stato \`[ ]\`.\n`;
masterList += `2. **Generazione**: Usa il prompt nella colonna "Prompt Complesso".\n`;
masterList += `3. **Salvataggio**: Salva l'immagine come **WebP (512x512)** nel percorso indicato.\n`;
masterList += `4. **Check-out**: Una volta salvato il file, cambia lo stato da \`[ ]\` a \`[X]\`.\n`;
masterList += `5. **Handover**: Prima di chiudere la chat, fai il commit di questo file aggiornato.\n\n`;

masterList += `| Stato | Nome Oggetto | Percorso Target | Prompt Complesso |\n`;
masterList += `| :---: | :--- | :--- | :--- |\n`;

missingItems.forEach(item => {
    const searchKey = cleanForMatch(item.originalName);
    const mapping = batchMap[searchKey];
    let prompt = '⚠️ Prompt non trovato - Generare partendo dalla descrizione nel JSON';
    
    if (mapping && promptStrings[mapping.batch] && promptStrings[mapping.batch][mapping.index]) {
        prompt = promptStrings[mapping.batch][mapping.index];
    }
    
    masterList += `| [ ] | ${item.originalName} | \`${item.path}\` | ${prompt} |\n`;
});

fs.writeFileSync(masterListPath, masterList);
console.log('Master List v2 generata con successo.');
