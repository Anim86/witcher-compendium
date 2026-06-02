import fs from 'fs';

const aggressiveDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/aggressive_prompts_db.json';
const data = JSON.parse(fs.readFileSync(aggressiveDbPath, 'utf8'));

const schematicPrompts = data.filter(item => 
    item.prompt.toLowerCase().includes('parchment') || 
    item.prompt.toLowerCase().includes('blueprints') || 
    item.prompt.toLowerCase().includes('schematic') ||
    item.prompt.toLowerCase().includes('crafting')
);

console.log(`Found ${schematicPrompts.length} potential schematic prompts.`);
if (schematicPrompts.length > 0) {
    console.log('Sample schematic prompt:', schematicPrompts[0].prompt);
    // Write them all to a debug file
    fs.writeFileSync('scratch/schematic_prompts_debug.json', JSON.stringify(schematicPrompts, null, 2), 'utf8');
}
