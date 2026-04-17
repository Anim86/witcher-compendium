import fs from 'fs';
import path from 'path';

function walk(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(walk(fullPath));
        } else if (file.endsWith('.json')) {
            files.push(fullPath);
        }
    }
    return files;
}

const table1 = [];
const table2 = [];
const table3 = [];
const table4 = [];
const table5 = [];

// Point 1
if (fs.existsSync('_tools/src-packs/_DA_RICOLLOCARE/trofei')) {
  table1.push({voce: "Cartella _DA_RICOLLOCARE/trofei", stato: "Esistente", azione: "Da gestire"});
} else {
  table1.push({voce: "Cartella _DA_RICOLLOCARE/trofei", stato: "Non esiste (già fusa in GAMEPLAY)", azione: "Nessuna azione richiesta"});
}

// Point 2
const bestiarioFiles = walk('_tools/src-packs/BESTIARIO');
const magesNames = ["Bronwyn", "Cadfan", "Artorius", "Xarthisius", "Dormyn", "Dorregaray", "Drystan", "Elgan", "Francesca", "Fringilla", "Istredd", "Keira", "Letho", "Margarita", "Philippa", "Ranuncolo", "Stregobor", "Vernon", "Yennefer", "Zoltan", "Iorveth", "Triss", "Geralt"];
bestiarioFiles.forEach(f => {
    let basename = path.basename(f);
    if (magesNames.some(n => basename.toLowerCase().includes(n.toLowerCase()))) {
        let j = JSON.parse(fs.readFileSync(f));
        let sb = j.system?.sourcebook || '??';
        let action = "Impostare TC";
        let defaultSb = "TC";
        const mbChars = ["geralt", "zoltan", "yennefer", "ranuncolo", "triss", "vernon", "iorveth", "letho", "margarita", "philippa"];
        if (mbChars.some(n => basename.toLowerCase().includes(n))) {
             action = "Impostare MB";
             defaultSb = "MB";
        }
        if (sb.startsWith(defaultSb)) action = `OK (${defaultSb})`;
        table2.push({voce: j.name, stato: `Trovato: ${basename} (SB: ${sb})`, azione: action, path: f});
    }
});

// Point 3
const invocs = walk('_tools/src-packs/MAGIA/caos/witcher-invocations');
invocs.forEach(f => {
    let j = JSON.parse(fs.readFileSync(f));
    table3.push({voce: j.name, file: path.basename(f)});
});

// Point 4
const signs = walk('_tools/src-packs/MAGIA/caos/witcher-signs-chaos');
signs.forEach(f => {
    let j = JSON.parse(fs.readFileSync(f));
    table4.push({voce: j.name, file: path.basename(f)});
});

// Point 5
const skills = walk('_tools/src-packs/CORE/witcher-skills');
const targetSkills = ["alchimia", "camuffamento", "scassinare", "prontosoccorso", "fabbricare", "contraffazione", "artigianato"];
const skillDupes = {};
skills.forEach(f => {
    let basename = path.basename(f);
    let l = basename.toLowerCase();
    targetSkills.forEach(t => {
        if (l.startsWith(t)) {
            if(!skillDupes[t]) skillDupes[t] = [];
            let j = JSON.parse(fs.readFileSync(f));
            let sb = j.system?.sourcebook || '??';
            skillDupes[t].push({file: basename, sb: sb, name: j.name, id: j._id});
        }
    });
});

console.log(JSON.stringify({t1: table1, t2: table2, t3: table3, t4: table4, t5: skillDupes}, null, 2));
