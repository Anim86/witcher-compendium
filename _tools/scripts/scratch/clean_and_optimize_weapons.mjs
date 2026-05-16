import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weaponsDir = path.resolve(__dirname, '../../src-packs/EQUIPAGGIAMENTO/witcher-weapons/');

console.log(`Starting weapon cleanup and optimization in: ${weaponsDir}`);
const files = fs.readdirSync(weaponsDir).filter(f => f.endsWith('.json'));

let cleanedCount = 0;

for (const file of files) {
    const filePath = path.join(weaponsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.type !== 'weapon' || !data.system) continue;

    let modified = false;
    const system = data.system;

    // 1. Remove obsolete, derived or legacy properties
    const keysToRemove = [
        'reach',
        'attackSkill',
        'meleeAttackSkill',
        'rangedAttackSkill',
        'attackOptions'
    ];

    for (const key of keysToRemove) {
        if (key in system) {
            delete system[key];
            modified = true;
        }
    }

    // 2. Flatten reliability { max, value } -> reliability & reliabilityMax
    if (system.reliability && typeof system.reliability === 'object') {
        const value = system.reliability.value ?? 0;
        const max = system.reliability.max ?? 0;

        system.reliability = value;
        system.reliabilityMax = max;
        modified = true;
    }

    // 3. Ensure reliabilityMax is defined if reliability is a flat number but max is missing
    if (typeof system.reliability === 'number' && !('reliabilityMax' in system)) {
        system.reliabilityMax = system.reliability;
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        cleanedCount++;
    }
}

console.log(`\nCleanup & Optimization complete. Successfully cleaned and formatted ${cleanedCount} files.`);
