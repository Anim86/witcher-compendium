const fs = require('fs');
const path = require('path');

// 1. Leggi tutti gli item mancanti
const missingReport = JSON.parse(fs.readFileSync('scratch/global_missing_icons_report.json', 'utf8'));

// 2. Trova quali item sono già coperti dai file html esistenti
const scratchDir = 'scratch';
const files = fs.readdirSync(scratchDir);
const existingHtmls = files.filter(f => f.startsWith('prompts_batch_') && f.endsWith('.html'));

const coveredFilenames = new Set();
for (const file of existingHtmls) {
    const content = fs.readFileSync(path.join(scratchDir, file), 'utf8');
    const matches = content.matchAll(/Nome file: <strong>(.*?)<\/strong>/g);
    for (const match of matches) {
        coveredFilenames.add(match[1]);
    }
}

// 3. Filtra gli item mancanti che non sono ancora coperti
let remainingItems = [];
for (const item of missingReport) {
    let expectedPng;
    if (item.expected) {
        expectedPng = path.basename(item.expected).replace('.webp', '.png');
    } else {
        expectedPng = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '.png';
    }
    
    // Ignora i placeholder SVG
    if (expectedPng.endsWith('.svg')) continue;
    if (expectedPng === "mystery-man.png") continue;

    if (!coveredFilenames.has(expectedPng)) {
        remainingItems.push({
            name: item.name,
            filename: expectedPng,
            pack: item.pack
        });
    }
}

console.log(`Missing items not covered by any HTML batch: ${remainingItems.length}`);

// 4. Dividi in batch da 20 e crea i file HTML
const BATCH_SIZE = 20;
let currentBatchNumber = 39; // Parti dal 39
let batches = [];

for (let i = 0; i < remainingItems.length; i += BATCH_SIZE) {
    const batch = remainingItems.slice(i, i + BATCH_SIZE);
    batches.push({
        number: currentBatchNumber,
        items: batch
    });
    
    let htmlContent = `<!DOCTYPE html>\n<html lang="it">\n<head>\n    <meta charset="UTF-8">\n    <title>Prompts Batch ${currentBatchNumber} - Witcher Compendium</title>\n`;
    htmlContent += `    <style>\n        body { font-family: sans-serif; background: #1a1a1a; color: #e0e0e0; padding: 20px; }\n`;
    htmlContent += `        .item { background: #2a2a2a; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 5px solid #2196f3; }\n`;
    htmlContent += `        .name { font-weight: bold; color: #ff9800; font-size: 1.2em; }\n`;
    htmlContent += `        .meta { color: #bbb; font-size: 0.9em; }\n`;
    htmlContent += `        .prompt-box { background: #111; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; border: 1px solid #444; }\n`;
    htmlContent += `        button { background: #2196f3; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }\n`;
    htmlContent += `        .path-info { color: #4caf50; font-family: monospace; font-weight: bold; margin-bottom: 5px; }\n    </style>\n</head>\n<body>\n`;
    
    htmlContent += `    <h1>Prompts Batch ${currentBatchNumber}</h1>\n`;
    
    const samplePack = batch[0].pack.split('\\').pop();
    htmlContent += `    <p>Target folder: <strong>temp_images/${samplePack}/</strong></p>\n\n`;

    for (const item of batch) {
        const folderName = item.pack.split('\\').pop();
        const cleanName = item.name.replace(/['"]/g, "");
        const basePrompt = `Digital painting viewed from directly above, top-down perspective, a ${cleanName.toLowerCase()} lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.`;
        const escapedPrompt = basePrompt.replace(/'/g, "\\'");
        
        htmlContent += `    <div class="item">\n`;
        htmlContent += `        <div class="name">${item.name}</div>\n`;
        htmlContent += `        <div class="meta">Nome file: <strong>${item.filename}</strong></div>\n`;
        htmlContent += `        <div class="path-info">Salva in: temp_images/${folderName}/</div>\n`;
        htmlContent += `        <div class="prompt-box" id="p-${item.filename}">${basePrompt}</div>\n`;
        htmlContent += `        <button onclick="copyToClipboard('${escapedPrompt}', this)">Copia Prompt</button>\n`;
        htmlContent += `    </div>\n`;
    }

    htmlContent += `    <script>\n        function copyToClipboard(text, btn) {\n`;
    htmlContent += `            navigator.clipboard.writeText(text).then(() => {\n`;
    htmlContent += `                btn.innerText = "Copiato!";\n`;
    htmlContent += `                setTimeout(() => { btn.innerText = "Copia Prompt"; }, 2000);\n`;
    htmlContent += `            });\n        }\n    </script>\n</body>\n</html>`;

    fs.writeFileSync(`scratch/prompts_batch_${currentBatchNumber}.html`, htmlContent, 'utf8');
    currentBatchNumber++;
}

// 5. Crea file testuale con i prompt divisi in blocchi per NotebookLM
let markdownContent = `# Prompts per NotebookLM (Batches Rimasti)\n\nQuesto file contiene i prompt da incollare in NotebookLM per riformulare le descrizioni in inglese, divisi in blocchi gestibili (circa 60 item per blocco).\n\n`;
markdownContent += `## Regole Generali (Invia queste regole con il primo blocco)\n\n`;
markdownContent += `Sei un esperto dell'universo di The Witcher. Per i seguenti elementi, crea un prompt di generazione immagine sostituendo la parte "a [NOME]" con una descrizione visiva precisa, dettagliata e coerente con la lore di The Witcher, scritta rigorosamente in INGLESE.\n`;
markdownContent += `Mantieni intatta la struttura iniziale ("Digital painting viewed from directly above, top-down perspective, ") e finale (" lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus."). \n`;
markdownContent += `Se è una magia/incantesimo astratto (es. "Acquazzone"), rendilo fisico (es. un tomo magico aperto, una runa, una pergamena). Se è un oggetto fisico, descrivine i materiali e le incisioni.\n\n---\n\n`;

for (let i = 0; i < batches.length; i += 3) {
    const chunk = batches.slice(i, i + 3);
    const startBatch = chunk[0].number;
    const endBatch = chunk[chunk.length - 1].number;
    
    markdownContent += `### Blocco: Batch ${startBatch} - ${endBatch}\n\n`;
    markdownContent += `Copia e incolla in NotebookLM:\n\n`;
    markdownContent += `\`\`\`text\nForniscimi il nuovo prompt completo per ciascuno dei seguenti elementi mantenendo le regole stabilite (sostituendo il nome con una descrizione in inglese di una natura morta dark fantasy vista dall'alto).\n\n`;
    
    for (const b of chunk) {
        markdownContent += `**Batch ${b.number}:**\n`;
        for (const item of b.items) {
            markdownContent += `- ${item.name}\n`;
        }
        markdownContent += `\n`;
    }
    markdownContent += `\`\`\`\n\n---\n\n`;
}

fs.writeFileSync('scratch/notebooklm_prompts_to_process.md', markdownContent, 'utf8');
console.log(`Generated ${batches.length} HTML batch files and scratch/notebooklm_prompts_to_process.md`);
