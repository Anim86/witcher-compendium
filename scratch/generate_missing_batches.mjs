import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ANALYSIS_FILE = path.join(REPO_ROOT, 'scratch', 'missing_analysis.json');
const SCRATCH_DIR = path.join(REPO_ROOT, 'scratch');

const data = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));
const missingItems = data.completelyMissing;

const BATCH_SIZE = 20;
let batchNum = 64;

for (let i = 0; i < missingItems.length; i += BATCH_SIZE) {
    const chunk = missingItems.slice(i, i + BATCH_SIZE);
    
    let htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Witcher Compendium - Batch ${batchNum}</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        .prompt-container { margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px; }
        .prompt-text { background: #f4f4f4; padding: 10px; font-family: monospace; white-space: pre-wrap; }
        .filename { font-weight: bold; color: #d32f2f; }
        .expected { font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <h1>Batch ${batchNum} - Elementi Mancanti</h1>
    <p>Questo batch contiene gli asset che non erano mai stati inseriti nei batch precedenti.</p>
`;

    for (const item of chunk) {
        const expectedName = path.basename(item.expected);
        const itemName = item.name;
        
        let visualDesc = "dark fantasy style, digital painting on stone slab background";
        if (item.expected.includes("witcher-spells") || item.expected.includes("witcher-magic")) {
            visualDesc = "glowing magic spell effect or magical rune engraved on a dark stone slab, mystical atmosphere, dark fantasy style, digital painting";
        } else if (item.expected.includes("witcher-races") || item.expected.includes("witcher-skills")) {
            visualDesc = "symbolic representation of a fantasy race or skill, carved or painted on a dark stone slab, dark fantasy style, digital painting";
        } else if (item.expected.includes("witcher-critical-wounds")) {
            visualDesc = "medical illustration of a severe wound or bone fracture, drawn with blood on a dark stone slab, grim dark fantasy style, digital painting";
        }
        
        htmlContent += `
    <div class="prompt-container">
        <h3>${itemName}</h3>
        <p class="expected">Path atteso: ${item.expected}</p>
        <p class="filename">Salva il file come: ${expectedName.replace('.webp', '.png')}</p>
        <div class="prompt-text">A stylized icon representing "${itemName}". It must be depicted as a ${visualDesc}. High quality, detailed, Witcher universe aesthetic.</div>
    </div>
`;
    }

    htmlContent += `
</body>
</html>`;

    const fileName = `prompts_batch_${batchNum}.html`;
    fs.writeFileSync(path.join(SCRATCH_DIR, fileName), htmlContent);
    console.log(`Creato ${fileName} con ${chunk.length} elementi.`);
    batchNum++;
}

console.log(`\nCreati ${batchNum - 64} batch in totale (dal 64 al ${batchNum - 1}).`);
