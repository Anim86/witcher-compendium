import fs from 'fs';
import path from 'path';

const SRC_BASE = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/BESTIARIO';
const MONSTERS_DIR = path.join(SRC_BASE, 'Mostri/witcher-monsters');
const ANIMALS_DIR = path.join(SRC_BASE, 'Animali/witcher-animals');

const ASSETS_PREFIX = 'modules/witcher-compendium/assets/BESTIARIO';

// 1. Aggiorna Animali
const animalFiles = fs.readdirSync(ANIMALS_DIR).filter(f => f.endsWith('.json'));
for (const file of animalFiles) {
    const filePath = path.join(ANIMALS_DIR, file);
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const name = data.name.toLowerCase().replace(/ /g, '_');
    
    // Gli animali spostati erano bue, cane, cavallo, cavallo_da_guerra, gatto, mulo, serpente, uccello (.png)
    // E cinghiale, pantera, orso, grande_orso (.webp)
    const pngAnimals = ['bue', 'cane', 'cavallo', 'cavallo_da_guerra', 'gatto', 'mulo', 'serpente', 'uccello'];
    const ext = pngAnimals.includes(name) ? 'png' : 'webp';
    
    data.img = `${ASSETS_PREFIX}/Animali/witcher-animals/${name}.${ext}`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

// 2. Aggiorna i 3 Mostri DLC
const dlcMonsters = ['alp', 'gatto_mannaro', 'glustyworp'];
for (const mId of dlcMonsters) {
    const files = fs.readdirSync(MONSTERS_DIR).filter(f => f.toLowerCase().startsWith(mId) && f.endsWith('.json'));
    for (const file of files) {
        const filePath = path.join(MONSTERS_DIR, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        data.img = `${ASSETS_PREFIX}/Mostri/witcher-monsters/${mId}.png`;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    }
}

// 3. Fix Oberhasil (Silvano)
const oberFiles = fs.readdirSync(MONSTERS_DIR).filter(f => f.toLowerCase().includes('oberhasil') && f.endsWith('.json'));
for (const file of oberFiles) {
    const filePath = path.join(MONSTERS_DIR, file);
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.img = `${ASSETS_PREFIX}/Mostri/witcher-monsters/silvano_oberhasil.webp`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

console.log('✅ JSON Image Paths updated!');
