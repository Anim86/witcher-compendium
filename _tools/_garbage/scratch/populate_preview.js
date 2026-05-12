const fs = require('fs');
const path = require('path');

const monsters = [
    { name: 'Arachas', p: 296 },
    { name: 'Drowner', p: 276 },
    { name: 'Ghoul', p: 278 },
    { name: 'Golem', p: 298 },
    { name: 'Grifoni', p: 292 },
    { name: 'Katakan', p: 308 },
    { name: 'Lupi e Warg', p: 286 },
    { name: 'Lupi Mannari', p: 288 },
    { name: 'Nekker', p: 302 },
    { name: 'Sirene', p: 290 },
    { name: 'Streghe Sepolcri', p: 280 },
    { name: 'Troll di Roccia', p: 304 },
    { name: 'Viverne', p: 306 },
    { name: 'Wraith', p: 282 },
    { name: 'Wraith Diurni', p: 284 },
    { name: 'Demoni', p: 300 },
    { name: 'Endriaghe', p: 294 },
    { name: 'Banditi', p: 270 },
    { name: 'Arcieri Scoia’tael', p: 274 }
];

const dir = 'Manuali/Tomo Base/Immagini';
const absDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/Manuali/Tomo Base/Immagini';
let cards = '';

monsters.forEach(m => {
    const pdfPage = m.p + 2;
    const prefix = 'Pag' + pdfPage.toString().padStart(3, '0');
    let files = [];
    try {
        files = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('_01.png'));
    } catch (e) {
        console.error('Directory non trovata:', dir);
    }
    
    const file = files[0] || null;
    let size = 0;
    if (file) {
        size = fs.statSync(path.join(dir, file)).size;
    }
    
    const sizeMB = (size / (1024 * 1024)).toFixed(3);
    const isBuggy = !file || size < 10000;
    const src = file ? 'file:///' + path.join(absDir, file).replace(/\\/g, '/') : '';
    
    cards += `
    <div class="monster-card ${isBuggy ? 'buggy' : ''}">
        <h3>${m.name} — pag manuale ${m.p} / pag PDF ${pdfPage}</h3>
        <img class="thumb" src="${src}" alt="${m.name}">
        <div class="info">
            <b>File:</b> ${file || 'NON TROVATO'}<br>
            <b>Peso:</b> ${sizeMB} MB
        </div>
        ${isBuggy ? '<div class="status">SOSPETTO CORROTTO / GRIGIO / SFONDO</div>' : ''}
    </div>`;
});

const templatePath = 'scratch/preview-offset-corretta.html';
if (fs.existsSync(templatePath)) {
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html.replace('<!-- RENDERED_CARDS -->', cards);
    fs.writeFileSync(templatePath, html);
    console.log('HTML generato con successo in:', templatePath);
} else {
    console.error('Template non trovato:', templatePath);
}
