import fs from 'fs';
import path from 'path';

const mapping = {
  "Arachas": "Manuali/Tomo Base/Immagini/Pag299_Arachas_01.png",
  "Arcieri Scoia’tael": "Manuali/Tomo Base/Immagini/Pag278_Arcieri Scoia’tael_01.png",
  "Banditi": "Manuali/Tomo Base/Immagini/Pag274_Banditi_01.png",
  "Demoni": "Manuali/Tomo Base/Immagini/Pag303_Demoni_01.png",
  "Drowner": "Manuali/Tomo Base/Immagini/Pag280_Drowner_01.png",
  "Endriaghe": "Manuali/Tomo Base/Immagini/Pag298_Endriaghe_01.png",
  "Ghoul": "Manuali/Tomo Base/Immagini/Pag282_Ghoul_01.png",
  "Golem": "Manuali/Tomo Base/Immagini/Pag302_Golem_01.png",
  "Grifoni": "Manuali/Tomo Base/Immagini/Pag296_Grifoni_02.png",
  "Katakan": "Manuali/Tomo Base/Immagini/Pag311_Katakan_03.png",
  "Lupi e Warg": "Manuali/Tomo Base/Immagini/Pag290_Lupi e Warg_01.png",
  "Lupi Mannari": "Manuali/Tomo Base/Immagini/Pag292_Lupi Mannari_01.png",
  "Nekker": "Manuali/Tomo Base/Immagini/Pag306_Nekker_01.png",
  "Sirene": "Manuali/Tomo Base/Immagini/Pag294_Sirene_01.png",
  "Streghe dei Sepolcri": "Manuali/Tomo Base/Immagini/Pag284_Streghe dei Sepolcri_01.png",
  "Troll di Roccia": "Manuali/Tomo Base/Immagini/Pag308_Troll di Roccia_01.png",
  "Viverne": "Manuali/Tomo Base/Immagini/Pag310_Viverne_01.png",
  "Wraith": "Manuali/Tomo Base/Immagini/Pag286_Wraith_01.png",
  "Wraith Diurni": "Manuali/Tomo Base/Immagini/Pag288_Wraith Diurni_01.png"
};

let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Preview Rimedi Immagini Bestiario</title>
    <style>
        body { font-family: sans-serif; background: #1a1a1a; color: #eee; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; border: 1px solid #444; text-align: left; }
        th { background: #333; }
        img { border: 2px solid #555; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Anteprima Immagini Rimediate (19 Mostri)</h1>
    <table>
        <tr>
            <th>Nome Mostro</th>
            <th>PNG Sorgente</th>
            <th>Peso</th>
            <th>Preview</th>
        </tr>
`;

for (const [name, src] of Object.entries(mapping)) {
    const fullPath = src;
    const size = fs.existsSync(fullPath) ? (fs.statSync(fullPath).size / 1024 / 1024).toFixed(2) + ' MB' : 'NON TROVATO';
    const relToHtml = '../' + src;
    
    html += `
        <tr>
            <td><strong>${name}</strong></td>
            <td><code>${src}</code></td>
            <td>${size}</td>
            <td><img src="${relToHtml}" width="150" height="150" style="object-fit:cover" alt="${name}"></td>
        </tr>
    `;
}

html += `
    </table>
</body>
</html>
`;

fs.writeFileSync('scratch/immagini-remediate-preview.html', html, 'utf8');
console.log('HTML preview generated in scratch/immagini-remediate-preview.html');
