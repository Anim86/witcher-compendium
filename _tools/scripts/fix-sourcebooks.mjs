import fs from 'fs';
import path from 'path';

/**
 * Script per la correzione dei campi system.sourcebook nei JSON.
 */

const CONFIG = {
    root: '_tools/src-packs',
    reportFile: '_tools/reports/fix-sourcebook-log.md'
};

const MAPPINGS = {
    path: [
        { pattern: /Tomo Base|src-packs.*MB/i, code: 'MB' },
        { pattern: /Tomo del Caos|src-packs.*TC|[\/\\]trofei[\/\\]/i, code: 'TC' },
        { pattern: /Libro dei Racconti|src-packs.*LR/i, code: 'LR' },
        { pattern: /Diario di un Witcher|src-packs.*DW/i, code: 'DW' }
    ],
    name: {
        'MB': ['GERALT', 'YENNEFER', 'ZOLTAN CHIVAY', 'TRISS MERIGOLD', 'ROCHE', 'IORVETH', 'LETHO', 'DANDELION', 'CADFAN', 'DORMYN', 'DRYSTAN', 'ELGAN'],
        'TC': ['PHILIPPA', 'TISSAIA', 'FRANCESCA', 'FERCART', 'STREGOBOR', 'VILGEFORTZ', 'RIENCE', 'CAHIR', 'FRINGILLA', 'ARTORIUS', 'VIGO', 'BRONWYN', 'ISTREDD', 'KEIRA', 'MARGARITA', 'SILE', 'DORREGARAY', 'XARTHISIUS']
    }
};

function walk(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            files = files.concat(walk(fullPath));
        } else if (file.endsWith('.json')) {
            files.push(fullPath);
        }
    }
    return files;
}

function processFiles() {
    const files = walk(CONFIG.root);
    const logs = {
        caso1: [],
        caso2: [],
        unresolved: []
    };

    console.log(`[FIX] Analisi di ${files.length} file JSON...`);

    for (const filePath of files) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Rileva e rimuovi BOM
        let hasBOM = false;
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
            hasBOM = true;
            modified = true; // Forza riscrittura per rimuovere BOM
        }

        let data;
        try {
            data = JSON.parse(content);
        } catch (e) {
            console.error(`[ERR] Errore parsing ${filePath}: ${e.message}`);
            continue;
        }

        if (!data.system) data.system = {};
        const oldVal = data.system.sourcebook || '';
        const name = (data.name || '').toUpperCase();

        // Caso 1: DJ -> DW
        if (oldVal.startsWith('DJ')) {
            const newVal = oldVal.replace('DJ', 'DW');
            data.system.sourcebook = newVal;
            logs.caso1.push({ file: filePath, old: oldVal, new: newVal });
            modified = true;
        } 
        // Caso 2: ?? o Vuoto
        else if (!oldVal || oldVal === '??') {
            let resolvedCode = null;

            // Priorità 1: Percorso
            const normalizedPath = filePath.replace(/\\/g, '/');
            for (const m of MAPPINGS.path) {
                if (m.pattern.test(normalizedPath)) {
                    resolvedCode = m.code;
                    break;
                }
            }

            // Priorità 2: Nome (se percorso non ha risolto)
            if (!resolvedCode) {
                for (const [code, names] of Object.entries(MAPPINGS.name)) {
                    if (names.some(n => name.includes(n))) {
                        resolvedCode = code;
                        break;
                    }
                }
            }

            if (resolvedCode) {
                data.system.sourcebook = resolvedCode;
                logs.caso2.push({ file: filePath, name: data.name, old: oldVal || '(vuoto)', new: resolvedCode });
                modified = true;
            } else {
                logs.unresolved.push({ file: filePath, name: data.name, reason: 'Nessun match percorso o nome' });
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        }
    }

    generateLogFile(logs);
}

function generateLogFile(logs) {
    const date = new Date().toLocaleString();
    let md = `# Fix Sourcebook Log\n`;
    md += `Data: ${date}\n\n`;

    md += `## Caso 1 — DJ → DW (${logs.caso1.length})\n`;
    md += `| File | Vecchio valore | Nuovo valore |\n|---|---|---|\n`;
    logs.caso1.forEach(l => md += `| ${l.file} | ${l.old} | ${l.new} |\n`);
    md += `\n`;

    md += `## Caso 2 — ?? → sourcebook (${logs.caso2.length})\n`;
    md += `| File | Nome voce | Vecchio valore | Nuovo valore |\n|---|---|---|---|\n`;
    logs.caso2.forEach(l => md += `| ${l.file} | ${l.name} | ${l.old} | ${l.new} |\n`);
    md += `\n`;

    md += `## Non risolti (sourcebook ancora ??) (${logs.unresolved.length})\n`;
    md += `| File | Nome voce | Motivo |\n|---|---|---|\n`;
    logs.unresolved.forEach(l => md += `| ${l.file} | ${l.name} | ${l.reason} |\n`);

    fs.writeFileSync(CONFIG.reportFile, md, 'utf8');
    console.log(`[DONE] Fix completato. Log generato in ${CONFIG.reportFile}`);
    console.log(`Riepilogo: DJ->DW (${logs.caso1.length}), Mapping (${logs.caso2.length}), Unresolved (${logs.unresolved.length})`);
}

processFiles();
