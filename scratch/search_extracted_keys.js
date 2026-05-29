import fs from 'fs';

const path = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/extracted_prompts_db.json';
if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    const keys = Object.keys(data);
    const keywords = ["spada", "scudo", "armatura", "ascia", "balestra", "arco", "bastone", "acciaio", "bronzo", "ferro", "schema"];
    
    console.log('Total keys:', keys.length);
    const matches = keys.filter(k => keywords.some(kw => k.toLowerCase().includes(kw)));
    console.log(`Found ${matches.length} matching keys:`, matches);
} else {
    console.log('File does not exist');
}
