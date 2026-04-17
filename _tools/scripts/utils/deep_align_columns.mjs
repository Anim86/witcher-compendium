import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '../../../');
const MOD_JSON_PATH = path.join(BASE_DIR, 'witcher-compendium', 'module.json');
const SRC_ROOT = path.join(BASE_DIR, '_tools', 'src-packs');
const ASSETS_ROOT = path.join(BASE_DIR, 'witcher-compendium', 'assets');
const PACKS_ROOT = path.join(BASE_DIR, 'witcher-compendium', 'packs');

const moduleJson = JSON.parse(fs.readFileSync(MOD_JSON_PATH, 'utf8'));

// Mappa PackName -> TargetRelPath (es: "witcher-monsters" -> "BESTIARIO/Mostri/witcher-monsters")
const packTargetMap = new Map();
moduleJson.packs.forEach(p => {
    const rel = p.path.replace(/^packs\//, '');
    const packName = path.basename(rel);
    packTargetMap.set(packName, rel);
});

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Funzione ricorsiva per trovare e spostare i pacchetti
function scanAndMovePacks(currentDir, rootPath, rootType) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const relToRoot = path.relative(rootPath, fullPath).replace(/\\/g, '/');
            
            // Se questa cartella è il nome di un pack
            if (packTargetMap.has(item)) {
                const targetRel = packTargetMap.get(item);
                
                // Se non è già nel posto giusto
                if (relToRoot !== targetRel) {
                    const finalDest = path.join(rootPath, targetRel);
                    
                    if (fs.existsSync(finalDest)) {
                        // Se la destinazione esiste già, fondiamo i contenuti
                        console.log(`Merging ${relToRoot} into ${targetRel}`);
                        mergeFolders(fullPath, finalDest);
                        // Rimuoviamo la cartella sorgente se vuota
                        if (fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath);
                    } else {
                        console.log(`🚚 Moving pack [${item}] from ${relToRoot} to ${targetRel}`);
                        ensureDir(path.dirname(finalDest));
                        fs.renameSync(fullPath, finalDest);
                    }
                }
            } else {
                // Continua la scansione ricorsiva (ma evita di entrare nei target già corretti per efficienza)
                // Se relToRoot non inizia con una delle macro-categorie corrette, scansione profonda
                scanAndMovePacks(fullPath, rootPath, rootType);
            }
        }
    }
}

function mergeFolders(src, dest) {
    const items = fs.readdirSync(src);
    for (const item of items) {
        const s = path.join(src, item);
        const d = path.join(dest, item);
        if (fs.statSync(s).isDirectory()) {
            ensureDir(d);
            mergeFolders(s, d);
            if (fs.readdirSync(s).length === 0) fs.rmdirSync(s);
        } else {
            if (!fs.existsSync(d)) {
                fs.renameSync(s, d);
            } else {
                // Se il file esiste, lo sovrascriviamo se è più recente o semplicemente saltiamo
                // In questo caso spostiamo e basta
                fs.unlinkSync(s);
            }
        }
    }
}

// Soccorso specifico per file asset sciolti
function rescueLooseAssets() {
    const looseAssetsMap = [
        { from: 'witcher-compendium/assets/ABILITA', to: 'witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills' },
        { from: 'witcher-compendium/assets/SPECIAL', to: 'witcher-compendium/assets/EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special' },
        { from: 'witcher-compendium/assets/wizard', to: 'witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-professions' }
    ];

    for (const m of looseAssetsMap) {
        const fullFrom = path.join(BASE_DIR, m.from);
        const fullTo = path.join(BASE_DIR, m.to);
        if (!fs.existsSync(fullFrom)) continue;
        ensureDir(fullTo);
        const files = fs.readdirSync(fullFrom);
        for (const f of files) {
            const s = path.join(fullFrom, f);
            const d = path.join(fullTo, f);
            if (!fs.statSync(s).isDirectory()) {
                console.log(`🚑 Rescuing asset: ${f} -> ${m.to}`);
                if (!fs.existsSync(d)) fs.renameSync(s, d);
                else fs.unlinkSync(s);
            }
        }
    }
}

async function run() {
    console.log("🚀 Starting Aggressive Deep Alignment...");

    // 1. Soccorso asset sciolti
    rescueLooseAssets();

    // 2. Scansione e spostamento pack
    scanAndMovePacks(SRC_ROOT, SRC_ROOT, 'src');
    scanAndMovePacks(ASSETS_ROOT, ASSETS_ROOT, 'assets');
    scanAndMovePacks(PACKS_ROOT, PACKS_ROOT, 'packs');

    // 3. Cleanup Cautelativo
    const legacyFolders = ['CORE', 'DLC', 'EQUIPAGGIAMENTO', 'GAMEPLAY', 'GEOGRAFIA', 'LORE', 'MAGIA', 'CRAFTING', 'ABILITA', 'SPECIAL', 'wizard'];
    const roots = [SRC_ROOT, ASSETS_ROOT, PACKS_ROOT];

    for (const r of roots) {
        for (const l of legacyFolders) {
            const p = path.join(r, l);
            if (fs.existsSync(p)) {
                const sub = fs.readdirSync(p);
                if (sub.length === 0) {
                    console.log(`🗑 Removing empty legacy folder: ${p}`);
                    fs.rmdirSync(p);
                } else {
                    // Prova a rimuovere sottocartelle vuote ricorsivamente
                    cleanEmptyRecursive(p);
                    if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
                }
            }
        }
    }

    console.log("🏁 Deep Alignment Complete!");
}

function cleanEmptyRecursive(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) {
            cleanEmptyRecursive(full);
            if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
        }
    }
}

run();
