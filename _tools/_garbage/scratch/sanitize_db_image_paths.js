const fs = require('fs');
const path = require('path');

const packsRoot = '_tools/src-packs';

function sanitizeFilename(filename) {
    // Separiamo estensione e nome base
    const ext = path.extname(filename);
    const base = filename.slice(0, -ext.length);
    
    const cleanBase = base.toLowerCase()
        .replace(/['"]/g, '')
        .replace(/[\(\)]/g, '')
        .replace(/[^a-z0-9\._-]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
        
    return cleanBase + ext.toLowerCase();
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

console.log('Starting DB image path sanitization...');

walkDir(packsRoot, (filePath) => {
    if (path.extname(filePath) !== '.json') return;

    let content = fs.readFileSync(filePath, 'utf8');
    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing ${filePath}: ${e.message}`);
        return;
    }

    let changed = false;

    // Funzione ricorsiva per cercare campi "img"
    function processObject(obj) {
        if (typeof obj !== 'object' || obj === null) return;

        for (let key in obj) {
            if (key === 'img' && typeof obj[key] === 'string') {
                const oldPath = obj[key];
                const dirName = path.dirname(oldPath);
                const fileName = path.basename(oldPath);
                
                const cleanFileName = sanitizeFilename(fileName);
                
                if (cleanFileName !== fileName) {
                    const newPath = path.join(dirName, cleanFileName).replace(/\\/g, '/');
                    obj[key] = newPath;
                    console.log(`[${path.basename(filePath)}] ${fileName} -> ${cleanFileName}`);
                    changed = true;
                }
            } else if (typeof obj[key] === 'object') {
                processObject(obj[key]);
            }
        }
    }

    processObject(json);

    if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    }
});

console.log('DB sanitization completed.');
