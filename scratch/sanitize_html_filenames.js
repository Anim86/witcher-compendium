const fs = require('fs');
const path = require('path');

const scratchDir = 'scratch';
const files = fs.readdirSync(scratchDir);
const batchFiles = files.filter(f => f.startsWith('prompts_batch_') && f.endsWith('.html'));

function sanitize(str) {
    return str.toLowerCase()
        .replace(/['"]/g, '')
        .replace(/[\(\)]/g, '')
        .replace(/[^a-z0-9\._-]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

batchFiles.forEach(file => {
    const filePath = path.join(scratchDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Cerca "Nome file: <strong>filename.png</strong>"
    content = content.replace(/Nome file: <strong>(.*?)<\/strong>/g, (match, filename) => {
        const clean = sanitize(filename);
        if (clean !== filename) {
            console.log(`[${file}] Sanitize filename: ${filename} -> ${clean}`);
            changed = true;
            return `Nome file: <strong>${clean}</strong>`;
        }
        return match;
    });

    // 2. Cerca id="p-filename.png"
    // Nota: gli ID non dovrebbero avere caratteri strani comunque, ma meglio allinearli
    content = content.replace(/id="p-(.*?)"/g, (match, id) => {
        const clean = sanitize(id);
        if (clean !== id) {
            changed = true;
            return `id="p-${clean}"`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Sanitization of HTML files completed.');
