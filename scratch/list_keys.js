const fs = require('fs');
const workList = JSON.parse(fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json', 'utf8'));
console.log(Object.keys(workList));
