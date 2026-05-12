const fs = require('fs');
const path = require('path');

const BATCH_NUMBER = 24;
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

// Take Batch 24 (items 15 to 30 from the NEW selected list)
const BATCH_SIZE = 15;
const batchItems = selectedItems.slice(15, 30);

const translations = {
    "Viticci di Archeospora": "long thorny green archespore tendrils",
    "Mutageno: Botchling (Rosso)": "a glowing red organic mutagenic orb from a botchling",
    "Mutageno: Bullvore (Verde)": "a glowing green organic mutagenic orb from a bullvore",
    "Mutageno: Cockatrice (Rosso)": "a glowing red organic mutagenic orb from a cockatrice",
    "Mutageno: Elementale (Blu)": "a glowing blue organic mutagenic orb from an elemental",
    "Mutageno: Fenice (Rosso)": "a glowing red organic mutagenic orb from a phoenix",
    "Mutageno: Foglet (Blu)": "a glowing blue organic mutagenic orb from a foglet",
    "Mutageno: Frightener (Verde)": "a glowing green organic mutagenic orb from a frightener",
    "Mutageno: Garkain (Verde)": "a glowing green organic mutagenic orb from a garkain",
    "Mutageno: Manticora (Rosso)": "a glowing red organic mutagenic orb from a manticore",
    "Mutageno: Pesta (Blu)": "a glowing blue organic mutagenic orb from a plague maiden",
    "Mutageno: Shaelmaar (Verde)": "a glowing green organic mutagenic orb from a shaelmaar",
    "Mutageno: Succube (Verde)": "a glowing green organic mutagenic orb from a succubus",
    "Mutageno: Troll (Verde)": "a glowing green organic mutagenic orb from a troll",
    "Mutageno: Vendigo (Rosso)": "a glowing red organic mutagenic orb from a vendigo"
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
    <h1>Prompts Batch ${BATCH_NUMBER} (Mutageni e Parti Speciali)</h1>
    <p>Clicca sul tasto verde per copiare il prompt. Salva i file PNG nelle sottocartelle indicate.</p>

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
