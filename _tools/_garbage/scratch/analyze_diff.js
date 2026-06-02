const fs = require('fs');
const diff = fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/diff_report.txt', 'utf8');
const lines = diff.split('\n');
console.log("Total diff lines:", lines.length);

const additions = lines.filter(l => l.startsWith('+') && !l.startsWith('+++'));
const deletions = lines.filter(l => l.startsWith('-') && !l.startsWith('---'));

console.log("Number of additions:", additions.length);
console.log("Number of deletions:", deletions.length);

// Write some addition samples
console.log("Sample additions (first 10):");
for (let i = 0; i < Math.min(additions.length, 10); i++) {
    console.log(additions[i].slice(0, 150));
}

// Write some addition samples from the end of additions
console.log("Sample additions (last 10):");
for (let i = Math.max(0, additions.length - 10); i < additions.length; i++) {
    console.log(additions[i].slice(0, 150));
}
