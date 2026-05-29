import fs from 'fs';

const aggressiveDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/aggressive_prompts_db.json';
const extractedDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/extracted_prompts_db.json';

const agg = JSON.parse(fs.readFileSync(aggressiveDbPath, 'utf8'));
const ext = JSON.parse(fs.readFileSync(extractedDbPath, 'utf8'));

const targets = [
    "spada d'arme", "spada di ferro", "spada da cavalleria vrihedd", "spada ducale", "spada meteoritica",
    "esboda", "falchion da cacciatore", "falcione elfico", "flamberga", "gleddyf", "gwyhyr gnomesca",
    "kord", "krigsverd", "lama del tir tochair", "lama vicovariana", "lama viroledana", "messer elfico",
    "torrwr", "costoliere", "accetta"
];

console.log('--- Searching in Extracted DB (keys) ---');
for (const t of targets) {
    if (ext[t]) {
        console.log(`FOUND key [${t}]: ${ext[t].substring(0, 80)}...`);
    } else {
        // Try fuzzy check of keys
        const match = Object.keys(ext).find(k => k.includes(t) || t.includes(k));
        if (match) {
            console.log(`FUZZY FOUND key [${t}] as [${match}]: ${ext[match].substring(0, 80)}...`);
        } else {
            console.log(`NOT FOUND key [${t}]`);
        }
    }
}

console.log('\n--- Searching in Aggressive DB (substring in prompt) ---');
for (const t of targets) {
    const found = agg.filter(item => item.prompt.toLowerCase().includes(t.toLowerCase()) || (item.contextBefore && item.contextBefore.toLowerCase().includes(t.toLowerCase())));
    if (found.length > 0) {
        console.log(`FOUND string [${t}] in ${found.length} prompts. First: ${found[0].prompt.substring(0, 100)}...`);
    } else {
        console.log(`NOT FOUND string [${t}]`);
    }
}
