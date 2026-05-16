const fs = require('fs');
const path = require('path');

const monstersDir = path.join(__dirname, '..', 'src-packs', 'BESTIARIO', 'witcher-monsters');
const outputFile = path.join(__dirname, '..', '..', 'TO DO', 'report_mostri.md');

const files = fs.readdirSync(monstersDir).filter(f => f.endsWith('.json'));

const monsters = [];

for (const file of files) {
    const filePath = path.join(monstersDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        const name = data.name || 'Sconosciuto';
        const system = data.system || {};
        
        // Stats
        const stats = system.stats || {};
        let statsPresent = false;
        for (const key in stats) {
            if (stats[key] && stats[key].value > 0) {
                statsPresent = true;
                break;
            }
        }
        
        // Derived
        const derived = system.derivedStats || {};
        let derivedPresent = false;
        for (const key in derived) {
            if (derived[key] && derived[key].value > 0) {
                derivedPresent = true;
                break;
            }
        }
        
        // Skills
        const skills = system.skills || {};
        let skillCount = 0;
        for (const statKey in skills) {
            const statSkills = skills[statKey];
            if (typeof statSkills === 'object') {
                for (const skName in statSkills) {
                    if (statSkills[skName] && statSkills[skName].value > 0) {
                        skillCount++;
                    }
                }
            }
        }
        
        // Items
        const items = data.items || [];
        const weapons = [];
        const abilities = [];
        for (const item of items) {
            if (item.type === 'weapon') {
                weapons.push(item.name);
            } else if (item.type === 'ability') {
                abilities.push(item.name);
            }
        }
        
        monsters.push({
            name,
            stats: statsPresent ? '✅' : '❌',
            derived: derivedPresent ? '✅' : '❌',
            skills: skillCount,
            weapons: weapons.length > 0 ? weapons.join(', ') : '-',
            abilities: abilities.length > 0 ? abilities.join(', ') : '-'
        });
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
}

monsters.sort((a, b) => a.name.localeCompare(b.name));

let markdown = '# Report Mostri\n\n';
markdown += '| Mostro | Statistiche | Stat Derivate | N° Abilità (Skills) | Armi/Attacchi | Capacità (Abilities) |\n';
markdown += '|---|---|---|---|---|---|\n';
for (const m of monsters) {
    markdown += `| **${m.name}** | ${m.stats} | ${m.derived} | ${m.skills} | ${m.weapons} | ${m.abilities} |\n`;
}

fs.writeFileSync(outputFile, markdown, 'utf-8');
console.log(`Report generato in ${outputFile}`);
