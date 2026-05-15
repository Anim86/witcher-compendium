import fs from 'fs';
import path from 'path';

const baseDir = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Professioni_e_Abilita';
const dirs = [
    path.join(baseDir, 'witcher-professions'),
    path.join(baseDir, 'witcher-dlc-np-professions')
];
const outputFilePath = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\TO DO\\report_classi.md';

let files = [];
for (const d of dirs) {
    if (fs.existsSync(d)) {
        files = files.concat(fs.readdirSync(d).filter(f => f.endsWith('.json')).map(f => path.join(d, f)));
    }
}

let md = `# Compendio delle Classi (Professioni e PNG)\n\n`;

// Table Header
md += `| Classe | Abilità Definente | Percorso 1 | Percorso 2 | Percorso 3 | Abilità di Professione |\n`;
md += `|---|---|---|---|---|---|\n`;

const classesData = [];

for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    classesData.push(data);
    
    const name = data.name;
    const sys = data.system;
    
    const defSkill = sys.definingSkill && sys.definingSkill.skillName ? `${sys.definingSkill.skillName} (${sys.definingSkill.stat || '-'})` : 'N/D';
    
    const getPath = (pathObj) => {
        if (!pathObj || !pathObj.pathName) return 'N/D';
        return `**${pathObj.pathName}**<br>1. ${pathObj.skill1?.skillName || 'N/D'}<br>2. ${pathObj.skill2?.skillName || 'N/D'}<br>3. ${pathObj.skill3?.skillName || 'N/D'}`;
    };

    const path1 = getPath(sys.skillPath1);
    const path2 = getPath(sys.skillPath2);
    const path3 = getPath(sys.skillPath3);
    
    const profSkills = sys.professionSkills ? sys.professionSkills.replace(/\|/g, ', ') : 'N/D';
    
    md += `| **${name}** | ${defSkill} | ${path1} | ${path2} | ${path3} | ${profSkills} |\n`;
}

md += `\n## Dettaglio Classi\n\n`;

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
}

for (const data of classesData) {
    const name = data.name;
    const sys = data.system;
    
    md += `### ${name}\n\n`;
    if (sys.notes) {
        md += `*${stripHtml(sys.notes)}*\n\n`;
    }
    
    if (sys.definingSkill && sys.definingSkill.skillName) {
        md += `**Abilità Definente: ${sys.definingSkill.skillName} (${sys.definingSkill.stat || '-'})**\n`;
        md += `${stripHtml(sys.definingSkill.definition)}\n\n`;
    }
    
    const renderPath = (pathObj) => {
        if (!pathObj || !pathObj.pathName) return;
        md += `#### Percorso: ${pathObj.pathName}\n`;
        
        [pathObj.skill1, pathObj.skill2, pathObj.skill3].forEach((skill, idx) => {
            if (skill && skill.skillName) {
                md += `- **${skill.skillName} (${skill.stat || '-'})**: ${stripHtml(skill.definition)}\n`;
            }
        });
        md += `\n`;
    };
    
    renderPath(sys.skillPath1);
    renderPath(sys.skillPath2);
    renderPath(sys.skillPath3);
    
    md += `---\n\n`;
}

fs.writeFileSync(outputFilePath, md, 'utf8');
console.log(`Report generated successfully at ${outputFilePath}`);
