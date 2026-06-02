import fs from 'fs';

const path = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/found_prompts.json';
if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    console.log('Found prompts count:', Object.keys(data).length);
    console.log('Matched terms:', Object.keys(data));
} else {
    console.log('found_prompts.json does not exist');
}
