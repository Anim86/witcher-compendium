const fs = require('fs');
const path = require('path');

const packs = [
    "witcher-lore",
    "witcher-lore-chaos",
    "witcher-lore-racconti",
    "witcher-dlc-sr-lore"
];

const basePath = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti`;

let output = [];

packs.forEach(pack => {
    const packDir = path.join(basePath, pack);
    if (!fs.existsSync(packDir)) return;
    
    output.push(`# ${pack}\n`);
    
    const files = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));
    files.forEach(f => {
        const fullPath = path.join(packDir, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        const name = data.name || "Sconosciuto";
        const source = (data.system && data.system.sourcebook) ? data.system.sourcebook : "N/A";
        let desc = (data.system && data.system.description) ? data.system.description : "";
        
        // Semplice regex per rimuovere i tag HTML
        desc = desc.replace(/<[^>]*>?/gm, '');
        // Per decodificare eventuali &apos;, &quot; in testo si potrebbe usare replace, ma per ora teniamo semplice:
        desc = desc.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        
        output.push(`## ${name}`);
        output.push(`**File:** ${fullPath.replace(/\\/g, '/')}`);
        output.push(`**Source:** ${source}`);
        output.push(`**Descrizione:**\n${desc.trim()}\n---`);
    });
    
    output.push('');
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\lore_review.md', output.join('\n'), 'utf8');
