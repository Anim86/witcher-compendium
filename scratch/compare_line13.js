const fs = require('fs');
const { execSync } = require('child_process');

try {
    const headContent = execSync('git show HEAD:"TO DO/report_lore_compendio.md"', { encoding: 'utf8' });
    const localContent = fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_lore_compendio.md', 'utf8');

    const headLines = headContent.split('\n');
    const localLines = localContent.split('\n');

    console.log("HEAD Line 13 length:", headLines[12].length);
    console.log("Local Line 13 length:", localLines[12].length);

    console.log("HEAD Line 13:");
    console.log(headLines[12]);
    console.log("Local Line 13:");
    console.log(localLines[12]);

} catch (err) {
    console.error(err);
}
