const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-lore';
const outputDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO';
const mdFile = path.join(outputDir, 'report_lore_compendio.md');

// Helper to strip HTML tags and format description for Markdown tables
function cleanDescriptionForTable(html) {
    if (!html) return '';
    // Strip HTML tags
    let text = html.replace(/<[^>]*>/g, '').trim();
    // Replace newlines with spaces so it doesn't break the markdown table rows
    text = text.replace(/\r?\n/g, ' ');
    // Escape pipes since they are delimiters in markdown tables
    text = text.replace(/\|/g, '\\|');
    return text;
}

async function run() {
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    const loreEntries = [];

    for (const file of files) {
        const filePath = path.join(srcDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const system = content.system || {};
        
        loreEntries.push({
            name: content.name || '',
            img: content.img || '',
            sourcebook: system.sourcebook || '',
            description: cleanDescriptionForTable(system.description)
        });
    }

    // Sort by name
    loreEntries.sort((a, b) => a.name.localeCompare(b.name));

    // Build Markdown content
    let mdContent = `# 📖 Report Compendio LORE\n\n`;
    mdContent += `Questo report raccoglie tutte le **${loreEntries.length} voci di Lore** presenti all'interno del compendio *REGOLAMENTO E NARRATIVA*, strutturate in una comoda tabella riassuntiva.\n\n`;
    
    mdContent += `| Nome Compendio | Path Immagine | Sourcebook | Descrizione |\n`;
    mdContent += `| :--- | :--- | :---: | :--- |\n`;

    for (const entry of loreEntries) {
        mdContent += `| **${entry.name}** | \`${entry.img}\` | *${entry.sourcebook}* | ${entry.description} |\n`;
    }

    fs.writeFileSync(mdFile, mdContent, 'utf8');
    console.log(`Report LORE MD generato con successo in: ${mdFile}`);
}

run().catch(console.error);
