import fs from 'fs';
import path from 'path';

const manualNames = {
  'MB': 'Tomo Base',
  'TC': 'Tomo del Caos',
  'DW': 'Diario di un Witcher',
  'MS': 'Mostri sulla Strada',
  'LR': 'Libro dei Racconti'
};

const monsters = [
  { name: 'Arachas', source: 'MB 297' },
  { name: 'Arcieri Scoia’tael', source: 'MB 276' },
  { name: 'Banditi', source: 'MB 271' },
  { name: 'Demoni', source: 'MB 301' },
  { name: 'Drowner', source: 'MB 277' },
  { name: 'Endriaghe', source: 'MB 295' },
  { name: 'Ghoul', source: 'MB 279' },
  { name: 'Golem', source: 'MB 299' },
  { name: 'Grifoni', source: 'MB 293' },
  { name: 'Katakan', source: 'MB 309' },
  { name: 'Lupi e Warg', source: 'MB 287' },
  { name: 'Lupi Mannari', source: 'MB 289' },
  { name: 'Nekker', source: 'MB 303' },
  { name: 'Sirene', source: 'MB 291' },
  { name: 'Streghe dei Sepolcri', source: 'MB 281' },
  { name: 'Troll di Roccia', source: 'MB 305' },
  { name: 'Viverne', source: 'MB 307' },
  { name: 'Wraith', source: 'MB 283' },
  { name: 'Wraith Diurni', source: 'MB 285' }
];

const imgDir = 'Manuali/Tomo Base/Immagini';
const allFiles = fs.readdirSync(imgDir).map(f => {
    const fp = path.join(imgDir, f);
    return { name: f, path: fp, size: fs.statSync(fp).size };
});

let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Preview Rimedi Immagini v3</title>
    <style>
        body { font-family: sans-serif; background: #1a1a1a; color: #eee; padding: 20px; }
        .monster-block { margin-bottom: 3rem; border-bottom: 1px solid #444; padding-bottom: 1rem; }
        .thumb-container { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .thumb-wrap { position: relative; width: 150px; }
        .badge {
            position: absolute; top: 4px; left: 4px;
            background: rgba(0,0,0,0.8); color: #fff;
            padding: 2px 7px; border-radius: 4px;
            font-weight: bold; font-size: 14px;
            border: 1px solid #777;
        }
        img { border: 2px solid #555; border-radius: 4px; object-fit: cover; background: #000; }
        .info { font-size: 0.8rem; margin-top: 5px; word-break: break-all; }
        h3 { color: #f39c12; margin-bottom: 1rem; }
        .corrupt { color: #e74c3c; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Anteprima Immagini v3 (Visual Verification)</h1>
    <p>Identifica l'immagine da usare indicando il numero del badge (es: "Drowner -> 2")</p>
`;

for (const m of monsters) {
    const code = m.source.split(' ')[0];
    const page = m.source.split(' ')[1];
    const longManual = manualNames[code] || 'Manuale Sconosciuto';
    const pageStr = 'Pag' + page.padStart(3, '0');
    
    // Normalization for name search
    const cleanName = m.name.toLowerCase().replace(/’/g, "'");
    const nameNoApostrophe = m.name.toLowerCase().replace(/’/g, "");
    
    let candidates = allFiles.filter(f => {
        const lower = f.name.toLowerCase();
        return lower.includes(cleanName) || lower.includes(nameNoApostrophe) || f.name.includes(pageStr) || f.name.includes('Pag' + page);
    });

    // Sort by size descending
    candidates.sort((a,b) => b.size - a.size);
    
    // Take top 3
    const top3 = candidates.slice(0, 3);

    html += `
    <div class="monster-block">
      <h3>${m.name} — ${longManual} (${m.source})</h3>
      <div class="thumb-container">`;

    if (top3.length === 0) {
        html += `<p>NESSUNA IMMAGINE TROVATA</p>`;
    } else {
        top3.forEach((c, idx) => {
            const sizeMB = (c.size / 1024 / 1024).toFixed(2) + ' MB';
            const relPath = '../' + c.path.replace(/\\/g, '/');
            const isCorrupt = c.size === 1930626;
            const borderStyle = isCorrupt ? 'border: 2px solid red;' : 'border: 2px solid #555;';
            const sizeClass = isCorrupt ? 'class="corrupt"' : '';

            html += `
        <div class="thumb-wrap">
          <div class="badge">${idx + 1}</div>
          <img src="${relPath}" width="150" height="150" style="object-fit:cover; ${borderStyle}" alt="${c.name}">
          <div class="info">
            ${c.name}<br>
            <span ${sizeClass}>${c.size.toLocaleString()} bytes (${sizeMB})</span>
          </div>
        </div>`;
        });
    }

    html += `
      </div>
    </div>`;
}

html += `
</body>
</html>
`;

fs.writeFileSync('scratch/immagini-remediate-preview-v3.html', html, 'utf8');
console.log('HTML v3 preview generated in scratch/immagini-remediate-preview-v3.html');
const reportPath = path.resolve('scratch/immagini-remediate-preview-v3.html');
console.log('Path:', reportPath);
