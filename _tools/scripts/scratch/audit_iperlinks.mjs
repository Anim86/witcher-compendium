import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directories
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_PACKS_DIR = path.join(REPO_ROOT, '_tools', 'src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const OUTPUT_DIR = path.join(REPO_ROOT, 'TO DO', 'Iperlink');

// Placeholder filenames and sub-item generic assets
const PLACEHOLDER_ASSETS = new Set([
    'mystery-man', 'item-bag', 'item_loot', 'weapon_sword', 'mystery-item', 
    'armor_plate', 'rune', 'glyph', 'scroll', 'default', 'placeholder'
]);

// Ignored words for text searching (to prevent noisy single-word matches)
const IGNORED_COMMON_WORDS = new Set([
    'e', 'di', 'da', 'un', 'per', 'con', 'il', 'lo', 'la', 'i', 'gli', 'le', 'in', 'a',
    'del', 'dello', 'della', 'dei', 'degli', 'delle', 'al', 'allo', 'alla', 'ai', 'agli', 'alle',
    'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', 'col', 'coi', 'sul', 'sulla', 'sui', 'sugli', 'sulle',
    'pel', 'pei', 'tra', 'fra', 'bue', 'cane', 'gatto', 'lupo', 'mulo', 'orso', 'peso', 'tipo', 'oro', 
    'costo', 'tempo', 'mano', 'testa', 'acciaio', 'ferro', 'legname', 'filo', 'pelle', 'carbone', 'osso', 
    'ossa', 'argento', 'oro', 'acqua', 'sale', 'grasso', 'piume', 'piuma', 'cera', 'cenere', 'veleno', 
    'sangue', 'fegato', 'cuore', 'cervello', 'denti', 'artigli', 'zanne', 'carne', 'dardo', 'dardi', 
    'arco', 'spada', 'lancia', 'scudo', 'elmo', 'brache', 'cappa', 'stivali', 'guanti', 'manuale', 
    'pericolo', 'esiti', 'effetti', 'fumble', 'sensibilita', 'tattica', 'tempra', 'morso', 'biliardo', 
    'rituale', 'pergamena', 'formula', 'mistura', 'lozione', 'unguento', 'olio', 'decotto', 'pozione', 
    'polvere', 'componenti', 'mischia', 'difesa', 'attacco', 'distanza', 'disarmato', 'critici', 
    'critico', 'semplici', 'complicati', 'difficili', 'mortali', 'pericoli', 'necromanzia', 'disastri',
    'disastro'
]);

// Helper: recursive file walker
function getFiles(dir, ext = '') {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath, ext));
        } else if (!ext || file.toLowerCase().endsWith(ext)) {
            results.push(filePath);
        }
    });
    return results;
}

// Helper: name normalization
function normalizeName(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .normalize('NFD') // decompose accents
        .replace(/[\u0300-\u036f]/g, '') // strip accent marks
        .replace(/[^a-z0-9]/g, ''); // strip everything except alphanumeric
}

// Helper: Levenshtein distance
function getLevenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Helper: CSV cell escape
function escapeCSV(val) {
    if (val === null || val === undefined) return '';
    let str = val.toString();
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// Helper: RegExp escaper
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: HTML stripper
function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, ' ');
}

