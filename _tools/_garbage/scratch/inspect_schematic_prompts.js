import fs from 'fs';

const path = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/schematic_prompts_debug.json';
if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    console.log('Total potential schematic prompts:', data.length);
    console.log('First 10 prompts:');
    for (let i = 0; i < Math.min(10, data.length); i++) {
        const item = data[i];
        console.log(`[${i}] File: ${item.file}`);
        console.log(`    Prompt: ${item.prompt.substring(0, 150)}...`);
    }
} else {
    console.log('File does not exist');
}
