import fs from 'fs';
import path from 'path';

/**
 * Script per l'audit completo dello stato del progetto (src-packs).
 */

const CONFIG = {
    srcPacks: '_tools/src-packs',
    moduleJson: 'witcher-compendium/module.json',
    reportFile: '_tools/reports/stato-attuale-srcpacks.md',
    sinceDate: new Date('2026-04-06T00:00:00Z')
};

function walk(dir, fileCallback) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath, fileCallback);
        } else {
            fileCallback(fullPath, stat);
        }
    }
}

function getFoldersWithJson(root) {
    const folders = new Map();
    walk(root, (filePath, stat) => {
        if (filePath.endsWith('.json')) {
            const dirPath = path.dirname(filePath);
            if (!folders.has(dirPath)) {
                folders.set(dirPath, { count: 0, sourcebooks: {}, recent: [] });
            }
            const data = folders.get(dirPath);
            data.count++;
            
            // Check recently modified
            if (stat.mtime >= CONFIG.sinceDate) {
                data.recent.push({ file: path.basename(filePath), mtime: stat.mtime });
            }

            // Extract sourcebook
            try {
                let content = fs.readFileSync(filePath, 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const json = JSON.parse(content);
                const sb = json.system?.sourcebook || '??';
                // Normalizza (prendi solo le prime 2 lettere se possibile per matching predominante)
                const sbKey = sb.substring(0, 2).toUpperCase();
                data.sourcebooks[sbKey] = (data.sourcebooks[sbKey] || 0) + 1;
            } catch (e) {
                // Ignore parsing errors for empty/truncated files
            }
        }
    });
    return folders;
}

function audit() {
    console.log(`[AUDIT] Analisi in corso...`);
    
    // 1. Leggi module.json
    let modulePacks = [];
    try {
        const moduleContent = JSON.parse(fs.readFileSync(CONFIG.moduleJson, 'utf8'));
        modulePacks = moduleContent.packs || [];
    } catch (e) {
        console.error(`[ERR] Impossibile leggere module.json: ${e.message}`);
    }

    // 2. Scansiona cartelle
    const folders = getFoldersWithJson(CONFIG.srcPacks);
    
    // 3. Elabora dati
    const folderStats = [];
    const recentFiles = [];
    const packStats = [];
    
    folders.forEach((data, dirPath) => {
        const relativeDir = path.relative(CONFIG.srcPacks, dirPath);
        
        // Determina sourcebook predominante
        let predominantSb = '??';
        let maxCount = 0;
        for (const [sb, count] of Object.entries(data.sourcebooks)) {
            if (count > maxCount) {
                maxCount = count;
                predominantSb = sb;
            }
        }

        folderStats.push({
            path: relativeDir,
            count: data.count,
            sb: predominantSb
        });

        data.recent.forEach(r => {
            recentFiles.push({
                file: r.file,
                mtime: r.mtime.toLocaleString(),
                pack: relativeDir
            });
        });
    });

    // Sync check
    const srcFolderPaths = Array.from(folders.keys()).map(p => path.relative(CONFIG.srcPacks, p).replace(/\\/g, '/'));
    const modulePackPaths = modulePacks.map(p => p.path.replace('packs/', ''));

    const onlyInModule = modulePacks.filter(p => {
        const pPath = p.path.replace('packs/', '');
        return !srcFolderPaths.some(fp => fp === pPath || fp.startsWith(pPath + '/'));
    });

    const onlyInSrc = srcFolderPaths.filter(fp => {
        return !modulePackPaths.some(mp => mp === fp || fp.startsWith(mp + '/'));
    });

    // 4. Genera Report
    generateReport(folderStats, recentFiles, modulePacks, onlyInModule, onlyInSrc);
}

function generateReport(folderStats, recentFiles, modulePacks, onlyInModule, onlyInSrc) {
    let md = `# Stato Attuale src-packs\n`;
    md += `Data Audit: ${new Date().toLocaleString()}\n\n`;

    md += `## 1. Struttura Cartelle\n`;
    md += `| Cartella | File JSON | Sourcebook Predom. |\n|---|---|---|\n`;
    folderStats.sort((a,b) => a.path.localeCompare(b.path)).forEach(s => {
        md += `| ${s.path} | ${s.count} | ${s.sb} |\n`;
    });
    md += `\n`;

    md += `## 2. Conteggio Voci per Pack (module.json)\n`;
    md += `| Pack | N. voci | Sourcebook predominante |\n|---|---|---|\n`;
    modulePacks.forEach(p => {
        const pPath = p.path.replace('packs/', '');
        // Trova tutte le cartelle in src che iniziano con questo percorso
        const relatedFolders = folderStats.filter(s => s.path.replace(/\\/g, '/') === pPath || s.path.replace(/\\/g, '/').startsWith(pPath + '/'));
        const totalCount = relatedFolders.reduce((acc, curr) => acc + curr.count, 0);
        // Per il sourcebook predominante del pack, prendiamo quello della cartella principale o la prima trovata
        const sb = relatedFolders.length > 0 ? relatedFolders[0].sb : '??';
        md += `| ${p.name} | ${totalCount} | ${sb} |\n`;
    });
    md += `\n`;

    md += `## 3. Voci Aggiunte o Modificate di Recente (dal 6 Aprile)\n`;
    if (recentFiles.length === 0) {
        md += `Nessuna modifica recente rilevata.\n`;
    } else {
        md += `Totale modifiche: ${recentFiles.length}\n\n`;
        md += `| File | Data modifica | Pack |\n|---|---|---|\n`;
        recentFiles.sort((a,b) => new Date(b.mtime) - new Date(a.mtime)).forEach(f => {
            md += `| ${f.file} | ${f.mtime} | ${f.pack} |\n`;
        });
    }
    md += `\n`;

    md += `## 4. Sincronizzazione module.json vs src-packs\n`;
    md += `### Pack registrati in module.json MA assenti o vuoti in src-packs\n`;
    if (onlyInModule.length === 0) {
        md += `✅ Tutti i pack in module.json hanno sorgenti corrispondenti.\n`;
    } else {
        md += `| Pack | Percorso previsto |\n|---|---|\n`;
        onlyInModule.forEach(p => md += `| ${p.name} | ${p.path} |\n`);
    }
    md += `\n`;

    md += `### Cartelle in src-packs NON registrate in module.json\n`;
    if (onlyInSrc.length === 0) {
        md += `✅ Tutte le cartelle sorgente sono mappate in module.json.\n`;
    } else {
        md += `| Percorso cartella | Note |\n|---|---|\n`;
        onlyInSrc.forEach(fp => md += `| ${fp} | Da verificare se pack mancante o cartella di servizio |\n`);
    }

    fs.writeFileSync(CONFIG.reportFile, md, 'utf8');
    console.log(`[DONE] Report generato in ${CONFIG.reportFile}`);
}

audit();
