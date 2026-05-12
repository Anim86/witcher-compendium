const fs = require('fs');
const path = require('path');

const alchemyNames = [
    'Lacrime di Talgar', 'Lingua di Drowner', 'Lingua di Strega dei Sepolcri', 
    'Mangusta', 'Marciatore', 'Midollo di Ghoul', 'Muschio Verde', 
    'Occhi di Arachas', 'Occhi di Viverna', 'Occhio di Corvo'
];

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';
const files = fs.readdirSync(srcDir);
const auditResults = [];

alchemyNames.forEach(name => {
    // Escape special chars for filename matching
    const slug = name.replace(/ /g, '_').replace(/'/g, '').toLowerCase();
    const matchedFiles = files.filter(f => f.toLowerCase().includes(slug) && f.endsWith('.json'));
    
    matchedFiles.forEach(file => {
        try {
            const content = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8'));
            const desc = content.system.description || '';
            auditResults.push({
                name: name,
                file: file,
                descLength: desc.length,
                isTruncated: desc.endsWith('...') || (desc.length > 0 && !desc.endsWith('>')),
                weight: content.system.weight,
                cost: content.system.cost,
                source: content.system.sourcebook
            });
        } catch (e) {
            auditResults.push({ name: name, file: file, error: 'Failed to read' });
        }
    });
});

console.log(JSON.stringify(auditResults, null, 2));
