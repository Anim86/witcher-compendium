const { execSync } = require('child_process');

try {
    const stashes = execSync('git stash list', { encoding: 'utf8' }).split('\n').filter(Boolean);
    console.log(`Found ${stashes.length} stashes.`);
    
    for (let i = 0; i < stashes.length; i++) {
        const stashName = `stash@{${i}}`;
        console.log(`Checking ${stashName}: ${stashes[i]}`);
        try {
            const files = execSync(`git stash show --name-only ${stashName}`, { encoding: 'utf8' });
            if (files.includes('report_lore_compendio.md')) {
                console.log(`  -> FOUND report_lore_compendio.md in ${stashName}!`);
                const diff = execSync(`git stash show -p ${stashName} -- "TO DO/report_lore_compendio.md"`, { encoding: 'utf8' });
                console.log("  Diff length:", diff.length);
                console.log("  First 500 chars of diff:");
                console.log(diff.slice(0, 500));
            }
        } catch (e) {
            console.error(`  Error checking ${stashName}:`, e.message);
        }
    }
} catch (err) {
    console.error(err);
}
