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

// Cache the largest files for fallback
const largestFilesGlobal = [...allFiles].sort((a,b) => b.size - a.size).slice(0, 10); // Take more than 3 just in case

let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Preview Rimedi Immagini v5</title>
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
            z-index: 10;
        }
        img { border: 2px solid #555; border-radius: 4px; object-fit: cover; background: #000; }
        .info { font-size: 0.8rem; margin-top: 5px; word-break: break-all; }
        h3 { color: #f39c12; margin-bottom: 1rem; }
        .corrupt { color: #e74c3c; font-weight: bold; }
        .source-type { font-weight: normal; font-size: 0.9rem; color: #888; }
    </style>
</head>
<body>
    <h1>Anteprima Immagini v5 (Ricerca Globale Manuale)</h1>
    <p>La ricerca ignora le pagine e si concentra su Match Nome -> Fallback Illustrazioni Pesanti.</p>
`;

for (const m of monsters) {
    const code = m.source.split(' ')[0];
    const longManual = manualNames[code] || 'Manuale Sconosciuto';
    
    // Normalization for name search
    const cleanNameStr = m.name.toLowerCase().replace(/’/g, "'");
    const nameNoApostrophe = m.name.toLowerCase().replace(/’/g, "");
    
    // 1. Search ENTIRE manual folder for name matches
    let nameMatches = allFiles.filter(f => {
        const lower = f.name.toLowerCase();
        return lower.includes(cleanNameStr) || lower.includes(nameNoApostrophe);
    }).sort((a,b) => b.size - a.size);

    let top3 = [];
    let isFallback = false;

    if (nameMatches.length > 0) {
        top3 = nameMatches.slice(0, 3);
    } else {
        // Fallback: 3 largest PNGs of the entire manual
        top3 = largestFilesGlobal.slice(0, 3);
        isFallback = true;
    }

    html += `
    <div class="monster-block">
      <h3>${m.name} — ${longManual} (${m.source}) <span class="source-type">[${isFallback ? 'FALLBACK: TOP 3 MANUAL' : 'MATCH: NOME'}]</span></h3>
      <div class="thumb-container">`;

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

    html += `
      </div>
    </div>`;
}

html += `
</body>
</html>
`;

fs.writeFileSync('scratch/immagini-remediate-preview-v5.html', html, 'utf8');
console.log('HTML v5 preview generated in scratch/immagini-remediate-preview-v5.html');
const reportPath = path.resolve('scratch/immagini-remediate-preview-v5.html');
console.log('Path:', reportPath);
