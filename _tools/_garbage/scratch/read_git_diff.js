const { execSync } = require('child_process');

try {
    const diff = execSync('git diff -- "TO DO/report_lore_compendio.md"', { encoding: 'utf8' });
    console.log("Git diff output length:", diff.length);
    if (diff.length === 0) {
        console.log("No differences between local file and git index.");
    } else {
        const lines = diff.split('\n');
        console.log("First 30 lines of diff:");
        console.log(lines.slice(0, 30).join('\n'));
        console.log("------------------------");
        console.log("Last 30 lines of diff:");
        console.log(lines.slice(-30).join('\n'));
    }
} catch (err) {
    console.error(err);
}
