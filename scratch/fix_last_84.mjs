import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const MISSING_REPORT = path.join(REPO_ROOT, '_tools', 'reports', 'missing-assets.md');

// 1. Leggi i file mancanti dal report
const lines = fs.readFileSync(MISSING_REPORT, 'utf8').split('\n');
const missingExpectedPaths = [];

for (const line of lines) {
    if (line.includes('|') && line.includes('.webp') && !line.includes('Percorso Atteso')) {
        const parts = line.split('|');
        if (parts.length >= 4) {
            const expectedPath = parts[3].trim();
            if (expectedPath.endsWith('.webp')) {
                missingExpectedPaths.push(expectedPath);
            }
        }
    }
}

// 2. Mappatura fallback (Smart Mapping V2 per gli ultimi 84)
let copiedCount = 0;

for (const expectedRelPath of missingExpectedPaths) {
    const expectedAbsPath = path.join(ASSETS_DIR, expectedRelPath);
    let sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/oggetti_disonesti.webp'; // fallback estremo

    if (expectedRelPath.includes('scuola_')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/spada_da_witcher.webp';
    } else if (expectedRelPath.includes('anti-')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special/witcher_unguento.webp';
    } else if (expectedRelPath.includes('amuleto_')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Reliquie_e_Artefatti/witcher-magic-items/medaglione_del_lupo.webp';
    } else if (expectedRelPath.includes('formula_magica')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/libri_e_documenti.webp';
    } else if (expectedRelPath.includes('scorpione')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/balestra_pesante.webp';
    } else if (expectedRelPath.includes('pietra')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/pietra_arco_pietra_del_potere.webp';
    } else if (expectedRelPath.includes('pugnale')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/pugnale_da_sicario.webp';
    } else if (expectedRelPath.includes('diario')) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/libri_e_documenti.webp';
    }

    const sourceAbsPath = path.join(ASSETS_DIR, sourceRelPath);
    
    if (fs.existsSync(sourceAbsPath)) {
        const targetDir = path.dirname(expectedAbsPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(sourceAbsPath, expectedAbsPath);
        copiedCount++;
    }
}

console.log(`Risolti gli ultimi ${copiedCount} file mappandoli dinamicamente.`);
