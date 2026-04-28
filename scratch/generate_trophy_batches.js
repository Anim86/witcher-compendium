const fs = require('fs');
const path = require('path');

const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/global_missing_icons_report.json';
const missing = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Filter only witcher-trophies
const trophyItems = missing.filter(m => m.pack.includes('witcher-trophies'));

// Remove exact duplicates from the list (same name and expected path)
const uniqueTrophyItems = [];
const seen = new Set();
trophyItems.forEach(item => {
    const key = item.name + item.expected;
    if (!seen.has(key)) {
        seen.add(key);
        uniqueTrophyItems.push(item);
    }
});

const BATCH_SIZE = 15;
let currentBatchNumber = 42; // After equipment batches (31-41)

function generatePrompt(itemName) {
    const monsterName = itemName.replace('Trofeo: ', '');
    return `Digital painting viewed from directly above, top-down perspective, a bloody severed head of a ${monsterName} monster tied with rough hemp rope lying flat on a dark rough textured stone surface, the trophy is a gruesome proof of a hunt, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.`;
}

for (let i = 0; i < uniqueTrophyItems.length; i += BATCH_SIZE) {
    const batchItems = uniqueTrophyItems.slice(i, i + BATCH_SIZE);
    
    let htmlItems = '';
    batchItems.forEach(item => {
        const fileName = path.basename(item.expected).replace('.webp', '.png');
        const packFolderName = path.basename(item.pack);
        const savePath = "temp_images/" + packFolderName + "/";
        const prompt = generatePrompt(item.name);
        
        htmlItems += `    <div class="item">
        <div class="header">
            <span class="name">${item.name}</span>
            <span class="meta">Nome file: <strong>${fileName}</strong></span>
        </div>
        <div class="path-info">Salva in: ${savePath}</div>
        <div class="prompt-box">${prompt}</div>
        <button onclick="copyToClipboard('${prompt.replace(/'/g, "\\'")}', this)">Copia Prompt</button>
    </div>\n`;
    });
    
    let htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompts Batch ${currentBatchNumber} - Witcher Compendium</title>
    <style>
        body { font-family: sans-serif; background: #1a1a1a; color: #e0e0e0; padding: 20px; line-height: 1.6; }
        .path-info { background: #333; color: #4caf50; padding: 5px 10px; border-radius: 4px; font-family: monospace; display: inline-block; margin-bottom: 10px; font-weight: bold; }
        .item { background: #2a2a2a; padding: 15px; margin-bottom: 15px; border-radius: 8px; display: flex; flex-direction: column; border-left: 5px solid #ff5722; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .name { font-weight: bold; color: #ff9800; font-size: 1.2em; }
        .meta { color: #bbb; font-size: 0.9em; }
        .prompt-box { background: #111; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; margin-bottom: 10px; position: relative; border: 1px solid #444; }
        button { background: #ff5722; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.3s; align-self: flex-start; }
        button:hover { background: #e64a19; }
        button.copied { background: #2196f3; }
        strong { color: #fff; }
    </style>
</head>
<body>
    <h1>Prompts Batch ${currentBatchNumber} (Trofei del Bestiario)</h1>
    <p>Clicca sul tasto arancione per copiare il prompt del trofeo. Salva i file PNG nelle sottocartelle indicate.</p>

    <div id="content">
${htmlItems}    </div>

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
</html>`;

    const outputPath = "e:/AntigravitiProgetti/CompendioTheWitcher/scratch/prompts_batch_" + currentBatchNumber + ".html";
    fs.writeFileSync(outputPath, htmlContent);
    console.log("Batch " + currentBatchNumber + " HTML generated at: " + outputPath);
    
    currentBatchNumber++;
}
