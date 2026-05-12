const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Manuel\\.gemini\\antigravity\\brain\\a3071980-f5ef-433f-af1f-e5bad12c6b5e';
const baseTargetDir = path.join(process.cwd(), 'temp_images');

const files = fs.readdirSync(brainDir);
const mappings = {
    'stanza_in_locanda_di_qualita': 'witcher-equipment/stanza_in_locanda_di_qualita.png',
    'amuleto_incantato': 'witcher-magic-items/amuleto_incantato.png',
    'corda_elfica_magica': 'witcher-magic-items/corda_elfica_magica.png',
    'formula_magica': 'witcher-magic-items/formula_magica.png',
    'barca_a_vela': 'witcher-transports/barca_a_vela.png',
    'bardatura_di_cuoio': 'witcher-transports/bardatura_di_cuoio.png',
    'bardatura_di_maglia_di_ferro': 'witcher-transports/bardatura_di_maglia_di_ferro.png',
    'bisacce_militari': 'witcher-transports/bisacce_militari.png',
    'carrozza': 'witcher-transports/carrozza.png',
    'cutter_barca': 'witcher-transports/cutter_barca.png',
    'nave_a_vela': 'witcher-transports/nave_a_vela.png',
    'paraocchi_da_corsa': 'witcher-transports/paraocchi_da_corsa.png',
    'paraocchi': 'witcher-transports/paraocchi.png',
    'sella_da_cavalleria': 'witcher-transports/sella_da_cavalleria.png',
    'sella_da_corsa': 'witcher-transports/sella_da_corsa.png',
    'amplificatore': '_review_orphans/amplificatore.png',
    'anello_del_favore': '_review_orphans/anello_del_favore.png'
};

// Sort keys by length descending to avoid partial matches (like paraocchi vs paraocchi_da_corsa)
const sortedKeys = Object.keys(mappings).sort((a, b) => b.length - a.length);

files.forEach(file => {
    for (const key of sortedKeys) {
        if (file.startsWith(key + '_') && file.endsWith('.png')) {
            const targetPath = mappings[key];
            const src = path.join(brainDir, file);
            const fullTargetPath = path.join(baseTargetDir, targetPath);
            const targetDir = path.dirname(fullTargetPath);
            
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            console.log(`Copying ${file} -> ${targetPath}`);
            fs.copyFileSync(src, fullTargetPath);
            break;
        }
    }
});
