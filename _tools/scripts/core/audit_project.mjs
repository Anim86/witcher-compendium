// Witcher Compendium Maintenance Tool: Project Audit
// VERSION: 1.0.0
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Analyzes src-packs structure, recently modified files, and consistency between filesystem and module.json definitions.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script's new home in _tools/scripts/core
const REPO_ROOT = path.resolve(__dirname, '../../../');

const CONFIG = {
    srcPacks: path.join(REPO_ROOT, '_tools', 'src-packs'),
    moduleJson: path.join(REPO_ROOT, 'witcher-compendium', 'module.json'),
    reportFile: path.join(REPO_ROOT, '_tools', 'reports', 'stato-attuale-srcpacks.md'),
    sinceDate: new Date('2026-04-06T00:00:00Z') // Audit from this date
};

function walk(dir, fileCallback) {
    if (!fs.existsSync(dir)) return;
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
            
            if (stat.mtime >= CONFIG.sinceDate) {
                data.recent.push({ file: path.basename(filePath), mtime: stat.mtime });
            }

            try {
                let content = fs.readFileSync(filePath, 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const json = JSON.parse(content);
                const sb = json.system?.sourcebook || '??';
                const sbKey = sb.substring(0, 2).toUpperCase();
                data.sourcebooks[sbKey] = (data.sourcebooks[sbKey] || 0) + 1;
            } catch (e) {}
        }
    });
    return folders;
}

function audit() {
    console.log(`🔍 [AUDIT] Analyzing project status...`);
    
    let modulePacks = [];
    try {
        const moduleContent = JSON.parse(fs.readFileSync(CONFIG.moduleJson, 'utf8'));
        modulePacks = moduleContent.packs || [];
    } catch (e) {
        console.error(`❌ [ERR] Cannot read module.json: ${e.message}`);
    }

    const folders = getFoldersWithJson(CONFIG.srcPacks);
    const folderStats = [];
    const recentFiles = [];
    
    folders.forEach((data, dirPath) => {
        const relativeDir = path.relative(CONFIG.srcPacks, dirPath);
        let predominantSb = '??';
        let maxCount = 0;
        for (const [sb, count] of Object.entries(data.sourcebooks)) {
            if (count > maxCount) {
                maxCount = count;
                predominantSb = sb;
            }
        }

        folderStats.push({ path: relativeDir, count: data.count, sb: predominantSb });

        data.recent.forEach(r => {
            recentFiles.push({ file: r.file, mtime: r.mtime.toLocaleString(), pack: relativeDir });
        });
    });

    const srcFolderPaths = Array.from(folders.keys()).map(p => path.relative(CONFIG.srcPacks, p).replace(/\\/g, '/'));
    const modulePackPaths = modulePacks.map(p => p.path.replace('packs/', ''));

    const onlyInModule = modulePacks.filter(p => {
        const pPath = p.path.replace('packs/', '');
        return !srcFolderPaths.some(fp => fp === pPath || fp.startsWith(pPath + '/'));
    });

    const onlyInSrc = srcFolderPaths.filter(fp => {
        return !modulePackPaths.some(mp => mp === fp || fp.startsWith(mp + '/'));
    });

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

    md += `\n## 2. Conteggio Voci per Pack (module.json)\n`;
    md += `| Pack | N. voci | Sourcebook predominante |\n|---|---|---|\n`;
    modulePacks.forEach(p => {
        const pPath = p.path.replace('packs/', '');
        const relatedFolders = folderStats.filter(s => s.path.replace(/\\/g, '/') === pPath || s.path.replace(/\\/g, '/').startsWith(pPath + '/'));
        const totalCount = relatedFolders.reduce((acc, curr) => acc + curr.count, 0);
        const sb = relatedFolders.length > 0 ? relatedFolders[0].sb : '??';
        md += `| ${p.name} | ${totalCount} | ${sb} |\n`;
    });

    md += `\n## 3. Voci Moificate Recenti\n`;
    if (recentFiles.length === 0) {
        md += `Nessuna modifica recente rilevata.\n`;
    } else {
        md += `| File | Data modifica | Pack |\n|---|---|---|\n`;
        recentFiles.sort((a,b) => new Date(b.mtime) - new Date(a.mtime)).forEach(f => {
            md += `| ${f.file} | ${f.mtime} | ${f.pack} |\n`;
        });
    }

    md += `\n## 4. Sincronizzazione module.json\n`;
    if (onlyInModule.length > 0) {
        md += `### Pack orfani in module.json\n`;
        onlyInModule.forEach(p => md += `- ${p.name} (${p.path})\n`);
    } else {
        md += `✅ module.json è sincronizzato con il filesystem.\n`;
    }

    if (!fs.existsSync(path.dirname(CONFIG.reportFile))) fs.mkdirSync(path.dirname(CONFIG.reportFile), { recursive: true });
    fs.writeFileSync(CONFIG.reportFile, md, 'utf8');
    console.log(`✅ [DONE] Report generated in ${CONFIG.reportFile}`);
}

audit();
