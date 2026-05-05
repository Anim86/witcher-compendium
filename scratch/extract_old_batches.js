const cp = require('child_process');
const batches = ['34', '35_weapons', '36_weapons'];
batches.forEach(b => {
    try {
        const out = cp.execSync(`git show 6889325a3c4ea479def7b0e5be016ed4ab522147:scratch/prompts_batch_${b}.html`).toString();
        const matches = out.match(/<div class="name">(.*?)<\/div>/g);
        if (matches) {
            console.log(`Batch ${b.split('_')[0]}:`);
            matches.forEach(m => {
                console.log(`- ${m.replace(/<[^>]+>/g, '')}`);
            });
            console.log('');
        }
    } catch (e) {
        console.error(`Error reading batch ${b}: ${e.message}`);
    }
});
