import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weaponsDir = path.resolve(__dirname, '../../src-packs/EQUIPAGGIAMENTO/witcher-weapons/');

console.log(`Starting weapon migration and standardization in: ${weaponsDir}`);
const files = fs.readdirSync(weaponsDir).filter(f => f.endsWith('.json'));

let migratedCount = 0;

for (const file of files) {
    const filePath = path.join(weaponsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.type !== 'weapon' || !data.system) continue;

    let modified = false;

    // 1. Standardize reach -> range
    if ('reach' in data.system) {
        if (!('range' in data.system) || data.system.range === '') {
            data.system.range = data.system.reach;
        }
        delete data.system.reach;
        modified = true;
    }

    // 2. Ensure range is present
    if (!('range' in data.system)) {
        data.system.range = '';
        modified = true;
    }

    // 3. Ensure category is present
    if (!('category' in data.system) || !data.system.category) {
        const nameU = (data.name || '').toUpperCase();
        let category = '';
        if (nameU.includes('ARCO') || nameU.includes('BOW')) {
            category = 'bow';
        } else if (nameU.includes('BALESTRA') || nameU.includes('CROSSBOW')) {
            category = 'crossbow';
        } else if (nameU.includes('LANCIO') || nameU.includes('THROW')) {
            category = 'thrown';
        } else if (nameU.includes('BOMBA') || nameU.includes('BOMB')) {
            category = 'bomb';
        } else if (
            nameU.includes('PUGNALE') || 
            nameU.includes('STILETTO') || 
            nameU.includes('MANNAIA') || 
            nameU.includes('DAGA') || 
            nameU.includes('JAMBIYA') || 
            nameU.includes('DAGGER') || 
            nameU.includes('CLEAVER')
        ) {
            category = 'smallBlade';
        } else if (
            nameU.includes('ASTA') || 
            nameU.includes('LANCIA') || 
            nameU.includes('ALABARDA') || 
            nameU.includes('FORCONE') || 
            nameU.includes('PARTIGIANA') || 
            nameU.includes('POLEARM') || 
            nameU.includes('HALBERD') || 
            nameU.includes('SPEAR')
        ) {
            category = 'polearm';
        } else if (
            nameU.includes('SPADA') || 
            nameU.includes('SWORD') || 
            nameU.includes('KORD') || 
            nameU.includes('GLEDDYF') || 
            nameU.includes('GWYHYR') || 
            nameU.includes('MESSER') || 
            nameU.includes('FLAMBERGA') ||
            nameU.includes('CAROLINE') ||
            nameU.includes('DESTINO') ||
            nameU.includes('DEVINE')
        ) {
            category = 'sword';
        } else if (nameU.includes('TIRAPUGNI') || nameU.includes('NUCKLE')) {
            category = 'brawling';
        } else if (nameU.includes('ASCIA') || nameU.includes('ACCETTA') || nameU.includes('AXE')) {
            category = 'axe';
        } else if (nameU.includes('BASTONE') || nameU.includes('STAFF')) {
            category = 'staff';
        } else if (
            nameU.includes('MARTELLO') || 
            nameU.includes('MAZZA') || 
            nameU.includes('MAGLIO') || 
            nameU.includes('MAZZAPICCHIO') || 
            nameU.includes('AZZA') ||
            nameU.includes('HAMMER') || 
            nameU.includes('MACE') || 
            nameU.includes('CLUB')
        ) {
            category = 'bludgeoning';
        } else {
            const rangeVal = (data.system.range || '').trim().toUpperCase();
            const isRanged = rangeVal !== '' && rangeVal !== 'N/A';
            if (isRanged) {
                category = 'thrown';
            } else {
                category = 'sword';
            }
        }
        data.system.category = category;
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        migratedCount++;
    }
}

console.log(`\nMigration & Standardization complete. Processed and updated ${migratedCount} files.`);
