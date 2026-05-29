const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-lore';
const outputDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO';
const csvFile = path.join(outputDir, 'report_lore_compendio.csv');

// Helper to strip HTML tags
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim().replace(/"/g, '""');
}

// Helper to format CSV fields for Semicolon-Separated Values (excellent for European Excel)
function csvField(val) {
    if (val === null || val === undefined) return '""';
    const clean = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${clean}"`;
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
            category: system.category || '',
            img: content.img || '',
            sourcebook: system.sourcebook || '',
            description: stripHtml(system.description)
        });
    }

    // Sort by name
    loreEntries.sort((a, b) => a.name.localeCompare(b.name));

    // Build CSV content
    const headers = [
        'Nome Compendio',
        'Categoria',
        'Path dell\'Immagine',
        'Sourcebook',
        'Descrizione'
    ];

    // Semicolon separator for European Excel
    let csvContent = headers.map(csvField).join(';') + '\n';

    for (const entry of loreEntries) {
        const row = [
            entry.name,
            entry.category,
            entry.img,
            entry.sourcebook,
            entry.description
        ];
        csvContent += row.map(csvField).join(';') + '\n';
    }

    fs.writeFileSync(csvFile, csvContent, 'utf8');
    console.log(`Report LORE generato con successo in: ${csvFile}`);
    console.log(`Totale voci trovate: ${loreEntries.length}`);
}

run().catch(console.error);
