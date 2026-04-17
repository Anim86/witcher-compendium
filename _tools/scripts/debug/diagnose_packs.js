import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../');

const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const PACKS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'packs');

function getFilesRecursively(dir, filter = () => true) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(file, filter));
        } else {
            if (filter(file)) {
                results.push({ path: file, size: stat.size });
            }
        }
    });
    return results;
}

console.log("🔍 DIAGNOSI PACKS WITCHER\n");

// 1. Sorgenti JSON
console.log("--- 1. Sorgenti JSON (_tools/src-packs) ---");
if (fs.existsSync(SRC_ROOT)) {
    const srcJsons = getFilesRecursively(SRC_ROOT, f => f.endsWith('.json'));
    console.log(`✅ File JSON trovati: ${srcJsons.length}`);
} else {
    console.log("❌ Cartella SRC_ROOT non trovata!");
}

// 2. Database compilati
console.log("\n--- 2. Database Compilati (witcher-compendium/packs) ---");
if (fs.existsSync(PACKS_ROOT)) {
    const packFiles = getFilesRecursively(PACKS_ROOT);
    const emptyFiles = packFiles.filter(f => f.size === 0);
    
    console.log(`✅ File totali in packs/: ${packFiles.length}`);
    if (emptyFiles.length > 0) {
        console.log(`⚠️ TROVATI ${emptyFiles.length} FILE VUOTI (Size 0):`);
        emptyFiles.forEach(f => console.log(`   - ${path.relative(PACKS_ROOT, f.path)}`));
    } else {
        console.log("✅ Nessun file vuoto trovato nei database.");
    }
} else {
    console.log("❌ Cartella PACKS_ROOT non trovata!");
}

process.exit(0);
