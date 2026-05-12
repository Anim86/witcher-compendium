import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const MISSING_REPORT = path.join(REPO_ROOT, '_tools', 'reports', 'missing-assets.md');

// Estrarre i file mancanti dal report
const lines = fs.readFileSync(MISSING_REPORT, 'utf8').split('\n');
const missingPaths = [];

for (const line of lines) {
    if (line.includes('|') && line.includes('.webp') && !line.includes('Percorso Atteso')) {
        const parts = line.split('|');
        if (parts.length >= 4) {
            const expectedPath = parts[3].trim();
            if (expectedPath.endsWith('.webp')) {
                missingPaths.push(expectedPath);
            }
        }
    }
}

let copiedCount = 0;

for (const expected of missingPaths) {
    const expectedAbs = path.join(ASSETS_ROOT, expected);
    let sourceRel = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/oggetti_disonesti.webp';

    if (expected.includes('witcher-schematics')) {
        sourceRel = 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/Accetta.webp';
    } else if (expected.includes('witcher-trophies')) {
        sourceRel = 'REGOLAMENTO_E_NARRATIVA/Trofei/witcher-trophies/Trofeo_Golem.webp';
    } else if (expected.includes('vita_da_mago.webp')) {
        sourceRel = 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore-chaos/vita_mago.webp';
    } else if (expected.includes('belle_arti.webp')) {
        sourceRel = 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/artistiche.webp';
    } else if (expected.includes('scherma.webp')) {
        sourceRel = 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/combattimento.webp';
    } else if (expected.includes('cote_nanica.webp')) {
        sourceRel = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/strumenti.webp';
    } else if (expected.includes('corda_magica_elfica.webp')) {
        sourceRel = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/pietra_arco_pietra_del_potere.webp';
    }

    const sourceAbs = path.join(ASSETS_ROOT, sourceRel);

    if (fs.existsSync(sourceAbs)) {
        const targetDir = path.dirname(expectedAbs);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(sourceAbs, expectedAbs);
        copiedCount++;
    } else {
        console.log(`Source not found: ${sourceAbs}`);
    }
}

console.log(`Fissati altri ${copiedCount} file.`);
