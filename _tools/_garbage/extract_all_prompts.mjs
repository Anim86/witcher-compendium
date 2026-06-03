import fs from 'fs';
import path from 'path';

const searchDirs = [
    'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools',
    'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/_garbage/scratch',
    'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/prompts_archive'
];

const results = [];

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') scanDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.mjs')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Catch ALL strings starting with Digital painting (single or double quotes or backticks)
    const promptRegex = /([`"'])(Digital painting[\s\S]{50,1200}?)\1/g;
    let match;
    while ((match = promptRegex.exec(content)) !== null) {
        const prompt = match[2].trim();
        
        // Try to find context (nearby name)
        const contextBefore = content.substring(Math.max(0, match.index - 100), match.index);
        const contextAfter = content.substring(match.index + match[0].length, match.index + match[0].length + 100);
        
        results.push({
            prompt,
            file: path.basename(filePath),
            contextBefore,
            contextAfter
        });
    }
}

console.log('Starting aggressive scan...');
searchDirs.forEach(scanDir);
console.log(`Scan complete. Found ${results.length} total prompt occurrences.`);

// Deduplicate by prompt text
const uniqueResults = [];
const seenPrompts = new Set();
for (const res of results) {
    if (!seenPrompts.has(res.prompt)) {
        uniqueResults.push(res);
        seenPrompts.has(res.prompt);
        seenPrompts.add(res.prompt);
    }
}

console.log(`Deduplicated to ${uniqueResults.length} unique prompts.`);

// Save full DB for inspection
fs.writeFileSync('c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/scripts/aggressive_prompts_db.json', JSON.stringify(uniqueResults, null, 2));

// Filter for School items
const schoolItems = uniqueResults.filter(r => 
    r.prompt.toLowerCase().includes('school') || 
    r.prompt.toLowerCase().includes('lupo') || 
    r.prompt.toLowerCase().includes('wolf') ||
    r.prompt.toLowerCase().includes('orso') ||
    r.prompt.toLowerCase().includes('bear') ||
    r.prompt.toLowerCase().includes('manticora') ||
    r.prompt.toLowerCase().includes('manticore') ||
    r.prompt.toLowerCase().includes('vipera') ||
    r.prompt.toLowerCase().includes('viper') ||
    r.prompt.toLowerCase().includes('gatto') ||
    r.prompt.toLowerCase().includes('cat') ||
    r.prompt.toLowerCase().includes('grifone') ||
    r.prompt.toLowerCase().includes('griffin')
);

console.log(`\n--- School Items Found (${schoolItems.length}) ---`);
schoolItems.forEach(r => {
    // Extract a likely name from context
    let name = 'Unknown';
    const nameMatch = r.contextBefore.match(/class="item-name">([^<]+)</) || r.contextBefore.match(/item:\s*['"]([^'"]+)['"]/) || r.contextBefore.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) name = nameMatch[1];
    else {
        // Look for the subject in the prompt itself
        const subjectMatch = r.prompt.match(/a ([^,]+),/);
        if (subjectMatch) name = subjectMatch[1];
    }
    console.log(`[${name.toUpperCase()}] in ${r.file}: ${r.prompt.substring(0, 80)}...`);
});
