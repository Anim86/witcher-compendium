const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/PROFESSIONI_E_ABILITA/witcher-professions';
const outputDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO';
const csvFile = path.join(outputDir, 'report_classi_compendio.csv');

// Helper to strip HTML tags
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim().replace(/"/g, '""');
}

// Helper to format CSV fields for Semicolon-Separated Values (excellent for European Excel)
function csvField(val) {
    if (val === null || val === undefined) return '""';
    // We keep newlines in fields because Excel handles multiline cells perfectly when wrapped in double quotes
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
}

function formatSkill(skill) {
    if (!skill || !skill.skillName) return '';
    const statStr = skill.stat ? ` (${skill.stat.toUpperCase()})` : '';
    return `${skill.skillName}${statStr}`;
}

const abiliMap = {
    "Armigero": [
        "Duro come una Roccia (Abilità Esclusiva)",
        "Accortezza",
        "Archi oppure Balestre oppure Armi in Asta",
        "Atletica",
        "Coraggio",
        "Eludere",
        "Mischia",
        "Prestanza",
        "Scherma",
        "Sopravvivenza",
        "Tempra"
    ],
    "Artigiano": [
        "Riparare (Abilità Esclusiva)",
        "Alchimia",
        "Atletica",
        "Belle Arti",
        "Commercio",
        "Istruzione",
        "Manifattura",
        "Persuasione",
        "Prestanza",
        "Scaltrezza",
        "Tempra"
    ],
    "Bardo": [
        "Cosmopolita (Abilità Esclusiva)",
        "Carisma",
        "Commercio",
        "Gioco d’Azzardo",
        "Istruzione",
        "Lame Corte",
        "Linguaggio (scelta 1)",
        "Linguaggio (scelta 2)",
        "Persuasione",
        "Resistere a Coercizione",
        "Scaltrezza",
        "Sensibilità",
        "(Nota: per il Bardo i Linguaggi contano come due slot separati per arrivare a 11)"
    ],
    "Criminale": [
        "Paranoia Salubre (Abilità Esclusiva)",
        "Accortezza",
        "Atletica",
        "Eludere",
        "Falsificare",
        "Intimidire",
        "Lame Corte",
        "Nascondersi",
        "Rapidità di Mano",
        "Scaltrezza",
        "Scassinare"
    ],
    "Mago": [
        "Arte del Mago (Abilità Esclusiva)",
        "Accortezza",
        "Istruzione",
        "Insegnamento",
        "Intessere Fatture",
        "Lanciare Incantesimi",
        "Officiare Rituali",
        "Persuasione",
        "Resistere alla Magia",
        "Seduzione",
        "Sensibilità"
    ],
    "Medico": [
        "Mani Guaritrici (Abilità Esclusiva)",
        "Accortezza",
        "Alchimia",
        "Commercio",
        "Coraggio",
        "Deduzione",
        "Istruzione",
        "Lame Corte",
        "Persuasione",
        "Pronto Soccorso",
        "Resistere a Coercizione"
    ],
    "Mercante": [
        "Ben Ammanigliato (Abilità Esclusiva)",
        "Accortezza",
        "Cavalcare oppure Navigazione",
        "Commercio",
        "Etichetta",
        "Gioco d'Azzardo",
        "Istruzione",
        "Linguaggio",
        "Persuasione",
        "Resistere a Coercizione",
        "Scaltrezza"
    ],
    "Prete": [
        "Iniziato degli Dei (Abilità Esclusiva)",
        "Autorità",
        "Carisma",
        "Coraggio",
        "Insegnamento",
        "Intessere Fatture",
        "Lanciare Incantesimi",
        "Officiare Rituali",
        "Pronto Soccorso",
        "Sensibilità",
        "Sopravvivenza"
    ],
    "Witcher": [
        "Arte del Witcher (Abilità Esclusiva)",
        "Accortezza",
        "Alchimia",
        "Atletica",
        "Cavalcare",
        "Deduzione",
        "Eludere",
        "Lanciare Incantesimi",
        "Nascondersi",
        "Scherma",
        "Sopravvivenza"
    ],
    "Druido": [
        "Rito della Quercia e del Vischio (Abilità Esclusiva)",
        "Sopravvivenza",
        "Accortezza",
        "Sensibilità",
        "Istruzione",
        "Alchimia",
        "Officiare Rituali",
        "Lanciare Incantesimi",
        "Pronto Soccorso",
        "Belle Arti",
        "Armi in Asta"
    ],
    "Villico": [
        "Intolleranza (Abilità Esclusiva)",
        "Atletica",
        "Coraggio",
        "Gioco d'Azzardo",
        "Lame Corte",
        "Manifattura",
        "Prestanza",
        "Pronto Soccorso",
        "Rissa",
        "Sopravvivenza",
        "Tempra"
    ]
};

