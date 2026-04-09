import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../../_tools/src-packs');
const SYSTEM_ID = 'TheWitcherItaNewSystem';
const SYSTEM_VERSION = 'v14.1.35';
const CORE_VERSION = '14';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.json')) {
            results.push(file);
        }
    });
    return results;
}

console.log('🔍 Iniziando migrazione metadati JSON...');
const files = walk(SRC_DIR);
let count = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        
        let modified = false;
        
        if (!data._stats) {
            data._stats = {};
            modified = true;
        }
        
        if (data._stats.systemId !== SYSTEM_ID) {
            data._stats.systemId = SYSTEM_ID;
            modified = true;
        }
        
        if (data._stats.systemVersion !== SYSTEM_VERSION) {
            data._stats.systemVersion = SYSTEM_VERSION;
            modified = true;
        }
        
        if (data._stats.coreVersion !== CORE_VERSION) {
            data._stats.coreVersion = CORE_VERSION;
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');
            count++;
        }
    } catch (e) {
        console.error(`❌ Errore nel file ${file}: ${e.message}`);
    }
});

console.log(`✅ Migrazione completata. Aggiornati ${count} file su ${files.length}.`);