// Main execution
async function main() {
    console.log("🔍 Starting Structured Witcher Compendium Audit...");
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
    }

    // 1. Map physical assets
    console.log("🖼️ Mapping physical assets...");
    const physicalAssets = new Set();
    const allAssetFiles = getFiles(ASSETS_ROOT);
    
    allAssetFiles.forEach(f => {
        const rel = path.relative(ASSETS_ROOT, f).replace(/\\/g, '/');
        physicalAssets.add(rel);
    });
    console.log(`Found ${physicalAssets.size} physical asset files.`);

    // 2. Scan and parse all JSON files
    console.log("📦 Parsing all JSON source packs...");
    const jsonFiles = getFiles(SRC_PACKS_DIR, '.json');
    const entries = [];
    const idMap = new Map();
    const nameMap = new Map(); // normalized_name -> list of entries

    jsonFiles.forEach(fpath => {
        try {
            let content = fs.readFileSync(fpath, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            const data = JSON.parse(content);

            const relFile = path.relative(SRC_PACKS_DIR, fpath).replace(/\\/g, '/');
            const parts = relFile.split('/');
            const category = parts[0] || '';
            const pack = parts.slice(0, 2).join('/') || '';
            const filename = path.basename(fpath);

            const entry = {
                id: data._id || '',
                name: data.name || '',
                type: data.type || '',
                img: data.img || '',
                file_name: filename,
                pack: pack,
                category: category,
                rel_file_path: relFile,
                full_path: fpath,
                content: data,
                normalized_name: normalizeName(data.name || '')
            };

            entries.push(entry);

            if (entry.id) {
                idMap.set(entry.id, entry);
            }
            if (entry.normalized_name) {
                if (!nameMap.has(entry.normalized_name)) {
                    nameMap.set(entry.normalized_name, []);
                }
                nameMap.get(entry.normalized_name).push(entry);
            }
        } catch (e) {
            console.error(`❌ Error parsing ${fpath}: ${e.message}`);
        }
    });

    console.log(`Parsed ${entries.length} compendium entries.`);

    // 3. Establish relationships and generate links
    console.log("🔗 Analyzing relationships...");
    const links = [];
    
    // Tracking lists for orphans
    const referencedAssets = new Set();
    const entriesWithAssets = new Set(); // entryId
    const entriesWithLinks = new Set();  // entryId

    entries.forEach(src => {
        const entryId = src.id;

        // --- 3.1. Main image_link ---
        if (src.img) {
            const assetRelPath = src.img.replace("modules/witcher-compendium/assets/", "");
            const exists = physicalAssets.has(assetRelPath);
            referencedAssets.add(assetRelPath);

            // Check if it's placeholder
            const isPlaceholder = Array.from(PLACEHOLDER_ASSETS).some(p => assetRelPath.toLowerCase().includes(p));
            if (exists && !isPlaceholder) {
                entriesWithAssets.add(entryId);
            }

            links.push({
                source_pack: src.pack,
                source_file: src.file_name,
                source_entry: src.name,
                source_id: src.id,
                source_type: src.type,
                target_pack: '',
                target_entry: '',
                target_id: '',
                link_type: 'image_link',
                confidence: 'high',
                evidence: 'img field',
                asset_path: src.img,
                asset_exists: exists ? 'true' : 'false',
                notes: isPlaceholder ? 'Placeholder asset used' : ''
            });
        }

        // --- 3.2. Sub-item image_links ---
        if (src.content.items && Array.isArray(src.content.items)) {
            src.content.items.forEach(item => {
                if (item.img) {
                    const itemAssetRel = item.img.replace("modules/witcher-compendium/assets/", "");
                    const exists = physicalAssets.has(itemAssetRel);
                    referencedAssets.add(itemAssetRel);

                    links.push({
                        source_pack: src.pack,
                        source_file: src.file_name,
                        source_entry: src.name,
                        source_id: src.id,
                        source_type: src.type,
                        target_pack: '',
                        target_entry: '',
                        target_id: '',
                        link_type: 'image_link',
                        confidence: 'high',
                        evidence: `sub-item "${item.name}" img`,
                        asset_path: item.img,
                        asset_exists: exists ? 'true' : 'false',
                        notes: 'Sub-item asset reference'
                    });
                }
            });
        }

        // Keep track of explicit target resolutions to avoid duplicate linking
        const resolvedTargets = new Set();

        // --- 3.3. Cross Reference: system.components (e.g. diagrams/schematics) ---
        if (src.content.system?.components && Array.isArray(src.content.system.components)) {
            src.content.system.components.forEach(compStr => {
                // Strip quantity e.g. "Legname (x1)" -> "Legname"
                const cleanName = compStr.replace(/\s*\(x\d+d?\d*\)\s*$/, '').trim();
                const normComp = normalizeName(cleanName);

                if (normComp) {
                    const matches = nameMap.get(normComp) || [];
                    if (matches.length === 1) {
                        const target = matches[0];
                        resolvedTargets.add(target.id);
                        entriesWithLinks.add(entryId);
                        entriesWithLinks.add(target.id);

                        links.push({
                            source_pack: src.pack,
                            source_file: src.file_name,
                            source_entry: src.name,
                            source_id: src.id,
                            source_type: src.type,
                            target_pack: target.pack,
                            target_entry: target.name,
                            target_id: target.id,
                            link_type: 'cross_reference',
                            confidence: 'high',
                            evidence: `components field: "${compStr}"`,
                            asset_path: '',
                            asset_exists: '',
                            notes: ''
                        });
                    } else if (matches.length > 1) {
                        links.push({
                            source_pack: src.pack,
                            source_file: src.file_name,
                            source_entry: src.name,
                            source_id: src.id,
                            source_type: src.type,
                            target_pack: '',
                            target_entry: '',
                            target_id: '',
                            link_type: 'ambiguous',
                            confidence: 'low',
                            evidence: `components field: "${compStr}"`,
                            asset_path: '',
                            asset_exists: '',
                            notes: `Ambiguous match. Multiple matching entries found: ${matches.map(m => m.name + " (" + m.pack + ")").join(', ')}`
                        });
                    } else {
                        links.push({
                            source_pack: src.pack,
                            source_file: src.file_name,
                            source_entry: src.name,
                            source_id: src.id,
                            source_type: src.type,
                            target_pack: '',
                            target_entry: '',
                            target_id: '',
                            link_type: 'ambiguous',
                            confidence: 'low',
                            evidence: `components field: "${compStr}"`,
                            asset_path: '',
                            asset_exists: '',
                            notes: `Component name "${cleanName}" not found in compendium`
                        });
                    }
                }
            });
        }

        // --- 3.4. Cross Reference: system.source (e.g. mutagen source) ---
        if (src.content.system?.source) {
            const sourceStr = src.content.system.source.trim();
            const normSource = normalizeName(sourceStr);
            if (normSource) {
                const matches = nameMap.get(normSource) || [];
                if (matches.length === 1) {
                    const target = matches[0];
                    resolvedTargets.add(target.id);
                    entriesWithLinks.add(entryId);
                    entriesWithLinks.add(target.id);

                    links.push({
                        source_pack: src.pack,
                        source_file: src.file_name,
                        source_entry: src.name,
                        source_id: src.id,
                        source_type: src.type,
                        target_pack: target.pack,
                        target_entry: target.name,
                        target_id: target.id,
                        link_type: 'cross_reference',
                        confidence: 'high',
                        evidence: `system.source: "${sourceStr}"`,
                        asset_path: '',
                        asset_exists: '',
                        notes: ''
                    });
                } else if (matches.length > 1) {
                    links.push({
                        source_pack: src.pack,
                        source_file: src.file_name,
                        source_entry: src.name,
                        source_id: src.id,
                        source_type: src.type,
                        target_pack: '',
                        target_entry: '',
                        target_id: '',
                        link_type: 'ambiguous',
                        confidence: 'low',
                        evidence: `system.source: "${sourceStr}"`,
                        asset_path: '',
                        asset_exists: '',
                        notes: `Ambiguous match. Multiple matching entries found: ${matches.map(m => m.name + " (" + m.pack + ")").join(', ')}`
                    });
                } else {
                    links.push({
                        source_pack: src.pack,
                        source_file: src.file_name,
                        source_entry: src.name,
                        source_id: src.id,
                        source_type: src.type,
                        target_pack: '',
                        target_entry: '',
                        target_id: '',
                        link_type: 'ambiguous',
                        confidence: 'low',
                        evidence: `system.source: "${sourceStr}"`,
                        asset_path: '',
                        asset_exists: '',
                        notes: `Mutagen source monster "${sourceStr}" not found in compendium`
                    });
                }
            }
        }

        // --- 3.5. Semantic Link: Mutagen -> Monster ---
        if (src.type === 'mutagen' && src.name.toLowerCase().startsWith('mutageno')) {
            // Check if there is a monster in the monster packs that matches a word in the name
            entries.forEach(target => {
                if (target.id === entryId) return;
                if (target.category === 'BESTIARIO' && target.name.length >= 3) {
                    const monsterNorm = target.normalized_name;
                    if (src.normalized_name.includes(monsterNorm) && !resolvedTargets.has(target.id)) {
                        resolvedTargets.add(target.id);
                        entriesWithLinks.add(entryId);
                        entriesWithLinks.add(target.id);

                        links.push({
                            source_pack: src.pack,
                            source_file: src.file_name,
                            source_entry: src.name,
                            source_id: src.id,
                            source_type: src.type,
                            target_pack: target.pack,
                            target_entry: target.name,
                            target_id: target.id,
                            link_type: 'semantic_link',
                            confidence: 'high',
                            evidence: `Mutagen name "${src.name}" references monster "${target.name}"`,
                            asset_path: '',
                            asset_exists: '',
                            notes: ''
                        });
                    }
                }
            });
        }

        // --- 3.6. Semantic Link: Trophy -> Monster ---
        if (src.name.toLowerCase().startsWith('trofeo')) {
            // Strip Trophy prefix
            const cleanTrophy = src.name.replace(/^Trofeo\s*(:|di|del|della|dell')?\s*/i, '').trim();
            const normTrophy = normalizeName(cleanTrophy);
            if (normTrophy) {
                const matches = nameMap.get(normTrophy) || [];
                matches.forEach(target => {
                    if (target.id !== entryId && target.category === 'BESTIARIO' && !resolvedTargets.has(target.id)) {
                        resolvedTargets.add(target.id);
                        entriesWithLinks.add(entryId);
                        entriesWithLinks.add(target.id);

                        links.push({
                            source_pack: src.pack,
                            source_file: src.file_name,
                            source_entry: src.name,
                            source_id: src.id,
                            source_type: src.type,
                            target_pack: target.pack,
                            target_entry: target.name,
                            target_id: target.id,
                            link_type: 'semantic_link',
                            confidence: 'high',
                            evidence: `Trophy name "${src.name}" maps to monster "${target.name}"`,
                            asset_path: '',
                            asset_exists: '',
                            notes: ''
                        });
                    }
                });
            }
        }

        // --- 3.7. Semantic Link: Schematic -> Item/Weapon/Armor ---
        if (src.type === 'diagrams' || src.name.toLowerCase().startsWith('schema:')) {
            const cleanSchema = src.name.replace(/^Schema\s*(:|per la fabbricazione di|per)?\s*/i, '').trim();
            const normSchema = normalizeName(cleanSchema);
            if (normSchema) {
                const matches = nameMap.get(normSchema) || [];
                matches.forEach(target => {
                    if (target.id !== entryId && target.id !== src.id && !resolvedTargets.has(target.id)) {
                        resolvedTargets.add(target.id);
                        entriesWithLinks.add(entryId);
                        entriesWithLinks.add(target.id);

                        links.push({
                            source_pack: src.pack,
                            source_file: src.file_name,
                            source_entry: src.name,
                            source_id: src.id,
                            source_type: src.type,
                            target_pack: target.pack,
                            target_entry: target.name,
                            target_id: target.id,
                            link_type: 'semantic_link',
                            confidence: 'high',
                            evidence: `Schematic name "${src.name}" maps to target "${target.name}"`,
                            asset_path: '',
                            asset_exists: '',
                            notes: ''
                        });
                    }
                });
            }
        }

        // --- 3.8. Textual Mentions (Scanning description and details) ---
        // Combine text fields
        let textContent = '';
        if (src.content.system?.description) textContent += ' ' + src.content.system.description;
        if (src.content.system?.details?.biography) textContent += ' ' + src.content.system.details.biography;
        if (src.content.system?.details?.common) textContent += ' ' + src.content.system.details.common;
        if (src.content.system?.details?.academicKnowledge) textContent += ' ' + src.content.system.details.academicKnowledge;
        if (src.content.system?.details?.vulnerability) textContent += ' ' + src.content.system.details.vulnerability;

        const cleanText = stripHtml(textContent);

        if (cleanText.length > 5) {
            entries.forEach(target => {
                if (target.id === entryId) return; // Skip self
                if (resolvedTargets.has(target.id)) return; // Skip if already linked

                const targetName = target.name.trim();
                if (targetName.length < 5) return; // Skip short target names to avoid false matches
                
                // Skip common names
                if (IGNORED_COMMON_WORDS.has(target.normalized_name)) return;

                // Match with word boundaries
                const regex = new RegExp('\\b' + escapeRegExp(targetName) + '\\b', 'i');
                const match = cleanText.match(regex);

                if (match) {
                    resolvedTargets.add(target.id);
                    entriesWithLinks.add(entryId);
                    entriesWithLinks.add(target.id);

                    // Extract a brief context snippet
                    const matchIndex = match.index || 0;
                    const start = Math.max(0, matchIndex - 30);
                    const end = Math.min(cleanText.length, matchIndex + targetName.length + 30);
                    const snippet = '...' + cleanText.slice(start, end).replace(/\s+/g, ' ').trim() + '...';

                    links.push({
                        source_pack: src.pack,
                        source_file: src.file_name,
                        source_entry: src.name,
                        source_id: src.id,
                        source_type: src.type,
                        target_pack: target.pack,
                        target_entry: target.name,
                        target_id: target.id,
                        link_type: 'cross_reference',
                        confidence: 'medium',
                        evidence: `Text mention snippet: "${snippet}"`,
                        asset_path: '',
                        asset_exists: '',
                        notes: 'Identified via contextual text match'
                    });
                }
            });
        }
    });

    console.log(`Detected ${links.length} total links.`);

    // 4. Duplicate Detection (Assets & Entries)
    console.log("👥 Identifying duplicates and near-duplicates...");
    const duplicateRows = [];

    // --- 4.1. Duplicate Assets ---
    // Group entries by asset path
    const assetToEntries = new Map();
    entries.forEach(entry => {
        if (entry.img) {
            const assetRel = entry.img.replace("modules/witcher-compendium/assets/", "");
            // Exclude common placeholders
            const isPlaceholder = Array.from(PLACEHOLDER_ASSETS).some(p => assetRel.toLowerCase().includes(p));
            if (!isPlaceholder && physicalAssets.has(assetRel)) {
                if (!assetToEntries.has(assetRel)) {
                    assetToEntries.set(assetRel, []);
                }
                assetToEntries.get(assetRel).push(entry);
            }
        }
    });

    for (const [assetPath, entryList] of assetToEntries.entries()) {
        if (entryList.length > 1) {
            // Every unique pair
            for (let i = 0; i < entryList.length; i++) {
                for (let j = i + 1; j < entryList.length; j++) {
                    duplicateRows.push({
                        duplicate_type: 'duplicate_asset',
                        identifier_1: entryList[i].id,
                        identifier_2: entryList[j].id,
                        name_1: entryList[i].name,
                        name_2: entryList[j].name,
                        similarity: 'exact',
                        notes: `Shared asset: ${assetPath}`
                    });
                }
            }
        }
    }

    // --- 4.2. Duplicate Entries ---
    // Group entries by exact name + type
    const nameTypeToEntries = new Map();
    entries.forEach(entry => {
        const key = entry.name.toLowerCase() + '|||' + entry.type;
        if (!nameTypeToEntries.has(key)) {
            nameTypeToEntries.set(key, []);
        }
        nameTypeToEntries.get(key).push(entry);
    });

    for (const [key, entryList] of nameTypeToEntries.entries()) {
        if (entryList.length > 1) {
            for (let i = 0; i < entryList.length; i++) {
                for (let j = i + 1; j < entryList.length; j++) {
                    duplicateRows.push({
                        duplicate_type: 'duplicate_entry',
                        identifier_1: entryList[i].id,
                        identifier_2: entryList[j].id,
                        name_1: entryList[i].name,
                        name_2: entryList[j].name,
                        similarity: 'exact',
                        notes: `Exact duplicate name and type. Path 1: ${entryList[i].pack}, Path 2: ${entryList[j].pack}`
                    });
                }
            }
        }
    }

    // --- 4.3. Near-Duplicate Entries ---
    // Compare entries in the same category to find near-duplicates (Levenshtein distance <= 2)
    const categoryToEntries = new Map();
    entries.forEach(entry => {
        if (!categoryToEntries.has(entry.category)) {
            categoryToEntries.set(entry.category, []);
        }
        categoryToEntries.get(entry.category).push(entry);
    });

    for (const [cat, catEntries] of categoryToEntries.entries()) {
        for (let i = 0; i < catEntries.length; i++) {
            const e1 = catEntries[i];
            if (e1.name.length <= 6) continue; // skip short names to avoid noise

            for (let j = i + 1; j < catEntries.length; j++) {
                const e2 = catEntries[j];
                if (e2.name.length <= 6) continue;
                if (e1.normalized_name === e2.normalized_name) continue; // already checked by exact duplicates

                // Compute distance
                const dist = getLevenshteinDistance(e1.normalized_name, e2.normalized_name);
                if (dist <= 2) {
                    duplicateRows.push({
                        duplicate_type: 'near_duplicate_entry',
                        identifier_1: e1.id,
                        identifier_2: e2.id,
                        name_1: e1.name,
                        name_2: e2.name,
                        similarity: 'near_duplicate',
                        notes: `Near duplicate name (Levenshtein distance: ${dist}) in category ${cat}`
                    });
                }
            }
        }
    }

    console.log(`Identified ${duplicateRows.length} duplicates and near-duplicates.`);

    // 5. Orphan Detection
    console.log("🏚️ Detecting orphans (assets and entries)...");
    const orphanRows = [];

    // --- 5.1. Assets without Reference ---
    allAssetFiles.forEach(f => {
        const rel = path.relative(ASSETS_ROOT, f).replace(/\\/g, '/');
        // Exclude common placeholders from orphan checks
        const isPlaceholder = Array.from(PLACEHOLDER_ASSETS).some(p => rel.toLowerCase().includes(p));
        if (!isPlaceholder && !referencedAssets.has(rel)) {
            orphanRows.push({
                orphan_type: 'asset_without_reference',
                identifier: rel,
                name: path.basename(f),
                details: 'Physical asset file exists in witcher-compendium/assets but is not referenced by any entry JSON.'
            });
        }
    });

    // --- 5.2. Entries without Asset ---
    entries.forEach(entry => {
        const entryId = entry.id;
        if (!entriesWithAssets.has(entryId)) {
            let reason = 'Broken image path or placeholder image used.';
            if (!entry.img) {
                reason = 'No image path specified (img field is blank).';
            } else {
                const rel = entry.img.replace("modules/witcher-compendium/assets/", "");
                const exists = physicalAssets.has(rel);
                if (!exists) {
                    reason = `Specified asset path does not exist physically in assets: ${rel}`;
                } else {
                    reason = `Entry uses a generic placeholder asset: ${rel}`;
                }
            }

            orphanRows.push({
                orphan_type: 'entry_without_asset',
                identifier: `${entry.pack}/${entry.file_name}`,
                name: entry.name,
                details: reason
            });
        }
    });

    // --- 5.3. Entries without Cross-Reference ---
    entries.forEach(entry => {
        if (!entriesWithLinks.has(entry.id)) {
            orphanRows.push({
                orphan_type: 'entry_without_cross_reference',
                identifier: `${entry.pack}/${entry.file_name}`,
                name: entry.name,
                details: 'Isolated entry: has no inbound or outbound cross-references or semantic links in the entire compendium.'
            });
        }
    });

    console.log(`Identified ${orphanRows.length} orphan records.`);

    // 6. Write Deliverables to TO DO/Iperlink
    console.log("💾 Writing deliverables...");

    // --- 6.1. report_links.csv ---
    const linksCsvPath = path.join(OUTPUT_DIR, 'report_links.csv');
    let linksCsvContent = "source_pack,source_file,source_entry,source_id,source_type,target_pack,target_entry,target_id,link_type,confidence,evidence,asset_path,asset_exists,notes\n";
    links.forEach(l => {
        linksCsvContent += `${escapeCSV(l.source_pack)},${escapeCSV(l.source_file)},${escapeCSV(l.source_entry)},${escapeCSV(l.source_id)},${escapeCSV(l.source_type)},${escapeCSV(l.target_pack)},${escapeCSV(l.target_entry)},${escapeCSV(l.target_id)},${escapeCSV(l.link_type)},${escapeCSV(l.confidence)},${escapeCSV(l.evidence)},${escapeCSV(l.asset_path)},${escapeCSV(l.asset_exists)},${escapeCSV(l.notes)}\n`;
    });
    fs.writeFileSync(linksCsvPath, linksCsvContent, 'utf8');
    console.log(`📄 Wrote ${links.length} rows to ${linksCsvPath}`);

    // --- 6.2. report_orphans.csv ---
    const orphansCsvPath = path.join(OUTPUT_DIR, 'report_orphans.csv');
    let orphansCsvContent = "orphan_type,identifier,name,details\n";
    orphanRows.forEach(o => {
        orphansCsvContent += `${escapeCSV(o.orphan_type)},${escapeCSV(o.identifier)},${escapeCSV(o.name)},${escapeCSV(o.details)}\n`;
    });
    fs.writeFileSync(orphansCsvPath, orphansCsvContent, 'utf8');
    console.log(`📄 Wrote ${orphanRows.length} rows to ${orphansCsvPath}`);

    // --- 6.3. report_duplicates.csv ---
    const duplicatesCsvPath = path.join(OUTPUT_DIR, 'report_duplicates.csv');
    let duplicatesCsvContent = "duplicate_type,identifier_1,identifier_2,name_1,name_2,similarity,notes\n";
    duplicateRows.forEach(d => {
        duplicatesCsvContent += `${escapeCSV(d.duplicate_type)},${escapeCSV(d.identifier_1)},${escapeCSV(d.identifier_2)},${escapeCSV(d.name_1)},${escapeCSV(d.name_2)},${escapeCSV(d.similarity)},${escapeCSV(d.notes)}\n`;
    });
    fs.writeFileSync(duplicatesCsvPath, duplicatesCsvContent, 'utf8');
    console.log(`📄 Wrote ${duplicateRows.length} rows to ${duplicatesCsvPath}`);

    // --- 6.4. report_links.md (High-Level Summary) ---
    const linksMdPath = path.join(OUTPUT_DIR, 'report_links.md');

    // Aggregate statistics
    const statsByPack = {};
    const linkCountsByType = {
        image_link: 0,
        cross_reference: 0,
        semantic_link: 0,
        ambiguous: 0
    };

    links.forEach(l => {
        if (l.link_type in linkCountsByType) {
            linkCountsByType[l.link_type]++;
        }
        
        const pack = l.source_pack;
        if (!statsByPack[pack]) {
            statsByPack[pack] = { total_entries: 0, image_links: 0, cross_references: 0, semantic_links: 0, ambiguous_links: 0 };
        }
        if (l.link_type === 'image_link') statsByPack[pack].image_links++;
        else if (l.link_type === 'cross_reference') statsByPack[pack].cross_references++;
        else if (l.link_type === 'semantic_link') statsByPack[pack].semantic_links++;
        else if (l.link_type === 'ambiguous') statsByPack[pack].ambiguous_links++;
    });

    // Count entries per pack
    entries.forEach(entry => {
        const pack = entry.pack;
        if (!statsByPack[pack]) {
            statsByPack[pack] = { total_entries: 0, image_links: 0, cross_references: 0, semantic_links: 0, ambiguous_links: 0 };
        }
        statsByPack[pack].total_entries++;
    });

    // Count connections per entry (outbound + inbound)
    const entryConnections = {};
    entries.forEach(entry => {
        entryConnections[entry.id] = { name: entry.name, pack: entry.pack, count: 0 };
    });

    links.forEach(l => {
        if (l.source_id && entryConnections[l.source_id]) {
            entryConnections[l.source_id].count++;
        }
        if (l.target_id && entryConnections[l.target_id]) {
            entryConnections[l.target_id].count++;
        }
    });

    const topConnected = Object.values(entryConnections)
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

    // Orphans statistics
    const orphanCounts = {
        asset_without_reference: 0,
        entry_without_asset: 0,
        entry_without_cross_reference: 0
    };
    orphanRows.forEach(o => {
        if (o.orphan_type in orphanCounts) orphanCounts[o.orphan_type]++;
    });

    // Duplicate statistics
    const duplicateCounts = {
        duplicate_asset: 0,
        duplicate_entry: 0,
        near_duplicate_entry: 0
    };
    duplicateRows.forEach(d => {
        if (d.duplicate_type in duplicateCounts) duplicateCounts[d.duplicate_type]++;
    });

    // Link counts per category
    const statsByCategory = {};
    links.forEach(l => {
        const cat = l.source_pack.split('/')[0] || 'REGOLAMENTO_E_NARRATIVA';
        if (!statsByCategory[cat]) statsByCategory[cat] = 0;
        statsByCategory[cat]++;
    });

    let mdContent = `# 📊 Report dei Collegamenti e degli Asset - Witcher TRPG Compendio\n\n`;
    mdContent += `Questo report fornisce una sintesi delle relazioni estrattive, collegamenti iconografici ed anomalie strutturali rilevate nei pack compendio sorgente.\n\n`;
    
    mdContent += `## 📈 Sintesi Statistiche Generali\n`;
    mdContent += `| Metrica | Conteggio |\n|---|---|\n`;
    mdContent += `| **Totale Voci Analizzate** | ${entries.length} |\n`;
    mdContent += `| **Totale Asset Fisici Rilevati** | ${physicalAssets.size} |\n`;
    mdContent += `| **Image Link (Mappature Iconografiche)** | ${linkCountsByType.image_link} |\n`;
    mdContent += `| **Cross Reference (Relazioni Strutturate o Testuali)** | ${linkCountsByType.cross_reference} |\n`;
    mdContent += `| **Semantic Link (Relazioni Semantiche Forti)** | ${linkCountsByType.semantic_link} |\n`;
    mdContent += `| **Ambiguous Links (Relazioni Incerte o Fallite)** | ${linkCountsByType.ambiguous} |\n`;
    mdContent += `| **Asset Fisici Orfani (Non Referenziati)** | ${orphanCounts.asset_without_reference} |\n`;
    mdContent += `| **Voci Senza Immagine o con Placeholder** | ${orphanCounts.entry_without_asset} |\n`;
    mdContent += `| **Voci Isolate (Senza Relazioni)** | ${orphanCounts.entry_without_cross_reference} |\n`;
    mdContent += `| **Asset Duplicati (Referenziati da più voci)** | ${duplicateCounts.duplicate_asset} |\n`;
    mdContent += `| **Voci Duplicate (Stesso Nome e Tipo)** | ${duplicateCounts.duplicate_entry} |\n`;
    mdContent += `| **Voci Quasi Duplicate (Alta Somiglianza)** | ${duplicateCounts.near_duplicate_entry} |\n\n`;

    mdContent += `## 📂 Analisi Dettagliata per Pack Compendio\n`;
    mdContent += `| Pack Sorgente | Voci | Image Links | Cross Refs | Semantic Links | Ambiguous |\n|---|---|---|---|---|---|\n`;
    for (const [pack, s] of Object.entries(statsByPack).sort()) {
        mdContent += `| \`${pack}\` | ${s.total_entries} | ${s.image_links} | ${s.cross_references} | ${s.semantic_links} | ${s.ambiguous_links} |\n`;
    }
    mdContent += `\n`;

    mdContent += `## 🏷️ Collegamenti Rilevati per Macro Categoria\n`;
    mdContent += `| Categoria | Collegamenti Rilevati |\n|---|---|\n`;
    for (const [cat, count] of Object.entries(statsByCategory).sort()) {
        mdContent += `| \`${cat}\` | ${count} |\n`;
    }
    mdContent += `\n`;

    mdContent += `## 🏆 Top Voci con Maggior Numero di Collegamenti (Grado del Grafo)\n`;
    mdContent += `Questo elenco mostra le prime 15 entità del compendio ordinate per grado di relazione (somma di collegamenti in ingresso e in uscita).\n\n`;
    mdContent += `| Grado | Nome Voca | Compendio Pack | Collegamenti Totali |\n|---|---|---|---|\n`;
    topConnected.forEach((item, index) => {
        mdContent += `| ${index + 1} | **${item.name}** | \`${item.pack}\` | ${item.count} |\n`;
    });
    mdContent += `\n`;

    mdContent += `> [!NOTE]\n`;
    mdContent += `> I report dettagliati in formato CSV contenenti l'intero grafo, le anomalie e i duplicati sono disponibili nella cartella: \`TO DO/Iperlink/\`.\n`;

    fs.writeFileSync(linksMdPath, mdContent, 'utf8');
    console.log(`📄 Wrote markdown report to ${linksMdPath}`);

    console.log("\n🎉 Audit completed successfully!");
}

main().catch(console.error);
