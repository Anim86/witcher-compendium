import fs from 'fs';
import path from 'path';

const skillsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills';
const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.json'));

const skills = [];
const imgCounts = {};

files.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(skillsDir, file), 'utf8'));
    const name = content.name;
    const img = content.img;
    
    skills.push({ name, img });
    
    if (img) {
        imgCounts[img] = (imgCounts[img] || 0) + 1;
    }
});

// Sort by name
skills.sort((a, b) => a.name.localeCompare(b.name));

skills.forEach(skill => {
    const isDuplicate = imgCounts[skill.img] > 1;
    console.log(`- ${skill.name}${isDuplicate ? ' (duplicato)' : ''} [${skill.img}]`);
});
