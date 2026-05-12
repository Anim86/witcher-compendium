const fs = require('fs');
const path = require('path');
const sharp = require('e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/node_modules/sharp');

const mapping = [
    { id: 'Arachas', file: 'Pag298_Endriaghe_01.png' },
    { id: 'Drowner', file: 'Pag278_Arcieri Scoia’tael_01.png' },
    { id: 'Ghoul', file: 'Pag280_Drowner_01.png' },
    { id: 'Golem', file: 'Pag300_Arachas_01.png' },
    { id: 'Grifoni', file: 'Pag294_Sirene_01.png' },
    { id: 'Katakan', file: 'Pag310_Viverne_01.png' },
    { id: 'Lupi_e_Warg', file: 'Pag288_Wraith Diurni_01.png' },
    { id: 'Lupi_Mannari', file: 'Pag290_Lupi e Warg_01.png' },
    { id: 'Nekker', file: 'Pag304_Demoni_01.png' },
    { id: 'Sirene', file: 'Pag292_Lupi Mannari_01.png' },
    { id: 'Streghe_dei_Sepolcri', file: 'Pag282_Ghoul_01.png' },
    { id: 'Troll_di_Roccia', file: 'Pag306_Nekker_01.png' },
    { id: 'Viverne', file: 'Pag308_Troll di Roccia_01.png' },
    { id: 'Wraith', file: 'Pag284_Streghe dei Sepolcri_01.png' },
    { id: 'Wraith_Diurni', file: 'Pag286_Wraith_01.png' },
    { id: 'Demoni', file: 'Pag302_Golem_01.png' },
    { id: 'Endriaghe', file: 'Pag296_Grifoni_02.png' }, // User Manual Correction
    { id: 'Banditi', file: 'Pag272_Tipologie di Mostro_01.png' },
    { id: 'Arcieri_Scoia’tael', file: 'Pag276_Maghi_01.png' }
];

const srcDir = 'Manuali/Tomo Base/Immagini';
const destDir = 'images';

async function finalizeRemediation() {
    let successCount = 0;
    let totalSize = 0;
    const failures = [];

    console.log('--- STARTING FINAL REMEDIATION ---');

    for (const m of mapping) {
        const srcFile = path.join(srcDir, m.file);
        const destFile = path.join(destDir, m.id + '.webp');

        if (!fs.existsSync(srcFile)) {
            console.error(`[ERROR] Source not found: ${m.file}`);
            failures.push(m.id);
            continue;
        }

        try {
            console.log(`[CONVERTING] ${m.file} -> ${m.id}.webp`);
            
            await sharp(srcFile)
                .webp({ lossless: true })
                .toFile(destFile);

            const stats = fs.statSync(destFile);
            totalSize += stats.size;
            successCount++;
        } catch (err) {
            console.error(`[ERROR] Processing ${m.id}:`, err.message);
            failures.push(m.id);
        }
    }

    console.log('\n--- EXECUTION SUMMARY ---');
    console.log(`Successfully updated: ${successCount} / ${mapping.length}`);
    if (successCount > 0) {
        console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`Average size: ${(totalSize / successCount / 1024).toFixed(2)} KB`);
    }
    if (failures.length > 0) {
        console.error(`Failed: ${failures.join(', ')}`);
    }
}

finalizeRemediation();
