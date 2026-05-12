import fs from 'fs';
import path from 'path';

const mapping = [
  { name: 'Arachas', page: 296 },
  { name: 'Drowner', page: 276 },
  { name: 'Ghoul', page: 278 },
  { name: 'Golem', page: 298 },
  { name: 'Grifoni', page: 292 },
  { name: 'Katakan', page: 308 },
  { name: 'Lupi e Warg', page: 286 },
  { name: 'Lupi Mannari', page: 288 },
  { name: 'Nekker', page: 302 },
  { name: 'Sirene', page: 290 },
  { name: 'Streghe dei Sepolcri', page: 280 },
  { name: 'Troll di Roccia', page: 304 },
  { name: 'Viverne', page: 306 },
  { name: 'Wraith', page: 282 },
  { name: 'Wraith Diurni', page: 284 },
  { name: 'Demoni', page: 300 },
  { name: 'Endriaghe', page: 294 },
  { name: 'Banditi', page: 270 },
  { name: 'Arcieri Scoia\'tael', page: 274 }
];

const imgDir = 'Manuali/Tomo Base/Immagini';
const allFiles = fs.readdirSync(imgDir);

let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Preview Finale Rimedi Immagini</title>
    <style>
        body { font-family: sans-serif; background: #121212; color: #e0e0e0; padding: 40px; }
        .monster-card { 
            background: #1e1e1e; 
            border: 1px solid #333; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 2rem; 
            display: flex; 
            align-items: center; 
            gap: 2rem;
        }
        .info { flex: 1; }
        img { 
            border: 3px solid #444; 
            border-radius: 4px; 
            background: #000;
        }
        h2 { color: #f1c40f; margin-top: 0; }
        p { margin: 5px 0; color: #bbb; }
        code { background: #2c3e50; padding: 2px 6px; border-radius: 4px; color: #ecf0f1; }
    </style>
</head>
<body>
    <h1>Anteprima Finale Rimedi Bestiario (NotebookLM Mapping)</h1>
    <p>Verifica visiva delle illustrazioni basata sulla mappatura pagine pari/dispari.</p>
`;

for (const m of mapping) {
    const pStr = 'Pag' + m.page.toString().padStart(3, '0');
    const pattern = pStr + '_';
    const found = allFiles.find(f => f.startsWith(pattern) && f.endsWith('_01.png'));
    
    html += `
    <div class="monster-card">
`;

    if (found) {
        const stats = fs.statSync(path.join(imgDir, found));
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2) + ' MB';
        const relPath = '../' + path.join(imgDir, found).replace(/\\/g, '/');
        
        html += `
        <img src="${relPath}" width="300" height="300" style="object-fit:cover" alt="${m.name}">
        <div class="info">
            <h2>${m.name} — Tomo Base (Pag ${m.page})</h2>
            <p><strong>File:</strong> <code>${found}</code></p>
            <p><strong>Peso:</strong> ${sizeMB} (${stats.size.toLocaleString()} bytes)</p>
        </div>
`;
    } else {
        html += `
        <div style="width:300px; height:300px; background:#333; display:flex; align-items:center; justify-content:center;">MANCANTE</div>
        <div class="info">
            <h2>${m.name} — Tomo Base (Pag ${m.page})</h2>
            <p style="color:red"><strong>ERRORE: FILE NON TROVATO</strong></p>
        </div>
`;
    }

    html += `
    </div>
`;
}

html += `
</body>
</html>
`;

fs.writeFileSync('scratch/immagini-remediate-preview-finale.html', html, 'utf8');
console.log('Final HTML preview generated in scratch/immagini-remediate-preview-finale.html');
