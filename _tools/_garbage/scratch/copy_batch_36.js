const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Manuel\\.gemini\\antigravity\\brain\\a3071980-f5ef-433f-af1f-e5bad12c6b5e';
const targetDir = path.join(process.cwd(), 'temp_images', 'witcher-weapons');

const files = fs.readdirSync(brainDir);
const mappings = {
    'morte_rossa': 'morte_rossa.png',
    'munizioni_bodkin': 'munizioni_bodkin.png',
    'munizioni_da_impatto_naniche': 'munizioni_da_impatto_naniche.png',
    'munizioni_esplosive': 'munizioni_esplosive.png',
    'munizioni_multiple': 'munizioni_multiple.png',
    'munizioni_punta_larga': 'munizioni_punta_larga.png',
    'munizioni_smussate': 'munizioni_smussate.png',
    'munizioni_sventratrici_elfiche': 'munizioni_sventratrici_elfiche.png',
    'munizioni_traccianti': 'munizioni_traccianti.png',
    'pala': 'pala.png',
    'pietra_arco': 'pietra_arco.png',
    'pietra_guardiana_arco': 'pietra_guardiana_arco.png',
    'pugnale_di_diaspro_sanguigno': 'pugnale_di_diaspro_sanguigno.png',
    'rete_con_pesi': 'rete_con_pesi.png',
    'rete_per_mostri': 'rete_per_mostri.png',
    'scorpione': 'scorpione.png',
    'spada_dacciaio_della_lumaca': 'spada_dacciaio_della_lumaca.png'
};

files.forEach(file => {
    for (const [key, target] of Object.entries(mappings)) {
        if (file.startsWith(key + '_') && file.endsWith('.png')) {
            const src = path.join(brainDir, file);
            const dest = path.join(targetDir, target);
            console.log(`Copying ${file} -> ${target}`);
            fs.copyFileSync(src, dest);
            break;
        }
    }
});
