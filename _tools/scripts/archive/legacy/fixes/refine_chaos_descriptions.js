const fs = require('fs');
const path = require('path');

const SRC_PACKS = '../src-packs';
const CHAOS_TEXTI = 'Tomo del Caos/Testi';

const chaosPacks = [
    'witcher-spells-chaos',
    'witcher-rituals-chaos',
    'witcher-special-chaos'
];

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/Davide Mesina - \d+/g, '') // Remove watermarks
        .replace(/Alessandro Pacifico - \d+/g, '')
        .replace(/--- Pagina \d+ ---/g, '') // Remove page headers
        .replace(/\n\d+\n/g, '\n') // Remove standalone numbers (page numbers)
        .replace(/\r/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function toHtml(text) {
    if (!text) return '';
    // Basic conversion: split by double newline for paragraphs
    return text.split('\n\n').map(p => {
        if (p.includes('Rodolf Kazmer') || p.includes('Glynnis var Treharne')) {
            return `<blockquote>${p.trim()}</blockquote>`;
        }
        return `<p>${p.trim().replace(/\n/g, ' ')}</p>`;
    }).join('');
}

async function refinePacks() {
    for (const packName of chaosPacks) {
        const packDir = path.join(SRC_PACKS, packName);
        if (!fs.existsSync(packDir)) continue;

        const files = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));
        console.log(`Processing ${packName} (${files.length} files)...`);

        for (const file of files) {
            const filePath = path.join(packDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const itemName = data.name.toUpperCase();

            // Find corresponding text file (if possible) or scan all
            const textFiles = fs.readdirSync(CHAOS_TEXTI).filter(f => f.endsWith('.txt'));
            let foundText = '';

            for (const tFile of textFiles) {
                const content = fs.readFileSync(path.join(CHAOS_TEXTI, tFile), 'utf8');
                // Look for the block starting with NAME (ISTRUZIONE CD X) or just NAME
                const escapedName = data.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`${escapedName}(\\s+\\(ISTRUZIONE CD \\d+\\))?([\\s\\S]+?)(?=\\s+[A-Z\\s]+ \\(ISTRUZIONE CD \\d+\\)|--- Pagina|$)`, 'i');
                const match = content.match(regex);
                
                if (match) {
                    foundText = match[2];
                    break;
                }
            }

            if (foundText) {
                const cleaned = cleanText(foundText);
                const html = toHtml(cleaned);
                
                // Keep existing mechanical data if it was already there?
                // Actually, the user wants the FULL description.
                data.system.description = html;
                fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
                // console.log(`  Updated ${data.name}`);
            } else {
                // console.log(`  No text found for ${data.name}`);
            }
        }
    }
}

refinePacks().then(() => console.log('Refinement Complete.'));

