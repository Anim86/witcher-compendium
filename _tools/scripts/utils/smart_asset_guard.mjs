import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_PACKS_DIR = path.join(REPO_ROOT, '_tools/src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');
const REPORT_FILE = path.join(REPO_ROOT, '_tools/reports/smart-missing-assets.md');
const IS_FIX_MODE = process.argv.includes('--fix');

import { slugify, getFiles } from '../core/utils.mjs';

/**
 * Old normalization logic (removes apostrophes).
 * Used to detect legacy files that need renaming.
 */
function legacySlugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^\w-]+/g, '')
        .replace(/__+/g, '_')
        .replace(/^_|_$/g, '');
}

function runSmartGuard() {
    console.log("🛡️  SMART ASSET GUARD: Starting scan...");
    
    // 1. Build Asset Maps
    const allAssets = getFiles(ASSETS_ROOT).filter(f => f.match(/\.(webp|png|jpg)$/i));
    const assetMap = new Map(); // slug -> relative_path
    const legacyAssetMap = new Map(); // legacy_slug -> relative_path
    const filenameMap = new Map(); // filename.webp -> relative_path

    allAssets.forEach(fullPath => {
        const rel = path.relative(ASSETS_ROOT, fullPath).replace(/\\/g, '/');
        const filename = path.basename(fullPath);
        const base = path.basename(filename, path.extname(filename));
        
        assetMap.set(slugify(base), rel);
        legacyAssetMap.set(legacySlugify(base), rel);
        filenameMap.set(filename.toLowerCase(), rel);
    });

    console.log(`Mapped ${allAssets.length} assets.`);

    // 2. Audit JSONs
    const jsonFiles = getFiles(SRC_PACKS_DIR).filter(f => f.endsWith('.json'));
    const results = {
        total: 0,
        ok: [],
        mismatch: [],
        missing: []
    };

    jsonFiles.forEach(fpath => {
        try {
            let content = fs.readFileSync(fpath, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            const data = JSON.parse(content);
            results.total++;

            const itemName = data.name;
            const currentImg = data.img || "";
            const idealSlug = slugify(itemName);
            const legacySlug = legacySlugify(itemName);
            const relJsonDir = path.dirname(path.relative(SRC_PACKS_DIR, fpath)).replace(/\\/g, '/');
            const expectedRelPath = `${relJsonDir}/${idealSlug}.webp`;
            
            // Skip placeholders
            if (!currentImg || currentImg.includes('mystery-man') || currentImg.includes('item-bag')) {
                results.missing.push({ name: itemName, file: fpath, reason: "Placeholder" });
                return;
            }

            const assetRelPath = currentImg.replace("modules/witcher-compendium/assets/", "");
            const assetAbsPath = path.join(ASSETS_ROOT, assetRelPath);

            // Case 1: Direct Match (File exists at the path specified in JSON)
            if (fs.existsSync(assetAbsPath)) {
                results.ok.push({ name: itemName });
                return;
            }

            // If not found, try fuzzy/slugify logic

            // Case 2: File exists with IDEAL slug but path in JSON is wrong
            if (assetMap.has(idealSlug)) {
                const suggested = "modules/witcher-compendium/assets/" + assetMap.get(idealSlug);
                results.mismatch.push({
                    name: itemName,
                    file: fpath,
                    current: currentImg,
                    suggested: suggested,
                    reason: "Percorso JSON non allineato (File trovato con slugify)"
                });
                if (IS_FIX_MODE) updateJsonImg(fpath, data, suggested);
            }
            // Case 3: File exists with LEGACY slug (needs renaming)
            else if (assetMap.has(legacySlug) || legacyAssetMap.has(legacySlug)) {
                const foundRel = assetMap.get(legacySlug) || legacyAssetMap.get(legacySlug);
                const oldAbsPath = path.join(ASSETS_ROOT, foundRel);
                const newRelPath = relJsonDir + "/" + idealSlug + ".webp";
                const newAbsPath = path.join(ASSETS_ROOT, newRelPath);
                const suggested = "modules/witcher-compendium/assets/" + newRelPath;

                results.mismatch.push({
                    name: itemName,
                    file: fpath,
                    current: currentImg,
                    suggested: suggested,
                    reason: `Naming Legacy (${path.basename(foundRel)}). Rinominare in ${idealSlug}.webp`
                });

                if (IS_FIX_MODE) {
                    if (fs.existsSync(oldAbsPath) && !fs.existsSync(newAbsPath)) {
                        fs.renameSync(oldAbsPath, newAbsPath);
                        console.log(`Renamed: ${path.basename(oldAbsPath)} -> ${path.basename(newAbsPath)}`);
                    }
                    updateJsonImg(fpath, data, suggested);
                }
            }
            // Case 4: File found by exact filename but in wrong category
            else if (filenameMap.has(idealSlug + ".webp")) {
                const suggested = "modules/witcher-compendium/assets/" + filenameMap.get(idealSlug + ".webp");
                results.mismatch.push({
                    name: itemName,
                    file: fpath,
                    current: currentImg,
                    suggested: suggested,
                    reason: "Asset trovato in altra categoria"
                });
                if (IS_FIX_MODE) updateJsonImg(fpath, data, suggested);
            }
            // Case 5: Truly Missing
            else {
                results.missing.push({
                    name: itemName,
                    file: fpath,
                    reason: "Truly Missing",
                    expected: expectedRelPath
                });
            }

        } catch (e) {
            console.error(`Error parsing ${fpath}: ${e.message}`);
        }
    });

    generateReport(results);
}

function updateJsonImg(fpath, data, newImgPath) {
    try {
        data.img = newImgPath;
        fs.writeFileSync(fpath, JSON.stringify(data, null, 4), 'utf8');
    } catch (e) {
        console.error(`Failed to update JSON ${fpath}: ${e.message}`);
    }
}

function generateReport(results) {
    let md = `# 🛡️ Smart Asset Guard - Report Iconografia\n`;
    md += `Data Scansione: ${new Date().toLocaleString()}\n\n`;
    
    md += `## 📊 Riepilogo\n`;
    md += `- **Totale Voci Analizzate**: ${results.total}\n`;
    md += `- **Asset Corretti**: ${results.ok.length}\n`;
    md += `- **Asset con Mismatch (Legacy/Path)**: ${results.mismatch.length}\n`;
    md += `- **Asset Mancanti**: ${results.missing.length}\n\n`;

    md += `> [!IMPORTANT]\n`;
    md += `> Lo standard per i caratteri speciali (apostrofi, parentesi, due punti) è la sostituzione con l'underscore: \`Spada d'Argento\` -> \`spada_d_argento.webp\`.\n\n`;

    if (results.mismatch.length > 0) {
        md += `## ⚠️ Asset con Mismatch (Azione Richiesta)\n`;
        md += `| Nome | Motivo | Percorso Attuale | Suggerimento |\n|---|---|---|---|\n`;
        results.mismatch.forEach(m => {
            const relFile = path.relative(REPO_ROOT, m.file);
            md += `| ${m.name} | ${m.reason} | \`${m.current}\` | \`${m.suggested}\` |\n`;
        });
        md += `\n`;
    }

    if (results.missing.length > 0) {
        md += `## ❌ Asset Totalmente Mancanti\n`;
        md += `| Nome | File JSON | Percorso Atteso |\n|---|---|---|\n`;
        results.missing.forEach(m => {
            const relFile = path.relative(REPO_ROOT, m.file);
            md += `| ${m.name} | ${relFile} | \`${m.expected || m.reason}\` |\n`;
        });
    }

    fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
    fs.writeFileSync(REPORT_FILE, md, 'utf8');
    console.log(`✅ Report generato: ${REPORT_FILE}`);
}

runSmartGuard();
