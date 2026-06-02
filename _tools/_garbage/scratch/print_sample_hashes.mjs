import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const eqDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment';

function getMd5(filepath) {
    if (!fs.existsSync(filepath)) return 'NOT FOUND';
    const buffer = fs.readFileSync(filepath);
    return crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
}

const filesToCheck = [
    'cote_nanica.webp',
    'sapone.webp',
    'specchietto.webp',
    'manette.webp',
    'pipa.webp',
    'coppia_di_puntelli.webp',
    'corno_da_segnalazione.webp',
    'fischietto_da_segnalazione.webp',
    'telecomunicatore.webp',
    'tabacco.webp',
    'tenda.webp'
];

for (const file of filesToCheck) {
    const p = path.join(eqDir, file);
    console.log(`${file}: size=${fs.existsSync(p) ? fs.statSync(p).size : 0}, MD5=${getMd5(p)}`);
}
