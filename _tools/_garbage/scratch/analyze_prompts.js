import fs from 'fs';
import path from 'path';

const aggressiveDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/aggressive_prompts_db.json';
const extractedDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/extracted_prompts_db.json';

console.log('aggressive_prompts_db.json exists:', fs.existsSync(aggressiveDbPath));
console.log('extracted_prompts_db.json exists:', fs.existsSync(extractedDbPath));

if (fs.existsSync(aggressiveDbPath)) {
    const data = JSON.parse(fs.readFileSync(aggressiveDbPath, 'utf8'));
    console.log('Aggressive DB size:', data.length);
    console.log('Aggressive DB first 3 entries:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
}

if (fs.existsSync(extractedDbPath)) {
    const data = JSON.parse(fs.readFileSync(extractedDbPath, 'utf8'));
    console.log('Extracted DB size:', data.length);
    console.log('Extracted DB first 3 entries:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
}
