import fs from 'fs';
import path from 'path';

const dir = '_tools/src-packs/CORE/witcher-skills/';

// 1. Delete TC clones
const toDelete = [
    'alchimia_980a449e9a677fc9.json',
    'camuffamento_42cf5ee579036a15.json',
    'scassinare_4179fd70ce28a4c6.json',
    'pronto_soccorso_f8e91708b8ae614d.json'
];

toDelete.forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log('Deleted:', f);
    } else {
        console.log('File not found:', f);
    }
});

// 2. Modify sourcebooks
const toModify = [
    { target: 'artigianato', uuid: 'd2a0fdc55b892b70.json' },
    { target: 'contraffazione', uuid: 'eaa35432d5329a08.json' },
    { target: 'fabbricare_trappole', uuid: '811f06949c0e223b.json' }
];

toModify.forEach(m => {
    const files = fs.readdirSync(dir);
    const file = files.find(f => f.includes(m.target));
    if (file) {
        const fullPath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (data.system) {
            data.system.sourcebook = 'MB 57';
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
            console.log('Updated sourcebook for:', file);
        }
    }
});
