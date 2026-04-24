const fs = require('fs');
const path = require('path');

const alchemyNames = [
    'Occhio di Demonio', 'Optima Mater', 'Orecchio di Strega dei Sepolcri', 
    'Orzo', 'Pelle di Troll', 'Perla', 'Petali di Elleboro', 
    'Petali di Ginatia', 'Petali di Mirto Bianco', 'Pietra del Vino'
];

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';
const files = fs.readdirSync(srcDir);
const auditResults = [];

alchemyNames.forEach(name => {
    const slug = name.replace(/ /g, '_').replace(/'/g, '').toLowerCase();
    const matchedFiles = files.filter(f => f.toLowerCase().includes(slug) && f.endsWith('.json'));
    
    matchedFiles.forEach(file => {
        try {
            const content = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8'));
            auditResults.push({
                name: name,
                file: file,
                desc: content.system.description ? content.system.description.substring(0, 50) + '...' : 'EMPTY'
            });
        } catch (e) {}
    });
});

console.log(JSON.stringify(auditResults, null, 2));
