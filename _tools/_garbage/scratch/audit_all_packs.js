const fs = require('fs');
const workListPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';
const data = JSON.parse(fs.readFileSync(workListPath, 'utf8'));

const suspiciousPatterns = [
    / di$/i,
    / da$/i,
    / per$/i,
    / dell'$/i,
    / della$/i,
    / degli$/i,
    / delle$/i,
    / con$/i,
    / e$/i,
    /:$/
];

const genericTerms = [
    "Erbe", "Fuoco", "Inchiostro", "Perla", "Polvere", "Pozione", "Soluzione", "Tempesta",
    "Formula", "Diagramma", "Ricetta", "Schema", "Olio"
];

const results = {};

for (const [packName, items] of Object.entries(data)) {
    items.forEach(item => {
        let isSuspicious = false;
        let reason = "";

        // Check patterns
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(item.name)) {
                isSuspicious = true;
                reason = "Truncated suffix (" + item.name + ")";
                break;
            }
        }

        // Check generic terms
        if (!isSuspicious) {
            for (const term of genericTerms) {
                if (item.name.toLowerCase() === term.toLowerCase()) {
                    isSuspicious = true;
                    reason = "Generic term (" + item.name + ")";
                    break;
                }
            }
        }

        if (isSuspicious) {
            if (!results[packName]) results[packName] = [];
            results[packName].push({ name: item.name, reason: reason });
        }
    });
}

console.log(JSON.stringify(results, null, 2));
