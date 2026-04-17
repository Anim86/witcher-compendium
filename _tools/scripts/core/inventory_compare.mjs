// Witcher Compendium Maintenance Tool: Inventory & Comparison
// VERSION: 1.0.0
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Scans JSON packs and source book text files to identify missing entries or naming collisions.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script's new home in _tools/scripts/core
const REPO_ROOT = path.resolve(__dirname, '../../../');

const CONFIG = {
    jsonRoot: path.join(REPO_ROOT, '_tools', 'src-packs'),
    txtRoot: path.join(REPO_ROOT, 'Manuali'),
    reportDir: path.join(REPO_ROOT, '_tools', 'reports'),
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

function walk(dir, extension = '.json') {
    let files = [];
    if (!fs.existsSync(dir)) return files;
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

function scanJsonPacks() {
    console.log(`🔍 [JSON] Scanning packs in ${CONFIG.jsonRoot}...`);
    const jsonFiles = walk(CONFIG.jsonRoot, '.json');
    const inventory = [];

    for (const filePath of jsonFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
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
            console.error(`❌ [JSON] Error parsing ${filePath}: ${e.message}`);
        }
    }

    if (!fs.existsSync(CONFIG.reportDir)) fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    const output = inventory.map(item => `${item.name} | ${item.pack} | ${item.source}`).join('\n');
    fs.writeFileSync(path.join(CONFIG.reportDir, 'inventario-esistente.txt'), output, 'utf8');
    console.log(`   ✅ JSON Inventory saved: ${inventory.length} entries.`);
    return inventory;
}

function scanTxtManuals() {
    console.log(`🔍 [TXT] Scanning manuals in ${CONFIG.txtRoot}...`);
    const txtFiles = walk(CONFIG.txtRoot, '.txt');
    const items = [];
    const pageItemRegex = /^\d{1,3}\s+([A-ZÀÈÌÒÙ\s]{3,60})$/;

    for (const filePath of txtFiles) {
        if (!fs.existsSync(filePath)) continue;
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        const fileName = path.basename(filePath);
        
        let source = '??';
        const parts = filePath.split(path.sep);
        // Look for sourcebook in path parts
        for (const part of parts) {
            if (SOURCEBOOK_MAP[part]) {
                source = SOURCEBOOK_MAP[part];
                break;
            }
        }

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            let detectedName = null;
            const matchPage = line.match(pageItemRegex);
            if (matchPage) {
                detectedName = matchPage[1].trim();
            } else if (line === line.toUpperCase() && line.length >= 3 && line.length <= 60 && /[A-Z]/.test(line)) {
                detectedName = line;
            }

            if (detectedName) {
                const upperName = detectedName.toUpperCase();
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
    console.log(`   ✅ TXT Inventory saved: ${items.length} potential entries.`);
    return items;
}

function generateComparisonReport(jsonInventory, txtItems) {
    console.log(`🚀 [COMPARE] Generating collision report...`);
    
    const jsonMap = new Map();
    for (const item of jsonInventory) {
        const key = item.name.toLowerCase().trim();
        if (!jsonMap.has(key)) jsonMap.set(key, []);
        jsonMap.get(key).push(item);
    }

    const results = { new: [], potential: [], certain: [] };
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

    const date = new Date().toLocaleString();
    let md = `# Report Collisioni Compendio\n`;
    md += `Data: ${date}\n\n`;
    md += `## ✅ Voci Nuove (${results.new.length})\n`;
    md += `| Nome | File TXT | Sourcebook |\n|---|---|---|\n`;
    results.new.forEach(r => md += `| ${r.name} | ${r.file} | ${r.source} |\n`);
    md += `\n## ⚠️ Possibili Doppioni (${results.potential.length})\n`;
    md += `| Nome | Pack JSON esistente | Sourcebook JSON | File TXT | Sourcebook TXT |\n|---|---|---|---|---|\n`;
    results.potential.forEach(r => md += `| ${r.name} | ${r.jsonPack} | ${r.jsonSource} | ${r.txtFile} | ${r.txtSource} |\n`);
    md += `\n## ❌ Doppioni Certi (${results.certain.length})\n`;
    md += `| Nome | Pack JSON esistente | Sourcebook JSON | File TXT | Sourcebook TXT |\n|---|---|---|---|---|\n`;
    results.certain.forEach(r => md += `| ${r.name} | ${r.jsonPack} | ${r.jsonSource} | ${r.txtFile} | ${r.txtSource} |\n`);

    const reportPath = path.join(CONFIG.reportDir, 'report-collisioni.md');
    fs.writeFileSync(reportPath, md, 'utf8');
    console.log(`✅ Final report generated in ${reportPath}`);
}

const jsonInv = scanJsonPacks();
const txtInv = scanTxtManuals();
generateComparisonReport(jsonInv, txtInv);
