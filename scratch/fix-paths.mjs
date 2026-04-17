import fs from 'fs';
import path from 'path';

const SRC_DIR = 'witcher-compendium/assets/BESTIARIO/MOSTRI';
const DEST_DIR = 'witcher-compendium/images';
const PROTECTED = ['Armatura_Vivente.webp', 'Bes.webp', 'Casglydd.webp', 'Grande_Orso.webp', 'Mari_Lwyd.webp', 'Penitente.webp'];

async function run() {
    const monsters = JSON.parse(fs.readFileSync('scratch/full_monster_list.json', 'utf8'));
    const files = fs.readdirSync(SRC_DIR);
    const toMove = files.filter(f => !PROTECTED.includes(f));

    console.log(`Moving ${toMove.length} files to ${DEST_DIR}...`);
    
    if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

    let movedCount = 0;
    for (const f of toMove) {
        const src = path.join(SRC_DIR, f);
        const dest = path.join(DEST_DIR, f);
        fs.renameSync(src, dest);
        movedCount++;
    }
    console.log(`✅ Moved ${movedCount} files.`);

    console.log('Updating JSON metadata...');
    let jsonUpdated = 0;
    for (const m of monsters) {
        if (!m.file || PROTECTED.includes(m.name.replace(/ /g, '_') + '.webp')) continue;
        
        try {
            const data = JSON.parse(fs.readFileSync(m.file, 'utf8'));
            const oldPath = `modules/witcher-compendium/assets/BESTIARIO/MOSTRI/${m.name.replace(/ /g, '_')}.webp`;
            const newPath = `modules/witcher-compendium/images/${m.name.replace(/ /g, '_')}.webp`;
            
            // Handle some variations already set incorrectly or correctly
            if (data.img.includes('assets/BESTIARIO/MOSTRI/')) {
                data.img = data.img.replace('assets/BESTIARIO/MOSTRI/', 'images/');
                fs.writeFileSync(m.file, JSON.stringify(data, null, 4), 'utf8');
                jsonUpdated++;
            }
        } catch (err) {
            console.error(`Error updating JSON for ${m.name}: ${err.message}`);
        }
    }
    console.log(`✅ Updated ${jsonUpdated} JSONs.`);
}

run();
