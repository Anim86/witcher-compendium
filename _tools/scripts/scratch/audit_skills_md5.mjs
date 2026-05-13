import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const assetsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills';
const skillsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills';

const hashes = {};
const duplicates = new Set();

const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.webp'));

files.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(content).digest('hex');
    
    if (!hashes[hash]) {
        hashes[hash] = [];
    }
    hashes[hash].push(file);
});

Object.values(hashes).forEach(group => {
    if (group.length > 1) {
        group.forEach(f => duplicates.add(f));
    }
});

// Now map back to skill names
const skillFiles = fs.readdirSync(skillsDir).filter(f => f.endsWith('.json'));
const skillList = [];

skillFiles.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(skillsDir, file), 'utf8'));
    const name = content.name;
    const imgPath = content.img;
    const imgFilename = path.basename(imgPath);
    
    skillList.push({ name, imgFilename });
});

skillList.sort((a, b) => a.name.localeCompare(b.name));

skillList.forEach(skill => {
    const isDuplicate = duplicates.has(skill.imgFilename);
    console.log(`- ${skill.name}${isDuplicate ? ' (duplicato)' : ''}`);
});
