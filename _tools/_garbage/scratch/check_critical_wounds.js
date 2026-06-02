import fs from 'fs';
import path from 'path';

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-critical-wounds';
const aggressiveDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/aggressive_prompts_db.json';
const extractedDbPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/scripts/extracted_prompts_db.json';

function main() {
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    
    let aggressiveDb = [];
    if (fs.existsSync(aggressiveDbPath)) {
        aggressiveDb = JSON.parse(fs.readFileSync(aggressiveDbPath, 'utf8'));
    }
    
    let extractedDb = {};
    if (fs.existsSync(extractedDbPath)) {
        extractedDb = JSON.parse(fs.readFileSync(extractedDbPath, 'utf8'));
    }
    
    console.log(`Loaded ${files.length} critical wound files.`);
    console.log(`Loaded ${aggressiveDb.length || 0} aggressive prompts.`);
    console.log(`Loaded ${Object.keys(extractedDb).length || 0} extracted prompts.`);
    
    for (const file of files) {
        const filePath = path.join(srcDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = data.name;
        const img = data.img;
        
        console.log(`\n- Name: ${name}`);
        console.log(`  Img: ${img}`);
        
        // Search in aggressiveDb
        const aggMatches = aggressiveDb.filter(item => {
            const key = item.key || '';
            const prompt = item.prompt || '';
            return key.toLowerCase().includes(name.toLowerCase()) || 
                   prompt.toLowerCase().includes(name.toLowerCase());
        });
        
        if (aggMatches.length > 0) {
            console.log(`  Aggressive Matches: ${aggMatches.length}`);
            for (const m of aggMatches) {
                console.log(`    Key: ${m.key}`);
                console.log(`    Prompt: ${m.prompt}`);
            }
        }
        
        // Search in extractedDb
        const extMatches = Object.entries(extractedDb).filter(([key, prompt]) => {
            return key.toLowerCase().includes(name.toLowerCase()) || 
                   prompt.toLowerCase().includes(name.toLowerCase());
        });
        
        if (extMatches.length > 0) {
            console.log(`  Extracted Matches: ${extMatches.length}`);
            for (const [k, p] of extMatches) {
                console.log(`    Key: ${k}`);
                console.log(`    Prompt: ${p}`);
            }
        }
    }
}

main();
