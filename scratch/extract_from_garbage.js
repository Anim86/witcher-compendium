import fs from 'fs';
import path from 'path';

const garbageDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/_garbage';
const files = fs.readdirSync(garbageDir);

console.log(`Found ${files.length} files in _garbage.`);

const promptsList = [];

for (const file of files) {
    if (file.startsWith('update_batch') && file.endsWith('.js')) {
        const filePath = path.join(garbageDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Match all strings inside double/single quotes or backticks starting with "Digital painting"
        const matches = content.match(/["'`](Digital painting[\s\S]*?)["'`]/g);
        if (matches) {
            console.log(`File ${file}: Found ${matches.length} prompts.`);
            for (const m of matches) {
                // Remove outer quotes
                const prompt = m.slice(1, -1)
                    .replace(/\\r/g, '')
                    .replace(/\\n/g, ' ')
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .trim();
                
                promptsList.push({
                    file,
                    prompt
                });
            }
        }
    }
}

console.log(`Total prompts extracted from garbage: ${promptsList.length}`);
// Deduplicate
const unique = [];
const seen = new Set();
for (const p of promptsList) {
    if (!seen.has(p.prompt)) {
        unique.push(p);
        seen.add(p.prompt);
    }
}
console.log(`Deduplicated to ${unique.length} unique prompts.`);

// Search for some target weapons to see if we found them!
const targets = ["Arming Sword", "Iron Sword", "Vrihedd", "Dwarven Axe", "Monster Hunter Crossbow"];
for (const t of targets) {
    const found = unique.find(p => p.prompt.toLowerCase().includes(t.toLowerCase()));
    if (found) {
        console.log(`Found prompt for [${t}]: ${found.prompt.substring(0, 150)}...`);
    } else {
        console.log(`Not found: [${t}]`);
    }
}

fs.writeFileSync('scratch/garbage_prompts.json', JSON.stringify(unique, null, 2), 'utf8');
