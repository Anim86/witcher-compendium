import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ANALYSIS_FILE = path.join(REPO_ROOT, 'scratch', 'missing_analysis.json');
const OUTPUT_FILE = path.join(REPO_ROOT, 'scratch', 'notebooklm_lista_mancanti.md');

const data = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));
const missingItems = data.completelyMissing;

// Raggruppiamo per categoria (usando la prima parte del path expected)
const categorie = {};

for (const item of missingItems) {
    const parts = item.expected.split('/');
    // Es. MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells/Acquazzone.webp
    // Prendo "MAGIA_E_MALEDIZIONI - witcher-spells"
    let catName = "Altro";
    if (parts.length >= 3) {
        catName = `${parts[0]} (${parts[2]})`;
    }
    
    if (!categorie[catName]) {
        categorie[catName] = [];
    }
    categorie[catName].push(item.name);
}

let mdContent = `# Lista Elementi Mancanti per NotebookLM\n\n`;
mdContent += `Ecco la lista dei 196 elementi mancanti, divisi per categoria. Puoi passare questa lista a NotebookLM chiedendogli di generare per ciascuno una breve descrizione visiva basata sui manuali.\n\n`;

for (const [cat, items] of Object.entries(categorie)) {
    mdContent += `## ${cat}\n`;
    for (const itemName of items) {
        mdContent += `- ${itemName}\n`;
    }
    mdContent += `\n`;
}

fs.writeFileSync(OUTPUT_FILE, mdContent, 'utf8');
console.log(`Lista generata con successo in: ${OUTPUT_FILE}`);
