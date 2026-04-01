const fs = require('fs');
const path = require('path');

const PACKS_DIR = path.join(__dirname, 'packs');
const ASSETS_DIR = path.join(__dirname, 'assets');

const ids = new Set();
const names = new Map(); // Name -> Pack
let total = 0;
const errors = [];

function checkDir(dir, packName) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        if (!file.endsWith('.json')) return;
        total++;
        const filePath = path.join(dir, file);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            errors.push(`[${packName}] ERROR: Failed to parse ${file}: ${e.message}`);
            return;
        }

        // 1. ID Check (Exactly 16 chars)
        if (!data._id || data._id.length !== 16) {
            errors.push(`[${packName}] ${file}: ID invalid (${data._id})`);
        }
        if (ids.has(data._id)) {
            errors.push(`[${packName}] ${file}: Duplicate ID detected! (${data._id})`);
        }
        ids.add(data._id);

        // 2. Image Check
        if (data.img) {
            if (data.img.startsWith('modules/witcher-compendium/assets/')) {
                const relativePath = data.img.replace('modules/witcher-compendium/assets/', '');
                const fullPath = path.join(ASSETS_DIR, relativePath);
                if (!fs.existsSync(fullPath)) {
                    errors.push(`[${packName}] ${file}: Image MISSING at ${data.img} (checked ${fullPath})`);
                }
            } else if (data.img.startsWith('icons/')) {
                // Foundry core icon, valid
            } else {
                errors.push(`[${packName}] ${file}: Image path UNKNOWN (${data.img})`);
            }
        } else {
             errors.push(`[${packName}] ${file}: Image field is EMPTY`);
        }

        // 3. Data check (NaN/Undefined)
        const checkObj = (obj, prefix = '') => {
            if (!obj) return;
            for (let k in obj) {
                const val = obj[k];
                if (val === null) continue;
                if (typeof val === 'number' && isNaN(val)) {
                    errors.push(`[${packName}] ${file}: NaN found in ${prefix}${k}`);
                }
                if (val === undefined || val === "undefined") {
                    errors.push(`[${packName}] ${file}: Undefined found in ${prefix}${k}`);
                }
                if (typeof val === 'object') checkObj(val, `${prefix}${k}.`);
            }
        };
        checkObj(data.system, 'system.');
    });
}

console.log("--- INIZIO AUDIT FINALE ---");

const packs = fs.readdirSync(PACKS_DIR).filter(f => fs.statSync(path.join(PACKS_DIR, f)).isDirectory());
packs.forEach(p => {
    checkDir(path.join(PACKS_DIR, p), p);
});

console.log(`\nAudit completato su ${total} entries.`);

if (errors.length > 0) {
    console.log(`\n❌ TROVATI ${errors.length} ERRORI:`);
    // Limiting report to first 20 errors
    errors.slice(0, 20).forEach(e => console.log(e));
    if (errors.length > 20) console.log(`... e altri ${errors.length - 20} errori.`);
    process.exit(1);
} else {
    console.log("\n✅ AUDIT SUPERATO: 0 Errori Bloccanti.");
    process.exit(0);
}