async function run() {
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    const classes = [];

    for (const file of files) {
        const filePath = path.join(srcDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const system = content.system || {};
        const defSkill = system.definingSkill || {};
        
        const path1 = system.skillPath1 || {};
        const path2 = system.skillPath2 || {};
        const path3 = system.skillPath3 || {};
        
        const name = content.name;
        const initialSkills = (abiliMap[name] || []).join('\n');
        
        classes.push({
            name: name,
            source: system.sourcebook || '',
            initialSkills: initialSkills,
            definingSkillName: defSkill.skillName || '',
            definingSkillStat: (defSkill.stat || '').toUpperCase(),
            definingSkillDesc: stripHtml(defSkill.definition),
            
            path1Name: path1.pathName || 'N/D',
            path1Skill1: formatSkill(path1.skill1),
            path1Skill2: formatSkill(path1.skill2),
            path1Skill3: formatSkill(path1.skill3),
            
            path2Name: path2.pathName || 'N/D',
            path2Skill1: formatSkill(path2.skill1),
            path2Skill2: formatSkill(path2.skill2),
            path2Skill3: formatSkill(path2.skill3),
            
            path3Name: path3.pathName || 'N/D',
            path3Skill1: formatSkill(path3.skill1),
            path3Skill2: formatSkill(path3.skill2),
            path3Skill3: formatSkill(path3.skill3),
            
            professionSkills: system.professionSkills || '',
            notes: stripHtml(system.notes)
        });
    }

    // Sort by name
    classes.sort((a, b) => a.name.localeCompare(b.name));

    // Build CSV content
    const headers = [
        'Nome Classe',
        'Manuale',
        'Abilità Iniziali',
        'Abilità Unica',
        'Stat. Abilità Unica',
        'Descrizione Abilità Unica',
        'Albero 1: Nome',
        'Albero 1: Abilità 1',
        'Albero 1: Abilità 2',
        'Albero 1: Abilità 3',
        'Albero 2: Nome',
        'Albero 2: Abilità 1',
        'Albero 2: Abilità 2',
        'Albero 2: Abilità 3',
        'Albero 3: Nome',
        'Albero 3: Abilità 1',
        'Albero 3: Abilità 2',
        'Albero 3: Abilità 3',
        'Abilità di Professione',
        'Descrizione/Note'
    ];

    // Semicolon separator is standard for Italian CSVs (so Excel opens it natively)
    let csvContent = headers.map(csvField).join(';') + '\n';

    for (const cls of classes) {
        const row = [
            cls.name,
            cls.source,
            cls.initialSkills,
            cls.definingSkillName,
            cls.definingSkillStat,
            cls.definingSkillDesc,
            cls.path1Name,
            cls.path1Skill1,
            cls.path1Skill2,
            cls.path1Skill3,
            cls.path2Name,
            cls.path2Skill1,
            cls.path2Skill2,
            cls.path2Skill3,
            cls.path3Name,
            cls.path3Skill1,
            cls.path3Skill2,
            cls.path3Skill3,
            cls.professionSkills,
            cls.notes
        ];
        csvContent += row.map(csvField).join(';') + '\n';
    }

    fs.writeFileSync(csvFile, csvContent, 'utf8');
    console.log(`Report generato con successo in: ${csvFile}`);
}

run().catch(console.error);
