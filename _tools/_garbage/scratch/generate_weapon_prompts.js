const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const REPORT_PATH = path.join(ROOT, 'scratch', 'global_missing_icons_report.json');
const OUTPUT_HTML = path.join(ROOT, 'scratch', 'prompts_batch_35_weapons.html');

const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
const weapons = report.filter(m => m.pack.includes('witcher-weapons')).slice(0, 20);

let html = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Prompts Batch 35 (Armi) - Witcher Compendium</title>
    <style>
        body { font-family: sans-serif; background: #1a1a1a; color: #e0e0e0; padding: 20px; }
        .item { background: #2a2a2a; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 5px solid #2196f3; }
        .name { font-weight: bold; color: #ff9800; font-size: 1.2em; }
        .meta { color: #bbb; font-size: 0.9em; }
        .prompt-box { background: #111; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; border: 1px solid #444; }
        button { background: #2196f3; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
        .path-info { color: #4caf50; font-family: monospace; font-weight: bold; margin-bottom: 5px; }
    </style>
</head>
<body>
    <h1>Prompts Batch 35 (Armi)</h1>
    <p>Target folder: <strong>temp_images/witcher-weapons/</strong></p>
`;

weapons.forEach(item => {
    const filename = path.basename(item.expected).replace('.webp', '.png');
    const prompt = `Digital painting viewed from directly above, top-down perspective, a ${item.name} lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.`;
    
    html += `
    <div class="item">
        <div class="name">${item.name}</div>
        <div class="meta">Nome file: <strong>${filename}</strong></div>
        <div class="path-info">Salva in: temp_images/witcher-weapons/</div>
        <div class="prompt-box" id="p-${filename}">${prompt}</div>
        <button onclick="copyToClipboard('${prompt.replace(/'/g, "\\'")}', this)">Copia Prompt</button>
    </div>`;
});

html += `
    <script>
        function copyToClipboard(text, btn) {
            navigator.clipboard.writeText(text).then(() => {
                btn.innerText = "Copiato!";
                setTimeout(() => { btn.innerText = "Copia Prompt"; }, 2000);
            });
        }
    </script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_HTML, html);
console.log(`Generated prompts for ${weapons.length} weapons in ${OUTPUT_HTML}`);
