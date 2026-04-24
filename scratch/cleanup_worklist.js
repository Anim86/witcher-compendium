const fs = require('fs');
const path = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const toDelete = [
    "Furia di",
    "Lacrime di",
    "Pozione di",
    "Respiro di",
    "Sali da",
    "Erbe",
    "Fuoco",
    "Polvere",
    "Soluzione",
    "Inchiostro",
    "Pozione"
];

data["witcher-alchemy"] = data["witcher-alchemy"].filter(item => !toDelete.includes(item.name));

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log("Removed " + toDelete.length + " items from witcher-alchemy.");
