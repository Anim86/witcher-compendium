const { execSync } = require('child_process');

try {
    const diff = execSync('git show 97988a9e -- "TO DO/report_lore_compendio.md"', { encoding: 'utf8' });
    const lines = diff.split('\n');
    console.log("Total diff lines in commit:", lines.length);

    // Let's filter for deleted lines at the end of the file or check if there was a large deletion
    let deletedCount = 0;
    let addedCount = 0;
    for (const line of lines) {
        if (line.startsWith('-') && !line.startsWith('---')) {
            deletedCount++;
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
            addedCount++;
        }
    }
    console.log("Deleted lines:", deletedCount);
    console.log("Added lines:", addedCount);

    // Let's print the last 100 lines of the git show command to see the end of the diff
    console.log("------------------------");
    console.log("Last 50 lines of git show:");
    console.log(lines.slice(-50).join('\n'));
} catch (err) {
    console.error(err);
}
