const { execSync } = require('child_process');

try {
    const diff = execSync('git diff -- "TO DO/report_lore_compendio.md"', { encoding: 'utf8' });
    const lines = diff.split('\n');
    console.log("Diff lines count:", lines.length);

    let addedLines = [];
    let removedLines = [];

    for (const line of lines) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
            addedLines.push(line);
        } else if (line.startsWith('-') && !line.startsWith('---')) {
            removedLines.push(line);
        }
    }

    console.log(`Found ${addedLines.length} added lines and ${removedLines.length} removed lines.`);

    console.log("Added lines details:");
    addedLines.forEach((l, idx) => {
        console.log(`ADD [${idx + 1}]: ${l.slice(0, 120)}...`);
    });

    console.log("\nRemoved lines details:");
    removedLines.forEach((l, idx) => {
        console.log(`DEL [${idx + 1}]: ${l.slice(0, 120)}...`);
    });

} catch (err) {
    console.error(err);
}
