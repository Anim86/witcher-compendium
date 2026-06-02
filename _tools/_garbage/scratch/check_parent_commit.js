const { execSync } = require('child_process');

try {
    const parentContent = execSync('git show 97988a9e~1:"TO DO/report_lore_compendio.md"', { encoding: 'utf8' });
    const lines = parentContent.split('\n');
    console.log("Parent commit report lines count:", lines.length);
    console.log("First 15 lines of parent commit:");
    console.log(lines.slice(0, 15).join('\n'));
    console.log("------------------------");
    console.log("Last 40 lines of parent commit:");
    console.log(lines.slice(-40).join('\n'));
} catch (err) {
    console.error("Error showing parent commit:", err);
}
