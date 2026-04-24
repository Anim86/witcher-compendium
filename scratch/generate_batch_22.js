const fs = require('fs');
const path = require('path');

const BATCH_NUMBER = 22;
const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/global_missing_icons_report.json';
const missing = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const priorityPacks = [
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-components',
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-components-diario',
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-components-mutageni-dw',
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-dlc-ms-components',
    'ALCHIMIA_E_ARTIGIANATO\\Mutageni\\witcher-mutations',
    'ALCHIMIA_E_ARTIGIANATO\\Mutageni\\witcher-mutazioni-tc'
];

let selectedItems = [];
priorityPacks.forEach(pack => {
    const items = missing.filter(m => m.pack === pack);
    selectedItems = selectedItems.concat(items);
});

// Take Batch 22 (items 15 to 30)
const BATCH_SIZE = 15;
const batchItems = selectedItems.slice(15, 30);

const translations = {
    "Grasso di Estere": "a lump of yellowish ester grease",
    "Legname": "a few rough-cut wooden planks",
    "Legname Indurito": "a few dark, fire-hardened wooden planks",
    "Lino a Doppia Trama": "a piece of thick, heavy double-woven linen cloth",
    "Lino": "a piece of simple white linen cloth",
    "Minerale Luccicante": "a chunk of glowing, shimmering silver-blue ore",
    "Mutageno Penitente (Blu)": "a glowing blue organic mutagenic orb with ghostly energy",
    "Olio Scurente": "a glass bottle filled with dark wood-staining oil",
    "Oro": "a shiny polished gold ingot",
    "Pelle di Lupo": "a thick grey wolf fur pelt",
    "Pelle d'Orso": "a heavy brown bear fur pelt",
    "Piume": "a handful of various bird feathers",
    "Polvere Zerrikaniana": "a small pile of bright yellow explosive powder",
    "Quintessenza": "a glowing, semi-transparent orb of pure magical essence",
    "Resina": "a sticky lump of golden-brown tree resin"
};

let htmlItems = '';
batchItems.forEach(item => {
    const fileName = path.basename(item.expected).replace('.webp', '.png');
    const packFolderName = path.basename(item.pack);
    const savePath = "temp_images/" + packFolderName + "/";
    const subject = translations[item.name] || item.name;
    const prompt = "Extreme close-up digital painting viewed from directly above, top-down perspective, " + subject + " lying flat on a dark rough textured stone surface, large subject filling the frame, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.";
    
    htmlItems += `
    <div class="item">
        <div class="header">
            <span class="name">${item.name}</span>
            <span class="meta">Nome file: <strong>${fileName}</strong></span>
        </div>
        <div class="path-info">Salva in: ${savePath}</div>
        <div class="prompt-box">${prompt}</div>
        <button onclick="copyToClipboard('${prompt.replace(/'/g, "\\'")}', this)">Copia Prompt</button>
    </div>
    `;
});

const htmlContent = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompts Batch ${BATCH_NUMBER} - Witcher Compendium</title>
    <style>
        body { font-family: sans-serif; background: #1a1a1a; color: #e0e0e0; padding: 20px; line-height: 1.6; }
        .batch-section { margin-bottom: 40px; border-bottom: 1px solid #444; padding-bottom: 20px; }
        .path-info { background: #333; color: #4caf50; padding: 5px 10px; border-radius: 4px; font-family: monospace; display: inline-block; margin-bottom: 10px; font-weight: bold; }
        .item { background: #2a2a2a; padding: 15px; margin-bottom: 15px; border-radius: 8px; display: flex; flex-direction: column; border-left: 5px solid #4caf50; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .name { font-weight: bold; color: #ff9800; font-size: 1.2em; }
        .meta { color: #bbb; font-size: 0.9em; }
        .prompt-box { background: #111; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; margin-bottom: 10px; position: relative; border: 1px solid #444; }
        button { background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.3s; align-self: flex-start; }
        button:hover { background: #45a049; }
        button.copied { background: #2196f3; }
        strong { color: #fff; }
    </style>
</head>
<body>
    <h1>Prompts Batch ${BATCH_NUMBER} (Componenti Alchemici e Artigianato)</h1>
    <p>Clicca sul tasto verde per copiare il prompt. <strong>Importante:</strong> Salva i file PNG nelle sottocartelle di <code>temp_images</code> indicate.</p>

    <div id="content">
        ${htmlItems}
    </div>

    <script>
        function copyToClipboard(text, btn) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = btn.innerText;
                btn.innerText = "Copiato!";
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            });
        }
    </script>
</body>
</html>
`;

const outputPath = "e:/AntigravitiProgetti/CompendioTheWitcher/scratch/prompts_batch_" + BATCH_NUMBER + ".html";
fs.writeFileSync(outputPath, htmlContent);
console.log("Batch " + BATCH_NUMBER + " HTML generated at: " + outputPath);
