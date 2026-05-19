import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const RUNES_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'MAGIA_E_MALEDIZIONI', 'Incantesimi_e_Rituali', 'witcher-runes');
const WEAPONS_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'EQUIPAGGIAMENTO', 'witcher-weapons');
const ARMOR_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'EQUIPAGGIAMENTO', 'witcher-armor');
const REPORT_FILE = path.join(REPO_ROOT, 'TO DO', 'report_rune_glifi_reliquie.md');

// Helper to strip HTML tags
function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Systemic UTF-8 decoding error corrector
function cleanUtf8Errors(text) {
    if (!text) return "";
    return text
        .replaceAll("Ãˆ", "È")
        .replaceAll("Ã©", "é")
        .replaceAll("Ã¨", "è")
        .replaceAll("Ã ", "à")
        .replaceAll("Ã²", "ò")
        .replaceAll("Ã¹", "ù")
        .replaceAll("Ã¬", "ì")
        .replaceAll("â€™", "’")
        .replaceAll("â€“", "–")
        .replaceAll("Ã", "à"); // Catch-all for stray Ã as à
}

function run() {
    console.log("🧼 Scanning and automatically cleaning encoding issues in Witcher Runes, Glyphs, and Relics...");

    const runes = [];
    const glyphs = [];
    const relics = [];
    let cleanCount = 0;

    // Helper to process, clean and save a JSON file
    function processJsonFile(dir, file, categoryHandler) {
        const fullPath = path.join(dir, file);
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            
            const originalContent = content;
            const cleanedContent = cleanUtf8Errors(content);

            let data;
            if (originalContent !== cleanedContent) {
                fs.writeFileSync(fullPath, cleanedContent, 'utf8');
                cleanCount++;
                data = JSON.parse(cleanedContent);
            } else {
                data = JSON.parse(originalContent);
            }

            categoryHandler(data, file);
        } catch (e) {
            console.error(`❌ Error processing ${file}: ${e.message}`);
        }
    }

    // 1. Process witcher-runes
    if (fs.existsSync(RUNES_DIR)) {
        const files = fs.readdirSync(RUNES_DIR).filter(f => f.endsWith('.json'));
        files.forEach(file => {
            processJsonFile(RUNES_DIR, file, (data, filename) => {
                const name = data.name || '';
                const id = data._id || '';
                const system = data.system || {};
                const cost = system.cost !== undefined ? system.cost : 0;
                const sourcebook = system.sourcebook || '';
                const avail = system.avail || '';
                const type = system.type || 'Rune';
                const description = stripHtml(system.description || '');

                const item = { name, id, file: filename, cost, sourcebook, avail, description };

                if (type.toLowerCase() === 'glyph' || name.toLowerCase().startsWith('glifo')) {
                    glyphs.push(item);
                } else {
                    runes.push(item);
                }
            });
        });
    }

    // 2. Process witcher-weapons
    if (fs.existsSync(WEAPONS_DIR)) {
        const files = fs.readdirSync(WEAPONS_DIR).filter(f => f.endsWith('.json'));
        files.forEach(file => {
            processJsonFile(WEAPONS_DIR, file, (data, filename) => {
                const name = data.name || '';
                const id = data._id || '';
                const system = data.system || {};
                const description = stripHtml(system.description || '');

                const isRelic = name.toLowerCase().includes('reliquia') || 
                                filename.toLowerCase().includes('reliquia') || 
                                description.toLowerCase().includes('reliquia') ||
                                description.toLowerCase().includes('relic');

                if (isRelic) {
                    relics.push({
                        name,
                        id,
                        file: filename,
                        category: "Arma",
                        cost: system.cost !== undefined ? system.cost : 0,
                        sourcebook: system.sourcebook || 'MB 258',
                        statLabel: "DAN",
                        statValue: system.damage || 'N/A',
                        properties: system.damageProperties ? (system.damageProperties.effects || []).map(e => `${e.name} (${e.percentage}%)`).join(", ") : "",
                        description
                    });
                }
            });
        });
    }

    // 3. Process witcher-armor
    if (fs.existsSync(ARMOR_DIR)) {
        const files = fs.readdirSync(ARMOR_DIR).filter(f => f.endsWith('.json'));
        files.forEach(file => {
            processJsonFile(ARMOR_DIR, file, (data, filename) => {
                const name = data.name || '';
                const id = data._id || '';
                const system = data.system || {};
                const description = stripHtml(system.description || '');

                const isRelic = name.toLowerCase().includes('reliquia') || 
                                filename.toLowerCase().includes('reliquia') || 
                                description.toLowerCase().includes('reliquia') ||
                                description.toLowerCase().includes('relic') ||
                                name.toLowerCase().includes('corvo') || 
                                name.toLowerCase().includes('draugr');

                if (isRelic) {
                    relics.push({
                        name,
                        id,
                        file: filename,
                        category: "Armatura",
                        cost: system.cost !== undefined ? system.cost : 0,
                        sourcebook: system.sourcebook || 'MB 258',
                        statLabel: "SP/Punti Protez.",
                        statValue: system.stopping !== undefined ? system.stopping : 'N/A',
                        properties: `Ev: ${system.encumbrance !== undefined ? system.encumbrance : 0}`,
                        description
                    });
                }
            });
        });
    }

    // Sort lists alphabetically
    runes.sort((a, b) => a.name.localeCompare(b.name));
    glyphs.sort((a, b) => a.name.localeCompare(b.name));
    relics.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Cleaned ${cleanCount} files containing UTF-8 errors.`);
    console.log(`Found ${runes.length} runes, ${glyphs.length} glyphs, and ${relics.length} relics.`);

    // Write report
    let md = `# 📜 Report Rune, Glifi e Reliquie del Compendio\n\n`;
    md += `Questo report elenca tutti gli elementi del capitolo **Rune, Glifi e Reliquie** nel compendio del progetto, indicandone tipologia, statistiche chiave, descrizione e manuale di provenienza.\n\n`;

    md += `## 📊 Sintesi Statistiche\n`;
    md += `| Tipologia Elemento | Conteggio Voci |\n`;
    md += `|---|---|\n`;
    md += `| **Rune (per Armi)** | ${runes.length} |\n`;
    md += `| **Glifi (per Armature)** | ${glyphs.length} |\n`;
    md += `| **Reliquie (Leggendarie)** | ${relics.length} |\n`;
    md += `| **Totale Elementi** | **${runes.length + glyphs.length + relics.length}** |\n\n`;

    md += `## 🛡️ Sezione 1: Rune\n`;
    md += `Le rune vengono applicate agli slot di potenziamento delle **Armi**.\n\n`;
    md += `| Nome Runa | ID | Costo | Rarietà | Manuale | Effetto / Descrizione |\n`;
    md += `|---|---|---|---|---|---|\n`;
    runes.forEach(r => {
        md += `| **${r.name}** | \`${r.id}\` | ${r.cost} C. | \`${r.avail}\` | \`${r.sourcebook}\` | *${r.description}* |\n`;
    });

    md += `\n## 🔮 Sezione 2: Glifi\n`;
    md += `I glifi vengono applicati agli slot di potenziamento delle **Armature**.\n\n`;
    md += `| Nome Glifo | ID | Costo | Rarietà | Manuale | Effetto / Descrizione |\n`;
    md += `|---|---|---|---|---|---|\n`;
    glyphs.forEach(g => {
        md += `| **${g.name}** | \`${g.id}\` | ${g.cost} C. | \`${g.avail}\` | \`${g.sourcebook}\` | *${g.description}* |\n`;
    });

    md += `\n## 👑 Sezione 3: Reliquie (Equipaggiamento Unico)\n`;
    md += `Le reliquie sono armi e armature leggendarie uniche nel loro genere, non acquistabili o producibili normalmente.\n\n`;
    md += `| Nome Reliquia | Categoria | Statistica Chiave | Proprietà / Effetti Speciali | Manuale | ID | Descrizione Narrativa |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    relics.forEach(re => {
        md += `| **${re.name}** | \`${re.category}\` | **${re.statLabel}:** \`${re.statValue}\` | ${re.properties || '*Nessuna*'} | \`${re.sourcebook}\` | \`${re.id}\` | *${re.description}* |\n`;
    });

    fs.writeFileSync(REPORT_FILE, md, 'utf8');
    console.log(`✅ Report saved to: ${REPORT_FILE}`);
}

run();
