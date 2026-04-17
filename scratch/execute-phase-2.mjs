import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ASSETS_DIR = path.resolve('witcher-compendium/assets/BESTIARIO/MOSTRI');
const PROTECTED = [
    'Armatura_Vivente.webp',
    'Bes.webp',
    'Casglydd.webp',
    'Grande_Orso.webp',
    'Mari_Lwyd.webp',
    'Penitente.webp'
];

const SPECIAL_NAMES = {
    'AMALGAMA DI CORPI': 'Amalgama_di_Corpi',
    'Succube & Incubo': 'Succube_e_Incubo',
    'Lupi e Warg': 'Lupi_e_Warg',
    'Oberhasil (Silvano)': 'Oberhasil_Silvano',
    'Troll di Mahakam (Flip)': 'Troll_di_Mahakam_Flip'
};

const MANUAL_MAP = {
    'MB': 'Manuali/Tomo Base/Immagini',
    'TC': 'Manuali/Tomo del Caos/Immagini',
    'DW': 'Manuali/Diario di un Witcher/Immagini',
    'MS': 'Manuali/DLC/The-Witcher-DLC-Mostri-sulla-Strada_Estrazione/Immagini',
    'LR': 'Manuali/Libro dei Racconti/Immagini'
};

async function run() {
    const monsters = JSON.parse(fs.readFileSync('scratch/full_monster_list.json', 'utf8'));
    const reportRaw = fs.readFileSync('scratch/immagini-mostri-report.md', 'utf8');
    
    // Parse the report to get the strict selection for each monster
    const mappings = {};
    const lines = reportRaw.split('\n');
    for (const line of lines) {
        if (!line.includes('|') || line.includes('---') || line.includes('#')) continue;
        const parts = line.split('|').map(s => s.trim());
        if (parts.length < 5) continue;
        const name = parts[1];
        const regola = parts[3].replace(/\*\*/g, '');
        const imgSelezionata = parts[4];
        
        if (regola === 'NOME' || regola === 'PAGINA') {
            if (!mappings[name]) {
                mappings[name] = imgSelezionata;
            }
        }
    }

    const processed = new Set();
    const results = {
        success: 0,
        failed: [],
        skipped: 0,
        jsonUpdated: 0
    };

    if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

    for (const m of monsters) {
        if (processed.has(m.name)) {
            results.skipped++;
            continue;
        }
        
        const finalBaseName = (SPECIAL_NAMES[m.name] || m.name.replace(/ /g, '_'));
        const finalWebpName = finalBaseName + '.webp';
        
        if (PROTECTED.includes(finalWebpName)) {
            console.log(`[PROTECTED] ${m.name} -> ${finalWebpName} (Confirmed skipped)`);
            processed.add(m.name);
            continue;
        }

        let sourceFile = mappings[m.name];
        if (m.name === 'Armatura Marionetta' || m.name === 'La Damigella Circondata di Farfalle') {
            sourceFile = 'Pag154_PNG_01.png';
        }

        if (!sourceFile || sourceFile === 'NESSUNA IMMAGINE TROVATA') {
            results.failed.push({ name: m.name, reason: 'Nessuna immagine associata nel report' });
            processed.add(m.name);
            continue;
        }

        const parts = (m.sourceFull || '').split(' ');
        const code = parts[0];
        const imgDir = MANUAL_MAP[code];
        
        if (!imgDir) {
            results.failed.push({ name: m.name, reason: `Codice manuale sconosciuto: ${code}` });
            processed.add(m.name);
            continue;
        }

        const fullSourcePath = path.resolve(path.join(imgDir, sourceFile));
        const targetPath = path.join(ASSETS_DIR, finalWebpName);

        if (!fs.existsSync(fullSourcePath)) {
            results.failed.push({ name: m.name, reason: `File sorgente non trovato: ${fullSourcePath}` });
            processed.add(m.name);
            continue;
        }

        // 1. Convert
        console.log(`Converting: ${m.name} -> ${finalWebpName}`);
        const r = spawnSync('cmd', ['/c', 'npx', '-y', 'cwebp-bin', '-q', '80', fullSourcePath, '-o', targetPath], {
            stdio: 'pipe',
            encoding: 'utf8'
        });

        if (r.status !== 0 || !fs.existsSync(targetPath) || fs.statSync(targetPath).size === 0) {
            const err = r.stderr || (r.error ? r.error.message : 'Unknown error');
            results.failed.push({ name: m.name, reason: `Conversione fallita: ${err}` });
            processed.add(m.name);
            continue;
        }
        results.success++;

        // 2. Update JSON (Integrity check passed)
        try {
            const data = JSON.parse(fs.readFileSync(m.file, 'utf8'));
            data.img = `modules/witcher-compendium/assets/BESTIARIO/MOSTRI/${finalWebpName}`;
            fs.writeFileSync(m.file, JSON.stringify(data, null, 4), 'utf8');
            results.jsonUpdated++;
        } catch (err) {
            results.failed.push({ name: m.name, reason: `Errore JSON: ${err.message}` });
        }

        processed.add(m.name);
    }

    console.log('\n--- FINAL REPORT ---');
    console.log(`✅ Convertiti: ${results.success}`);
    console.log(`🔒 Protetti saltati: ${PROTECTED.length} (Confermato)`);
    console.log(`📝 JSON aggiornati: ${results.jsonUpdated}`);
    console.log(`❌ Falliti: ${results.failed.length}`);
    results.failed.forEach(f => console.log(` - ${f.name}: ${f.reason}`));
}

run();
