import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../');
const SRC_DIR = path.join(REPO_ROOT, '_tools/src-packs/EQUIPAGGIAMENTO/witcher-equipment');
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment');
const BACKUP_EQUIP_DIR = path.join(REPO_ROOT, 'backup_images/witcher-equipment');
const BACKUP_ORPHANS_DIR = path.join(REPO_ROOT, 'backup_images/_review_orphans');
const REPORT_PATH = path.join(REPO_ROOT, 'TO DO/report_oggetti_vari_asset.md');

// Helper to compute MD5 hash of a file
function getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        const buffer = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(buffer).digest('hex');
    } catch (e) {
        return null;
    }
}

// Slugify function matching Witcher standard
function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['"«»„“”]/g, '_')
        .replace(/[^\w\s-]/g, '_')
        .replace(/[-\s]+/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_|_$/g, '');
}

async function run() {
    console.log("🔍 Running Equipment & Backup Audit...");
    
    // 1. Gather all JSON files
    const jsonFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON sources in ${SRC_DIR}`);
    
    // 2. Gather all existing assets and their hashes
    const existingAssets = {};
    if (fs.existsSync(ASSETS_DIR)) {
        const files = fs.readdirSync(ASSETS_DIR).filter(f => f.match(/\.(webp|png|jpg)$/i));
        files.forEach(file => {
            const fullPath = path.join(ASSETS_DIR, file);
            const hash = getFileHash(fullPath);
            const size = fs.statSync(fullPath).size;
            existingAssets[file] = { path: fullPath, hash, size };
        });
    }
    console.log(`Mapped ${Object.keys(existingAssets).length} existing assets on disk.`);
    
    // 3. Gather backup files
    const backupsEquip = fs.existsSync(BACKUP_EQUIP_DIR) ? fs.readdirSync(BACKUP_EQUIP_DIR) : [];
    const backupsOrphans = fs.existsSync(BACKUP_ORPHANS_DIR) ? fs.readdirSync(BACKUP_ORPHANS_DIR) : [];
    
    console.log(`Found ${backupsEquip.length} backup files in backup_images/witcher-equipment/`);
    console.log(`Found ${backupsOrphans.length} backup files in backup_images/_review_orphans/`);
    
    // Create backup maps by slugified base name (without extension)
    const backupMap = new Map();
    backupsEquip.forEach(file => {
        const base = path.basename(file, path.extname(file));
        const slug = slugify(base);
        backupMap.set(slug, { source: 'backup_images/witcher-equipment', file });
    });
    
    backupsOrphans.forEach(file => {
        const base = path.basename(file, path.extname(file));
        const slug = slugify(base);
        // Overwrite or append, let's keep track of all potential
        if (!backupMap.has(slug)) {
            backupMap.set(slug, { source: 'backup_images/_review_orphans', file });
        }
    });

    // 4. Map deleted files from git history
    // candele_5.webp, picchetti_5.webp, razioni_da_viaggio.webp were deleted in commit 4e1bd684
    const gitDeleted = {
        'candele_5.webp': { commit: '4e1bd684', reason: 'Moved to temp_images' },
        'picchetti_5.webp': { commit: '4e1bd684', reason: 'Moved to temp_images' },
        'razioni_da_viaggio.webp': { commit: '4e1bd684', reason: 'Moved to temp_images' }
    };

    // 5. Analyze each item
    const items = [];
    const hashGroups = {}; // hash -> Array of assets sharing this image
    
    jsonFiles.forEach(jsonFile => {
        const jsonPath = path.join(SRC_DIR, jsonFile);
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        const name = data.name;
        const img = data.img || "";
        const filename = img ? path.basename(img) : "";
        const slug = slugify(name);
        
        // Find if file exists
        const assetInfo = existingAssets[filename] || null;
        let fileExists = assetInfo !== null;
        let fileHash = assetInfo ? assetInfo.hash : null;
        let fileSize = assetInfo ? assetInfo.size : 0;
        
        // Check if there is a backup candidate
        let backupCandidate = null;
        if (backupMap.has(slug)) {
            backupCandidate = backupMap.get(slug);
        } else {
            // Fuzzy search by slug inside backup names
            for (let [bSlug, bInfo] of backupMap.entries()) {
                if (bSlug.includes(slug) || slug.includes(bSlug)) {
                    backupCandidate = bInfo;
                    break;
                }
            }
        }
        
        // Check if in git deleted list
        let isGitDeleted = gitDeleted[filename] || null;
        
        const itemInfo = {
            name,
            img,
            filename,
            slug,
            fileExists,
            fileHash,
            fileSize,
            backupCandidate,
            isGitDeleted,
            jsonFile
        };
        
        items.push(itemInfo);
        
        if (fileExists && fileHash) {
            if (!hashGroups[fileHash]) {
                hashGroups[fileHash] = [];
            }
            hashGroups[fileHash].push(itemInfo);
        }
    });
    
    // Sort items alphabetically by name
    items.sort((a, b) => a.name.localeCompare(b.name));
    
    // Identify placeholder duplicate groups
    // A group is a placeholder duplicate if it contains multiple distinct files having the same hash.
    // Let's filter hashGroups that have length > 1
    const duplicateGroups = Object.entries(hashGroups)
        .filter(([hash, list]) => list.length > 1)
        .map(([hash, list]) => {
            // Find distinct filenames
            const filenames = [...new Set(list.map(i => i.filename))];
            const itemNames = list.map(i => i.name);
            const sample = list[0];
            return {
                hash,
                sizeBytes: sample.fileSize,
                sizeKb: (sample.fileSize / 1024).toFixed(1) + " KB",
                filenames,
                items: itemNames,
                exampleFilename: sample.filename
            };
        });
        
    // Sort duplicate groups by number of items descending
    duplicateGroups.sort((a, b) => b.items.length - a.items.length);
    
    // 6. Generate the Markdown report
    let md = `# 📊 REPORT OGGETTI VARI - ICONOGRAFIA & ASSET AUDIT\n\n`;
    md += `Questo report contiene l'audit completo delle immagini del compendio **Oggetti Vari (witcher-equipment)**. L'obiettivo è tracciare lo stato delle icone, identificare le immagini duplicate/placeholder byte-per-byte, trovare i candidati di ripristino nei backup ed elencare i file precedentemente rimossi o riorganizzati.\n\n`;
    
    md += `## 📈 Riepilogo Statistiche\n`;
    md += `- **Totale Oggetti Vari**: ${items.length}\n`;
    md += `- **Immagini Presenti su Disco**: ${items.filter(i => i.fileExists).length}\n`;
    md += `- **Immagini Mancanti / Solo in Git**: ${items.filter(i => !i.fileExists).length}\n`;
    md += `- **Gruppi di Immagini Duplicate (Byte-by-Byte)**: ${duplicateGroups.length}\n`;
    md += `- **Candidati di Ripristino Disponibili nei Backup**: ${items.filter(i => i.backupCandidate).length} oggetti\n\n`;
    
    md += `---\n\n`;
    
    md += `## 🔄 1. IMPOSTAZIONE E STORIA DELEZIONI (Audit Git History)\n`;
    md += `> [!IMPORTANT]\n`;
    md += `> Nel commit **\`4e1bd684\`** ("*Optimize assets: moved 116 unreferenced images to temp_images for review and updated path consistency*"), sono state eseguite pulizie per rimuovere le immagini non referenziate direttamente.\n`;
    md += `> Tra queste, sono state rimosse 3 immagini nella cartella \`witcher-equipment\`:\n`;
    md += `> 1. **\`candele_5.webp\`** (Associato a *Candele (x5)* o simili)\n`;
    md += `> 2. **\`picchetti_5.webp\`** (Associato a *Picchetti (x5)* o simili)\n`;
    md += `> 3. **\`razioni_da_viaggio.webp\`** (Associato a *Razioni da Viaggio (1 giorno)*)\n`;
    md += `> \n`;
    md += `> **Nota di Ripristino**: Molti di questi asset grezzi originali ad alta risoluzione (come PNG) sono ancora conservati nelle cartelle di backup: \`backup_images/witcher-equipment/\` e \`backup_images/_review_orphans/\` e possono essere rigenerati/riconvertiti in WebP a 512px in modo pulito.\n\n`;
    
    md += `---\n\n`;
    
    md += `## 👥 2. GRUPPI DI IMMAGINI DUPLICATE (Identiche Byte-per-Byte)\n`;
    md += `Molti oggetti condividono lo stesso identico file immagine binario (stesso hash MD5, stesso contenuto). Questa tabella raggruppa le immagini duplicate per identificare i "placeholder" comuni che richiedono icone uniche.\n\n`;
    
    md += `| Gruppo / Hash MD5 | Dimensione | Esempio File | Oggetti Condivisi (\`tenda\`, \`sapone\`, ecc.) |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    
    duplicateGroups.forEach((g, idx) => {
        md += `| **Gruppo ${idx + 1}** (\`${g.hash.substring(0, 8)}\`) | ${g.sizeKb} | \`${g.exampleFilename}\` | ${g.items.map(name => `**${name}**`).join(', ')} |\n`;
    });
    
    md += `\n*Nota: I gruppi con dimensioni ridotte (es. ~15 KB) sono quasi certamente placeholder o immagini generiche usate per riempire i vuoti.*\n\n`;
    
    md += `---\n\n`;
    
    md += `## 📋 3. TABELLA DI AUDIT COMPLETO (152 Asset)\n`;
    md += `La tabella seguente elenca tutti i **152 oggetti vari**, la loro immagine attuale, lo stato del file su disco, e la presenza di un'immagine sostitutiva/ripristinabile nel backup.\n\n`;
    
    md += `| Nome Asset | Path Immagine | Nome File | Stato su Disco | Hash MD5 (Fuzzy) | Candidato in Backup / Azione |\n`;
    md += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;
    
    items.forEach(i => {
        const discoStatus = i.fileExists ? "✅ Presente" : "❌ Mancante";
        const hashDisplay = i.fileHash ? `\`${i.fileHash.substring(0, 8)}\`` : "-";
        
        let backupDisplay = "-";
        if (i.backupCandidate) {
            backupDisplay = `♻️ Ripristinabile da \`${i.backupCandidate.source}/${i.backupCandidate.file}\``;
        } else if (i.isGitDeleted) {
            backupDisplay = `⚠️ Eliminato in commit ${i.isGitDeleted.commit} (${i.isGitDeleted.reason})`;
        } else if (i.fileExists) {
            // Check if it's a known duplicate group
            const duplicate = duplicateGroups.find(dg => dg.filenames.includes(i.filename));
            if (duplicate) {
                backupDisplay = `👥 Condiviso (Gruppo di duplicate)`;
            } else {
                backupDisplay = "🆗 Icona Unica";
            }
        } else {
            backupDisplay = "🔍 Nessun Backup - Da Generare AI";
        }
        
        md += `| **${i.name}** | \`${i.img}\` | \`${i.filename || "-"}\` | ${discoStatus} | ${hashDisplay} | ${backupDisplay} |\n`;
    });
    
    md += `\n\n## 🛠️ 4. ACCOPPIAMENTI SPECIFICI DI DUPLICATI & DETTAGLI\n`;
    md += `Ecco un approfondimento sui duplicati più emblematici segnalati:\n\n`;
    md += `1. **Tenda & Tenda Grande**: Entrambi usano \`tenda.webp\` (oppure \`tenda_grande.webp\` che ha lo stesso hash). Hanno l'identico file da **18.2 KB** (Gruppo Placeholder A), condiviso anche con \`stallaggio.webp\`, \`stanza_in_locanda_d_alta_classe.webp\`, \`stanza_in_locanda_economica.webp\`, \`stanza_in_locanda_malfamata.webp\`, \`stanza_in_locanda_media.webp\`.\n`;
    md += `2. **Strumenti da Lavoro e Pipa (Placeholder B, 14 File)**: Condividono lo stesso file da **15.2 KB**. Include \`cote_nanica.webp\`, \`kit_per_il_camuffamento.webp\`, \`kit_per_il_trucco.webp\`, \`lavanderia.webp\`, \`manette.webp\`, \`pipa.webp\`, \`profumo_acqua_di_colonia.webp\`, \`sapone.webp\`, \`specchietto.webp\`, \`strumenti_chirurgici.webp\`, \`strumenti_per_le_belle_arti.webp\`, \`tabacco.webp\`, \`utensili_da_armaiolo.webp\`, \`utensili_da_cucina.webp\`.\n`;
    md += `3. **Gwent, Fischietto, Prostituta (Placeholder C, 7 File)**: Condividono lo stesso file da **15.0 KB**. Include \`coppia_di_puntelli.webp\`, \`corno_da_segnalazione.webp\`, \`fischietto_da_segnalazione.webp\`, \`mazzo_di_gwent.webp\`, \`paglia_sul_pavimento.webp\`, \`prostituta.webp\`, \`telecomunicatore.webp\`.\n`;
    md += `4. **Mappa, Traversata, Messaggero (Placeholder D, 4 File)**: Condividono lo stesso file da **14.4 KB**. Include \`mappa_del_continente.webp\`, \`messaggero.webp\`, \`pedaggio_di_accesso.webp\`, \`traversata_per_mare.webp\`.\n`;
    md += `5. **Sacca, Sacco, Scrigno (Placeholder E, 3 File)**: Condividono lo stesso file da **11.1 KB**. Include \`sacca_da_viaggio.webp\`, \`sacco.webp\`, \`scrigno_di_legno.webp\`.\n\n`;
    md += `---\n`;
    md += `*Report autogenerato ed elaborato con successo in data: ${new Date().toLocaleString('it-IT')}.*\n`;
    
    fs.writeFileSync(REPORT_PATH, md, 'utf8');
    console.log(`🎉 Report written successfully to ${REPORT_PATH}`);
}

run().catch(console.error);
