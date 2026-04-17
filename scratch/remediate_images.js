const fs = require('fs');
const path = require('path');
// Import sharp from the specified node_modules path
const sharp = require('e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/node_modules/sharp');

const monsters = [
    { name: 'Arachas', p: 296 },
    { name: 'Drowner', p: 276 },
    { name: 'Ghoul', p: 278 },
    { name: 'Golem', p: 298 },
    { name: 'Grifoni', p: 292 },
    { name: 'Katakan', p: 308 },
    { name: 'Lupi e Warg', p: 286 },
    { name: 'Lupi Mannari', p: 288 },
    { name: 'Nekker', p: 302 },
    { name: 'Sirene', p: 290 },
    { name: 'Streghe dei Sepolcri', p: 280 },
    { name: 'Troll di Roccia', p: 304 },
    { name: 'Viverne', p: 306 },
    { name: 'Wraith', p: 282 },
    { name: 'Wraith Diurni', p: 284 },
    { name: 'Demoni', p: 300 },
    { name: 'Endriaghe', p: 294 },
    { name: 'Banditi', p: 270 },
    { name: 'Arcieri Scoia\'tael', p: 274 }
];

const srcDir = 'Manuali/Tomo Base/Immagini';
const destDir = 'antigravity/images';

async function processMonsters() {
    let successCount = 0;
    let totalSize = 0;
    const missing = [];

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    for (const m of monsters) {
        const pdfPage = m.p + 2;
        const prefix = `Pag${pdfPage.toString().padStart(3, '0')}`;
        
        try {
            const files = fs.readdirSync(srcDir).filter(f => f.startsWith(prefix) && f.endsWith('_02.png'));
            
            if (files.length === 0) {
                console.log(`[MISSING] ${m.name}: No _02.png found for Pag${pdfPage}`);
                missing.push(m.name);
                continue;
            }

            const srcFile = path.join(srcDir, files[0]);
            const destName = m.name.replace(/\s+/g, '_').replace(/'/g, '_') + '.webp';
            const destFile = path.join(destDir, destName);

            console.log(`[CONVERTING] ${m.name} (${files[0]}) -> ${destName}`);
            
            await sharp(srcFile)
                .webp({ lossless: true })
                .toFile(destFile);

            const stats = fs.statSync(destFile);
            totalSize += stats.size;
            successCount++;

        } catch (err) {
            console.error(`[ERROR] ${m.name}:`, err.message);
            missing.push(m.name);
        }
    }

    console.log('\n--- FINAL REPORT ---');
    console.log(`Successfully converted: ${successCount} / ${monsters.length}`);
    if (successCount > 0) {
        const avgSizeKB = (totalSize / successCount / 1024).toFixed(2);
        console.log(`Average file size: ${avgSizeKB} KB`);
    }
    if (missing.length > 0) {
        console.log(`Missing or failed: ${missing.join(', ')}`);
    }
}

processMonsters();
