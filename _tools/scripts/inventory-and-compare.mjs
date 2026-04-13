import fs from 'fs';
import path from 'path';

/**
 * Script per l'inventario e il confronto del compendio (JSON vs TXT)
 * Obiettivo: Rilevare nuove voci e collisioni senza modificare i file.
 */

const CONFIG = {
    jsonRoot: '_tools/src-packs',
    txtRoot: 'Manuali',
    reportDir: '_tools/reports',
    blacklist: new Set([
        'PS', 'VIGORE', 'GRI', 'FOR', 'DES', 'COS', 'INT', 'VOL', 'MAN', 'RIF',
        'FIS', 'VEL', 'EMP', 'COR', 'BAL', 'RES', 'ING', 'REC',
        'ABILITÀ', 'DANNI', 'COSTO', 'PESO', 'AFFIDABILITÀ', 'DISPONIBILITÀ',
        'EFFETTO', 'TIPO', 'CATEGORIA', 'REQUISITI', 'DESCRIZIONE',
        'NOTA', 'SPECIALE', 'DIFFICOLTÀ', 'TEMPO', 'MATERIALI',
        'LOOT', 'RICOMPENSA', 'INCONTRO', 'TABELLA', 'CAPITOLO',
        'APPENDICE', 'INDICE', 'PARTE', 'SEZIONE', 'NOME', 'DAN', 'AFF', 'MANI',
        'GIT', 'OCC', 'POT', 'DISP'
    ])
};

const SOURCEBOOK_MAP = {
    'Tomo Base': 'MB',
    'Tomo del Caos': 'TC',
    'Libro dei Racconti': 'LR',
    'Diario di un Witcher': 'DW',
    'DLC': 'DL'
};

/**
 * Utility per camminare ricorsivamente nelle directory
 */
function walk(dir, extension = '.json') {
    let files = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            files = files.concat(walk(fullPath, extension));
        } else if (file.endsWith(extension)) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Step 1: Caricamento inventario JSON
 */
function scanJsonPacks() {
    console.log(`[JSON] Scansione in corso su ${CONFIG.jsonRoot}...`);
    const jsonFiles = walk(CONFIG.jsonRoot, '.json');
    const inventory = [];

    for (const filePath of jsonFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            // Rimuovi BOM se presente
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            const data = JSON.parse(content);
            const name = data.name || 'Senza Nome';
            const pack = path.basename(path.dirname(filePath));
            let source = '??';
            
            if (data.system && data.system.sourcebook) {
                source = data.system.sourcebook.trim().substring(0, 2).toUpperCase();
            }

            inventory.push({ name, pack, source, file: filePath });
        } catch (e) {
            console.error(`[JSON] Errore parsing ${filePath}: ${e.message}`);
        }
    }

    const output = inventory.map(item => `${item.name} | ${item.pack} | ${item.source}`).join('\n');
    fs.writeFileSync(path.join(CONFIG.reportDir, 'inventario-esistente.txt'), output, 'utf8');
    console.log(`[JSON] Inventario salvato: ${inventory.length} voci.`);
    return inventory;
}

/**
 * Step 2: Estrazione voci dai TXT
 */
function scanTxtManuals() {
    console.log(`[TXT] Scansione in corso su ${CONFIG.txtRoot}...`);
    const txtFiles = walk(CONFIG.txtRoot, '.txt');
    const items = [];

    // Regex per pattern "277 DROWNER"
    const pageItemRegex = /^\d{1,3}\s+([A-ZÀÈÌÒÙ\s]{3,60})$/;

    for (const filePath of txtFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        const fileName = path.basename(filePath);
        
        // Determina sourcebook dalla cartella padre immediata
        let source = '??';
        const parentDir = path.basename(path.dirname(filePath)); // Testi
        const grantParentDir = path.basename(path.dirname(path.dirname(filePath))); // Tomo Base
        
        if (SOURCEBOOK_MAP[grantParentDir]) {
            source = SOURCEBOOK_MAP[grantParentDir];
        } else if (SOURCEBOOK_MAP[parentDir]) {
            source = SOURCEBOOK_MAP[parentDir];
        }

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            let detectedName = null;

            // Heuristica 2: Pattern numero + MAIUSCOLO
            const matchPage = line.match(pageItemRegex);
            if (matchPage) {
                detectedName = matchPage[1].trim();
            } 
            // Heuristica 1: Riga interamente in MAIUSCOLO (3-60 chars)
            else if (line === line.toUpperCase() && line.length >= 3 && line.length <= 60 && /[A-Z]/.test(line)) {
                detectedName = line;
            }
            // Heuristica 3: Riga tabella (prima colonna testo)
            // Cerchiamo righe che iniziano con testo e hanno stats tipo "T/P", "2d6", etc.
            else if (line.includes('\t') || line.includes('  ')) {
                const parts = line.split(/[ \t]{2,}/).filter(p => p.trim());
                if (parts.length >= 3) {
                    const firstPart = parts[0].trim();
                    // Se la prima parte è testo e la seconda sembra una stat (tipo T/P o un numero)
                    if (/[a-zA-ZÀ-ÿ]/.test(firstPart) && firstPart.length > 2 && firstPart.length < 60) {
                        // Verifichiamo se non è in blacklist
                        if (!CONFIG.blacklist.has(firstPart.toUpperCase())) {
                            detectedName = firstPart;
                        }
                    }
                }
            }

            if (detectedName) {
                const upperName = detectedName.toUpperCase();
                // Check blacklist
                let isBlacklisted = false;
                for (const black of CONFIG.blacklist) {
                    if (upperName === black || upperName.startsWith(black + ' ')) {
                        isBlacklisted = true;
                        break;
                    }
                }

                if (!isBlacklisted) {
                    items.push({ name: detectedName, file: fileName, source });
                }
            }
        }
    }

    const output = items.map(item => `${item.name} | ${item.file} | ${item.source}`).join('\n');
    fs.writeFileSync(path.join(CONFIG.reportDir, 'inventario-nuovi-txt.txt'), output, 'utf8');
    console.log(`[TXT] Inventario salvato: ${items.length} voci potenziali rilevate.`);
    return items;
}

