const fs = require('fs');
const { execSync } = require('child_process');

try {
    const headContent = execSync('git show HEAD:"TO DO/report_lore_compendio.md"', { encoding: 'utf8' });
    const localContent = fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_lore_compendio.md', 'utf8');

    console.log("HEAD content size:", headContent.length);
    console.log("Local content size:", localContent.length);
    
    if (headContent === localContent) {
        console.log("They are EXACTLY identical!");
    } else {
        console.log("They differ!");
        // Print the difference in length or check what's different
        const headLines = headContent.split('\n');
        const localLines = localContent.split('\n');
        console.log("HEAD lines count:", headLines.length);
        console.log("Local lines count:", localLines.length);
        
        // Find the line where they start differing
        let firstDiff = -1;
        for (let i = 0; i < Math.min(headLines.length, localLines.length); i++) {
            if (headLines[i] !== localLines[i]) {
                firstDiff = i;
                break;
            }
        }
        if (firstDiff !== -1) {
            console.log(`First difference is at line ${firstDiff + 1}`);
            console.log("HEAD line:", headLines[firstDiff].slice(0, 100));
            console.log("Local line:", localLines[firstDiff].slice(0, 100));
        } else {
            console.log("One is a prefix of the other!");
            if (localLines.length > headLines.length) {
                console.log("Local file is longer! Extra lines:");
                console.log(localLines.slice(headLines.length).join('\n'));
            } else {
                console.log("HEAD file is longer!");
            }
        }
    }
} catch (err) {
    console.error("Error during comparison:", err);
}
