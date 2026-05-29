const { execSync } = require('child_process');

try {
    const diff = execSync('git diff -U0 -- "TO DO/report_lore_compendio.md"', { encoding: 'utf8' });
    const lines = diff.split('\n');
    
    let currentRemoved = null;
    let currentAdded = null;
    
    console.log("Analyzing changes...");
    
    for (const line of lines) {
        if (line.startsWith('@@')) {
            if (currentRemoved || currentAdded) {
                printDiff(currentRemoved, currentAdded);
                currentRemoved = null;
                currentAdded = null;
            }
            console.log(`\n--- ${line} ---`);
        } else if (line.startsWith('-') && !line.startsWith('---')) {
            currentRemoved = line.slice(1);
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
            currentAdded = line.slice(1);
        }
    }
    
    if (currentRemoved || currentAdded) {
        printDiff(currentRemoved, currentAdded);
    }
    
} catch (err) {
    console.error(err);
}

function printDiff(rem, add) {
    if (!rem || !add) return;
    
    // Find item name
    const matchRem = rem.match(/\|\s*\*\*([^*]+)\*\*\s*\|/);
    const itemName = matchRem ? matchRem[1] : "Unknown";
    
    console.log(`Item: ${itemName}`);
    
    // Check lengths
    if (rem.length !== add.length) {
        console.log(`  Length changed: ${rem.length} -> ${add.length}`);
    }
    
    // Find first differing character
    let diffIdx = -1;
    for (let i = 0; i < Math.min(rem.length, add.length); i++) {
        if (rem[i] !== add[i]) {
            diffIdx = i;
            break;
        }
    }
    
    if (diffIdx !== -1) {
        console.log(`  Differs at char ${diffIdx}:`);
        console.log(`    Rem: ... ${rem.slice(Math.max(0, diffIdx - 20), diffIdx + 40)} ...`);
        console.log(`    Add: ... ${add.slice(Math.max(0, diffIdx - 20), diffIdx + 40)} ...`);
    } else {
        console.log("  Identical lines (possible line ending diff or hidden char)");
    }
}
