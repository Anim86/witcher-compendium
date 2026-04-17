import fs from 'fs';
import path from 'path';

try {
    const monsters = JSON.parse(fs.readFileSync('scratch/full_monster_list.json', 'utf8'));
    const assetsDir = 'witcher-compendium/assets/BESTIARIO/MOSTRI';
    const existingAssets = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

    const manualImagesMap = {
        'MB': 'Manuali/Tomo Base/Immagini',
        'TC': 'Manuali/Tomo del Caos/Immagini',
        'DW': 'Manuali/Diario di un Witcher/Immagini',
        'MS': 'Manuali/DLC/The-Witcher-DLC-Mostri-sulla-Strada_Estrazione/Immagini',
        'LR': 'Manuali/Libro dei Racconti/Immagini'
    };

    const report = [];

    for (const m of monsters) {
        const parts = (m.sourceFull || '').split(' ');
        const code = parts[0] || '??';
        const page = parseInt(parts[1]);
        const monsterIdName = m.name.toLowerCase();
        
        const imgDir = manualImagesMap[code];
        let foundMatch = false;
        
        if (imgDir && fs.existsSync(imgDir)) {
            const allFiles = fs.readdirSync(imgDir);
            
            // Rule 1: Name Match (Priority 1) - Search all files in that manual
            const nameMatches = allFiles.filter(f => f.toLowerCase().includes(monsterIdName));
            if (nameMatches.length > 0) {
                const imgName = nameMatches[0]; // Take first match for NOME rule
                report.push({
                    name: m.name,
                    source: m.sourceFull,
                    regola: 'NOME',
                    img: imgName,
                    note: 'ILLUSTRAZIONE',
                    inAssets: existingAssets.includes(m.name.replace(/ /g, '_') + '.webp') ? 'SÌ' : 'NO'
                });
                foundMatch = true;
            }

            // Rule 2: Exact Page Match (Priority 2) - Fallback
            if (!foundMatch && !isNaN(page)) {
                const pageStr = page.toString().padStart(3, '0');
                const pageMatches = allFiles.filter(f => f.includes('Pag' + pageStr) || f.includes('Pag' + page));
                
                if (pageMatches.length > 0) {
                    // Show max 3 options
                    pageMatches.slice(0, 3).forEach(imgName => {
                        let note = 'ALTRO';
                        const lowerImg = imgName.toLowerCase();
                        if (lowerImg.includes('png') || lowerImg.includes('mostri') || lowerImg.includes('creature')) {
                            note = 'ILLUSTRAZIONE';
                        } else if (lowerImg.includes('mappe') || lowerImg.includes('scenario') || lowerImg.includes('ambiente')) {
                            note = 'MAPPA/SCENARIO';
                        } else if (lowerImg.includes('stats') || lowerImg.includes('statistiche') || lowerImg.includes('tabella')) {
                            note = 'STATS';
                        }
                        
                        report.push({
                            name: m.name,
                            source: m.sourceFull,
                            regola: 'PAGINA',
                            img: imgName,
                            note: note,
                            inAssets: existingAssets.includes(m.name.replace(/ /g, '_') + '.webp') ? 'SÌ' : 'NO'
                        });
                    });
                    foundMatch = true;
                }
            }
        }

        // Rule 3: No Match
        if (!foundMatch) {
            report.push({
                name: m.name,
                source: m.sourceFull,
                regola: 'NESSUNA',
                img: 'NESSUNA IMMAGINE TROVATA',
                note: '-',
                inAssets: 'NO'
            });
        }
    }

    let md = '# Report Immagini Mostri (Stretto)\n\n';
    md += '| Mostro | Sourcebook | Regola | Immagine Selezionata | Note | Già in Assets? |\n';
    md += '|---|---|---|---|---|---|\n';
    for (const r of report) {
        md += `| ${r.name} | ${r.source} | **${r.regola}** | ${r.img} | ${r.note} | ${r.inAssets} |\n`;
    }

    fs.writeFileSync('scratch/immagini-mostri-report.md', md, 'utf8');
    console.log('Strict report generated in scratch/immagini-mostri-report.md');
} catch (e) {
    console.error(e);
}
