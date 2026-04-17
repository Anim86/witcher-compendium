import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_PACKS_DIR = path.join(REPO_ROOT, '_tools/src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');
const REPORT_FILE = path.join(REPO_ROOT, '_tools/reports/missing-assets.md');

/**
 * Recursively gets all JSON files in a directory
 */
function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.json')) {
            results.push(file);
        }
    });
    return results;
}

function runAssetGuard() {
    console.log('🛡️  ASSET GUARD: Starting scan...');
    
    const jsonFiles = getFiles(SRC_PACKS_DIR);
    const results = {
        total: jsonFiles.length,
        missing: [],
        placeholders: [],
        ok: 0
    };

    jsonFiles.forEach(fpath => {
        try {
            let content = fs.readFileSync(fpath, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            const data = JSON.parse(content);
            
            const imgPath = data.img || '';
            const relPath = path.relative(SRC_PACKS_DIR, fpath);
            
            // 1. Check if it's a known placeholder or system icon
            if (!imgPath || imgPath.includes('icons/svg/') || imgPath.includes('mystery-man') || imgPath.includes('item-bag')) {
                results.placeholders.push({ file: relPath, name: data.name, current: imgPath });
                return;
            }

            // 2. Check if the asset exists
            // Expected format: modules/witcher-compendium/assets/relative/path/image.webp
            if (imgPath.startsWith('modules/witcher-compendium/assets/')) {
                const assetRelPath = imgPath.replace('modules/witcher-compendium/assets/', '');
                const assetAbsPath = path.join(ASSETS_ROOT, assetRelPath);
                
                if (!fs.existsSync(assetAbsPath)) {
                    results.missing.push({ file: relPath, name: data.name, expected: assetRelPath });
                } else {
                    results.ok++;
                }
            } else {
                // Not pointing to module assets
                results.missing.push({ file: relPath, name: data.name, expected: 'Manca prefisso assets/' });
            }
            
        } catch (e) {
            console.error(`❌ Error parsing ${fpath}: ${e.message}`);
        }
    });

    generateReport(results);
}

function generateReport(results) {
    let md = `# 🛡️ Asset Guard - Report Iconografia\n`;
    md += `Data Scansione: ${new Date().toLocaleString()}\n\n`;
    
    md += `## 📊 Riepilogo\n`;
    md += `- **Totale Voci**: ${results.total}\n`;
    md += `- **Asset Corretti**: ${results.ok}\n`;
    md += `- **Asset Mancanti**: ${results.missing.length}\n`;
    md += `- **Placeholder/System Icons**: ${results.placeholders.length}\n\n`;

    if (results.missing.length > 0) {
        md += `## ❌ Asset Mancanti (File non trovato in assets/)\n`;
        md += `| Nome | File JSON | Percorso Atteso |\n|---|---|---|\n`;
        results.missing.sort((a,b) => a.file.localeCompare(b.file)).forEach(m => {
            md += `| ${m.name} | ${m.file} | ${m.expected} |\n`;
        });
        md += `\n`;
    }

    if (results.placeholders.length > 0) {
        md += `## ⚠️ Placeholder o Icone di Sistema\n`;
        md += `Voci che usano icone generiche di Foundry e richiedono un'immagine personalizzata.\n\n`;
        md += `| Nome | File JSON | Icona Corrente |\n|---|---|---|\n`;
        results.placeholders.sort((a,b) => a.file.localeCompare(b.file)).forEach(p => {
            md += `| ${p.name} | ${p.file} | ${p.current} |\n`;
        });
    }

    if (!fs.existsSync(path.dirname(REPORT_FILE))) fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
    fs.writeFileSync(REPORT_FILE, md, 'utf8');
    
    console.log(`\n✅ Scan completato! Report generato in: ${REPORT_FILE}`);
    console.log(`- OK: ${results.ok}`);
    console.log(`- Mancanti: ${results.missing.length}`);
    console.log(`- Placeholder: ${results.placeholders.length}`);
}

runAssetGuard();
