import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weaponsDir = path.resolve(__dirname, '../src-packs/EQUIPAGGIAMENTO/witcher-weapons/');

async function migrate() {
    console.log(`Starting migration in: ${weaponsDir}`);
    const files = fs.readdirSync(weaponsDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} weapon files.`);

    let migratedCount = 0;

    for (const file of files) {
        const filePath = path.join(weaponsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (data.type !== 'weapon' || !data.system) continue;

        const nameU = (data.name || '').toUpperCase();
        
        // Define heuristics to bootstrap the new category field
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
            // Default based on range
            const rangeVal = (data.system.range || data.system.reach || '').trim().toUpperCase();
            const isRanged = rangeVal !== '' && rangeVal !== 'N/A';
            if (isRanged) {
                category = 'thrown';
            } else {
                category = 'sword'; // Safe default
            }
        }

        data.system.category = category;
        
        // Clean up legacy attack fields as they are now derived
        // delete data.system.meleeAttackSkill;
        // delete data.system.rangedAttackSkill;
        // delete data.system.attackOptions;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        migratedCount++;
    }

    console.log(`Migration complete. Successfully migrated ${migratedCount} files.`);
}

migrate().catch(console.error);
