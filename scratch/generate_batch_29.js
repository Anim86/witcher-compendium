const fs = require('fs');
const path = require('path');

const BATCH_NUMBER = 29;
const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/global_missing_icons_report.json';
const missing = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const priorityPacks = [
    'ALCHIMIA_E_ARTIGIANATO\\Mutageni\\witcher-mutazioni-tc',
    'ALCHIMIA_E_ARTIGIANATO\\Schemi_di_Fabbricazione\\witcher-dlc-sw-schematics'
];

let selectedItems = [];
priorityPacks.forEach(pack => {
    const items = missing.filter(m => m.pack === pack);
    selectedItems = selectedItems.concat(items);
});

// Take Batch 29 (first 15)
const BATCH_SIZE = 15;
const batchItems = selectedItems.slice(0, BATCH_SIZE);

const translations = {
    "Tratto Mutazione: Incrementare Massa": "an organic mutation showing increased muscle mass and bulging veins",
    "Tratto Mutazione: Migliorare Arma Naturale": "an organic mutation showing sharpened claws or teeth",
    "Tratto Mutazione: Rendere Docile": "an organic mutation showing a subdued or calm neural structure",
    "Tratto Mutazione: Testa Aggiuntiva": "an organic mutation showing a small additional head or brain growth",
    "Schema Spada d'Acciaio del Lupo": "a glowing alchemical schematic for a Wolf School steel sword",
    "Schema Spada d'Acciaio del Manticora": "a glowing alchemical schematic for a Manticore School steel sword",
    "Schema Spada d'Acciaio del Orso": "a glowing alchemical schematic for an Ursine School steel sword",
    "Schema Spada d'Acciaio del Vipera": "a glowing alchemical schematic for a Viper School steel sword",
    "Schema Spada d'Argento del Gatto": "a glowing alchemical schematic for a Feline School silver sword",
    "Schema Spada d'Argento del Grifone": "a glowing alchemical schematic for a Griffin School silver sword",
    "Schema Spada d'Argento del Lupo": "a glowing alchemical schematic for a Wolf School silver sword",
    "Schema Spada d'Argento del Manticora": "a glowing alchemical schematic for a Manticore School silver sword",
    "Schema Spada d'Argento del Orso": "a glowing alchemical schematic for an Ursine School silver sword",
    "Schema Spada d'Argento del Vipera": "a glowing alchemical schematic for a Viper School silver sword",
    "Schema Zanna del Vipera": "a glowing alchemical schematic for a Viper School fang-themed weapon"
};

let htmlItems = '';
batchItems.forEach(item => {
    const fileName = path.basename(item.expected).replace('.webp', '.png');
    const packFolderName = path.basename(item.pack);
    const savePath = "temp_images/" + packFolderName + "/";
    const subject = translations[item.name] || (item.name.startsWith("Tratto Mutazione") ? "an organic mutation for " + item.name : "a glowing alchemical schematic for " + item.name);
    const prompt = "Digital painting viewed from directly above, top-down perspective, " + subject + " lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.";
    
    htmlItems += '    <div class="item">\n' +
        '        <div class="header">\n' +
        '            <span class="name">' + item.name + '</span>\n' +
        '            <span class="meta">Nome file: <strong>' + fileName + '</strong></span>\n' +
        '        </div>\n' +
        '        <div class="path-info">Salva in: ' + savePath + '</div>\n' +
        '        <div class="prompt-box">' + prompt + '</div>\n' +
        '        <button onclick="copyToClipboard(\'' + prompt.replace(/'/g, "\\'") + '\', this)">Copia Prompt</button>\n' +
        '    </div>\n';
});

let htmlContent = '<!DOCTYPE html>\n<html lang="it">\n<head>\n    <meta charset="UTF-8">\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '    <title>Prompts Batch ' + BATCH_NUMBER + ' - Witcher Compendium</title>\n' +
    '    <style>\n' +
    '        body { font-family: sans-serif; background: #1a1a1a; color: #e0e0e0; padding: 20px; line-height: 1.6; }\n' +
    '        .path-info { background: #333; color: #4caf50; padding: 5px 10px; border-radius: 4px; font-family: monospace; display: inline-block; margin-bottom: 10px; font-weight: bold; }\n' +
    '        .item { background: #2a2a2a; padding: 15px; margin-bottom: 15px; border-radius: 8px; display: flex; flex-direction: column; border-left: 5px solid #4caf50; }\n' +
    '        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }\n' +
    '        .name { font-weight: bold; color: #ff9800; font-size: 1.2em; }\n' +
    '        .meta { color: #bbb; font-size: 0.9em; }\n' +
    '        .prompt-box { background: #111; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; margin-bottom: 10px; position: relative; border: 1px solid #444; }\n' +
    '        button { background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.3s; align-self: flex-start; }\n' +
    '        button:hover { background: #45a049; }\n' +
    '        button.copied { background: #2196f3; }\n' +
    '        strong { color: #fff; }\n' +
    '    </style>\n</head>\n<body>\n' +
    '    <h1>Prompts Batch ' + BATCH_NUMBER + ' (Mutazioni & Schemi DLC)</h1>\n' +
    '    <p>Clicca sul tasto verde per copiare il prompt. Salva i file PNG nelle sottocartelle indicate.</p>\n\n' +
    '    <div id="content">\n' + htmlItems + '    </div>\n\n' +
    '    <script>\n' +
    '        function copyToClipboard(text, btn) {\n' +
    '            navigator.clipboard.writeText(text).then(() => {\n' +
    '                const originalText = btn.innerText;\n' +
    '                btn.innerText = "Copiato!";\n' +
    '                btn.classList.add(\'copied\');\n' +
    '                setTimeout(() => {\n' +
    '                    btn.innerText = originalText;\n' +
    '                    btn.classList.remove(\'copied\');\n' +
    '                }, 2000);\n' +
    '            });\n' +
    '        }\n' +
    '    </script>\n</body>\n</html>';

const outputPath = "e:/AntigravitiProgetti/CompendioTheWitcher/scratch/prompts_batch_" + BATCH_NUMBER + ".html";
fs.writeFileSync(outputPath, htmlContent);
console.log("Batch " + BATCH_NUMBER + " HTML generated at: " + outputPath);
