const fs = require('fs');
const path = require('path');

const basePath = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti`;
const repoRoot = `e:\\AntigravitiProgetti\\CompendioTheWitcher`;
let outputLog = [];

function logAndSave(msg) {
    outputLog.push(msg);
}

function checkFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(checkFiles(fullPath));
        } else if (fullPath.endsWith('.json')) {
            results.push(fullPath);
        }
    }
    return results;
}

const allJsons = checkFiles(basePath);

allJsons.forEach(file => {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    const packName = path.basename(path.dirname(file));
    const name = content.name || '???';
    
    // 1 & 2. Name and Text validation
    const description = (content.system && content.system.description) || '';
    const plainText = description.replace(/<[^>]+>/g, '').trim();
    
    if (plainText.length === 0) {
        logAndSave(`[${packName}] [${name}] — PROBLEMA: Descrizione vuota — AZIONE SUGGERITA: Interrogare NotebookLM: "Fornisci il testo completo per la voce di Lore '${name}' dal manuale corretto."`);
    } else if (plainText.length < 50) {
        logAndSave(`[${packName}] [${name}] — PROBLEMA: Descrizione troncata o troppo corta (${plainText.length} char) — AZIONE SUGGERITA: Interrogare NotebookLM: "Fornisci il testo esteso per la voce di Lore '${name}'."`);
    } else if (/todo|placeholder/i.test(plainText)) {
        logAndSave(`[${packName}] [${name}] — PROBLEMA: Descrizione contiene placeholder — AZIONE SUGGERITA: Interrogare NotebookLM: "Qual è la descrizione reale di '${name}' nel manuale?"`);
    }

    // 3. Sourcebook
    const sourcebook = (content.system && content.system.sourcebook) || '';
    if (!sourcebook || !/^(MB|TC|LR|DLC|TCR|LRS|LRC|LRE|LRM)(\s|$)/.test(sourcebook.trim())) {
        logAndSave(`[${packName}] [${name}] — PROBLEMA: Fonte mancante o non valida ("${sourcebook}") — AZIONE SUGGERITA: Verificare manuale di provenienza su NotebookLM.`);
    }

    // 4. Image
    const imgDbPath = content.img;
    let imgProblem = false;
    if (!imgDbPath || imgDbPath.includes('icons/svg') || imgDbPath.includes('mystery-man')) {
        logAndSave(`[${packName}] [${name}] — PROBLEMA: Percorso immagine generico o vuoto — AZIONE SUGGERITA: Recuperare o generare asset corretto per la voce.`);
    } else {
        let localImgPath = imgDbPath.replace(/^modules\/witcher-compendium\//, 'witcher-compendium/');
        const absoluteImgPath = path.join(repoRoot, localImgPath).replace(/\\/g, '/');
        
        if (!fs.existsSync(absoluteImgPath)) {
            logAndSave(`[${packName}] [${name}] — PROBLEMA: L'asset img '${imgDbPath}' non esiste su disco — AZIONE SUGGERITA: Estrarre o convertire l'immagine dal PDF corrispondente.`);
        }
    }

    // 5. _stats
    const stats = content._stats || {};
    if (stats.systemId !== 'TheWitcherItaNewSystem' || stats.coreVersion !== 14) {
        logAndSave(`[${packName}] [${name}] — PROBLEMA: _stats non valido (systemId: ${stats.systemId}, coreVersion: ${stats.coreVersion}) — AZIONE SUGGERITA: Aggiornare in blocco tramite macro di Foundry o script per v14.`);
    }
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\audit_result_utf8.txt', outputLog.join('\n'), 'utf8');
