import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const TARGET_DIR = path.join(REPO_ROOT, 'witcher-compendium/assets/MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells');

const images = [
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/acquazzone_spell_1778447208056.png', target: 'Acquazzone.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/adenydd_spell_1778447221009.png', target: 'Adenydd.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/aenye_spell_1778447235126.png', target: 'Aenye.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/alzare_le_fiamme_spell_1778447246797.png', target: 'Alzare_le_Fiamme.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/anialwch_spell_1778447257798.png', target: 'Anialwch.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/cenlly_graig_spell_1778447269454.png', target: 'Cenlly_Graig.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/codi_bywyd_spell_1778447282448.png', target: 'Codi_Bywyd.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/comando_mentale_spell_1778447294246.png', target: 'Comando_Mentale.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/derviscio_spell_1778447307895.png', target: 'Derviscio.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/dissipazione_spell_1778447319048.png', target: 'dissipazione.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/dividere_le_acque_spell_1778447330572.png', target: 'Dividere_le_Acque.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/effetto_specchio_spell_1778447343813.png', target: 'Effetto_Specchio.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/evoca_bordone_spell_1778447355900.png', target: 'evoca_bordone.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/fascino_spell_1778447367632.png', target: 'fascino.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/folata_di_bronwyn_spell_1778447383897.png', target: 'folata_di_bronwyn.webp' },
    { src: 'C:/Users/Manuel/.gemini/antigravity/brain/0d785d82-9829-41b4-b473-7dd4eee968c4/fuoco_di_maelgar_spell_1778447397676.png', target: 'fuoco_di_maelgar.webp' }
];

async function processImages() {
    for (const img of images) {
        const dest = path.join(TARGET_DIR, img.target);
        console.log(`Processing ${img.target}...`);
        await sharp(img.src)
            .resize(512, 512)
            .webp({ quality: 85 })
            .toFile(dest);
        console.log(`Done: ${dest}`);
    }
}

processImages().catch(console.error);
