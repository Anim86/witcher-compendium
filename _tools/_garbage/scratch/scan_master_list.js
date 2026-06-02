import fs from 'fs';

const path = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/_garbage/MASTER_GENERATION_LIST.md';
if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    console.log('Total lines in MASTER_GENERATION_LIST.md:', lines.length);
    const matches = lines.filter(l => l.toLowerCase().includes('arming sword') || l.toLowerCase().includes("spada d'arme"));
    console.log('Matches:', matches.length);
    for (const m of matches) {
        console.log(m.substring(0, 200));
    }
} else {
    console.log('File does not exist');
}
