import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const RITUALS_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'MAGIA_E_MALEDIZIONI', 'Incantesimi_e_Rituali', 'witcher-rituals');
const REPORT_FILE = path.join(REPO_ROOT, 'TO DO', 'report_rituali.md');

// Helper to strip HTML tags
function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, ' ');
}

function run() {
    console.log("🔍 Scanning Witcher rituals compendium...");
    if (!fs.existsSync(RITUALS_DIR)) {
        console.error(`❌ Folder not found: ${RITUALS_DIR}`);
        return;
    }

    const files = fs.readdirSync(RITUALS_DIR).filter(f => f.endsWith('.json'));
    const rituals = [];

    files.forEach(file => {
        const fullPath = path.join(RITUALS_DIR, file);
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            const data = JSON.parse(content);

            const name = data.name || '';
            const id = data._id || '';
            const system = data.system || {};
            const stamina = system.stamina !== undefined ? system.stamina : (system.cost !== undefined ? system.cost : 0);
            const level = system.level || '';
            const duration = system.duration || 'N/A';
            const range = system.range || 'N/A';
            const sourcebook = system.sourcebook || '';
            const description = system.description || '';
            const cleanDesc = stripHtml(description);

            // Anomaly detection logic
            const anomalies = [];
            if (cleanDesc.includes("Alessandro Pacifico")) {
                anomalies.push("Alessandro Pacifico (Watermark)");
            }
            if (cleanDesc.includes("--- Pagina")) {
                anomalies.push("Intestazione Pagina PDF");
            }
            if (cleanDesc.includes("Immagini presenti")) {
                anomalies.push("Dicitura Immagini PDF");
            }
            if (cleanDesc.toLowerCase().includes("compressione in manufatto") && name !== "Compressione in Manufatto") {
                anomalies.push("Testo di altra voce (Compressione in Manufatto)");
            }
            if (cleanDesc.length > 500 && (cleanDesc.includes("RITUALI DA MAESTRO") || cleanDesc.includes("IL DURO LAVORO"))) {
                anomalies.push("Sezione PDF estranea");
            }

            rituals.push({
                name,
                id,
                file,
                stamina,
                level,
                duration,
                range,
                sourcebook,
                cleanDesc,
                anomalies: anomalies.length > 0 ? anomalies.join(", ") : "Nessuna"
            });
        } catch (e) {
            console.error(`❌ Error parsing ${file}: ${e.message}`);
        }
    });

    // Sort rituals alphabetically
    rituals.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Parsed ${rituals.length} rituals. Generating markdown report...`);

    // Write markdown report
    let md = `# 📜 Report Stato Rituali del Compendio\n\n`;
    md += `Questo report elenca tutte le voci del compendio **Rituali** (\`witcher-rituals\`) con le relative informazioni strutturali ed evidenzia eventuali anomalie, watermark o testi corrotti derivanti dalla scansione OCR dei PDF.\n\n`;

    md += `## 📊 Statistiche Generali\n`;
    const totalWithAnomalies = rituals.filter(r => r.anomalies !== "Nessuna").length;
    md += `- **Totale Rituali nel Compendio**: ${rituals.length}\n`;
    md += `- **Rituali con Anomalie/Testo Corrotto**: **${totalWithAnomalies}**\n`;
    md += `- **Rituali Puliti**: ${rituals.length - totalWithAnomalies}\n\n`;

    md += `## ⚠️ Legenda Anomalie\n`;
    md += `- **Alessandro Pacifico (Watermark)**: Presenza della firma/filigrana del proprietario del PDF.\n`;
    md += `- **Intestazione Pagina PDF**: Presenza di indicatori di pagina del manuale (es. \`--- Pagina 121 ---\`).\n`;
    md += `- **Testo di altra voce**: Testo in descrizione che appartiene in realtà ad un altro rituale o a descrizioni estranee.\n\n`;

    md += `## 📋 Tabella Riassuntiva dei Rituali\n\n`;
    md += `| Nome Rituale | ID | Stamina | Livello | Durata | Sourcebook | Stato / Anomalie | Anteprima Descrizione |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;

    rituals.forEach(r => {
        const preview = r.cleanDesc.length > 100 ? r.cleanDesc.slice(0, 100).replace(/\s+/g, ' ').trim() + '...' : r.cleanDesc.replace(/\s+/g, ' ').trim();
        const statusIcon = r.anomalies !== "Nessuna" ? `⚠️ **${r.anomalies}**` : "✅ OK";
        
        md += `| **${r.name}** | \`${r.id}\` | \`${r.stamina}\` | \`${r.level}\` | \`${r.duration}\` | \`${r.sourcebook}\` | ${statusIcon} | *${preview}* |\n`;
    });

    md += `\n\n## 📝 Dettaglio Anomalie per Voce (Azione Richiesta)\n`;
    const anomaliesList = rituals.filter(r => r.anomalies !== "Nessuna");
    
    if (anomaliesList.length === 0) {
        md += `*Nessuna anomalia rilevata! Tutte le descrizioni sono pulite.*\n`;
    } else {
        anomaliesList.forEach(r => {
            md += `### ❌ [${r.name}](file://${path.join(RITUALS_DIR, r.file).replace(/\\/g, '/')})\n`;
            md += `- **File**: \`${r.file}\`\n`;
            md += `- **ID**: \`${r.id}\`\n`;
            md += `- **Anomalie Rilevate**: ${r.anomalies}\n`;
            md += `- **Testo Integrale Attuale**:\n`;
            md += `  \`\`\`html\n`;
            md += `  ${r.cleanDesc.replace(/\s+/g, ' ').trim()}\n`;
            md += `  \`\`\`\n\n`;
        });
    }

    fs.writeFileSync(REPORT_FILE, md, 'utf8');
    console.log(`✅ Report saved to: ${REPORT_FILE}`);
}

run();