/**
 * Step 3: Confronto e Report
 */
function generateComparisonReport(jsonInventory, txtItems) {
    console.log(`[COMPARE] Analisi collisioni in corso...`);
    
    // Mappa per ricerca rapida (normalizzata)
    const jsonMap = new Map();
    for (const item of jsonInventory) {
        const key = item.name.toLowerCase().trim();
        if (!jsonMap.has(key)) jsonMap.set(key, []);
        jsonMap.get(key).push(item);
    }

    const results = {
        new: [],
        potential: [],
        certain: []
    };

    // Usiamo un set per evitare duplicati identici provenienti dallo stesso file TXT per lo stesso nome
    const seenInTxt = new Set();

    for (const txtItem of txtItems) {
        const key = txtItem.name.toLowerCase().trim();
        const seenKey = `${key}|${txtItem.file}|${txtItem.source}`;
        if (seenInTxt.has(seenKey)) continue;
        seenInTxt.add(seenKey);

        const matches = jsonMap.get(key);

        if (!matches) {
            results.new.push(txtItem);
        } else {
            for (const match of matches) {
                const collision = {
                    name: txtItem.name,
                    jsonPack: match.pack,
                    jsonSource: match.source,
                    txtFile: txtItem.file,
                    txtSource: txtItem.source
                };

                if (match.source === txtItem.source) {
                    results.certain.push(collision);
                } else {
                    results.potential.push(collision);
                }
            }
        }
    }

    // Generazione Markdown
    const date = new Date().toLocaleString();
    let md = `# Report Collisioni Compendio\n`;
    md += `Data: ${date}\n`;
    md += `JSON scansionati: ${jsonInventory.length}\n`;
    md += `TXT scansionati: ${walk(CONFIG.txtRoot, '.txt').length}\n`;
    md += `Voci TXT totali rilevate: ${txtItems.length}\n\n`;
    md += `---\n\n`;

    md += `## ✅ Voci Nuove (${results.new.length})\n`;
    md += `| Nome | File TXT | Sourcebook |\n|---|---|---|\n`;
    results.new.forEach(r => md += `| ${r.name} | ${r.file} | ${r.source} |\n`);
    md += `\n`;

    md += `## ⚠️ Possibili Doppioni (${results.potential.length})\n`;
    md += `| Nome | Pack JSON esistente | Sourcebook JSON | File TXT | Sourcebook TXT |\n|---|---|---|---|---|\n`;
    results.potential.forEach(r => md += `| ${r.name} | ${r.jsonPack} | ${r.jsonSource} | ${r.txtFile} | ${r.txtSource} |\n`);
    md += `\n`;

    md += `## ❌ Doppioni Certi (${results.certain.length})\n`;
    md += `| Nome | Pack JSON esistente | Sourcebook JSON | File TXT | Sourcebook TXT |\n|---|---|---|---|---|\n`;
    results.certain.forEach(r => md += `| ${r.name} | ${r.jsonPack} | ${r.jsonSource} | ${r.txtFile} | ${r.txtSource} |\n`);

    fs.writeFileSync(path.join(CONFIG.reportDir, 'report-collisioni.md'), md, 'utf8');
    
    console.log(`\n--- RIEPILOGO FINALE ---`);
    console.log(`✅ Voci Nuove: ${results.new.length}`);
    console.log(`⚠️ Possibili Doppioni: ${results.potential.length}`);
    console.log(`❌ Doppioni Certi: ${results.certain.length}`);
    console.log(`------------------------\n`);
    console.log(`Report generato in ${path.join(CONFIG.reportDir, 'report-collisioni.md')}`);
}

// Esecuzione
const jsonInv = scanJsonPacks();
const txtInv = scanTxtManuals();
generateComparisonReport(jsonInv, txtInv);
