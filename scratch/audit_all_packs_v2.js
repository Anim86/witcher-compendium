const fs = require('fs');
const workListPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';
const data = JSON.parse(fs.readFileSync(workListPath, 'utf8'));

const results = {};

for (const [packName, items] of Object.entries(data)) {
    items.forEach(item => {
        let isSuspicious = false;
        let reason = "";
        const name = item.name.trim();

        // 1. Ends with preposition or conjunction
        if (/\s(di|da|per|con|e|il|lo|la|i|gli|le|un|una|uno|degli|della|dell|dello)$/i.test(name)) {
            isSuspicious = true;
            reason = "Truncated suffix";
        }
        // 2. Ends with colon
        else if (name.endsWith(":")) {
            isSuspicious = true;
            reason = "Ends with colon";
        }
        // 3. Just a generic prefix
        else if (["Formula", "Diagramma", "Ricetta", "Schema", "Olio", "Elisir", "Pozione", "Decotto"].includes(name)) {
            isSuspicious = true;
            reason = "Pure prefix";
        }
        // 4. Pattern "Word di" or "Word de" at the end
        else if (/\w+\s(di|de)$/i.test(name)) {
            isSuspicious = true;
            reason = "Potential truncation (Word di)";
        }
        // 5. Check for items named exactly like their pack prefix
        // ...

        if (isSuspicious) {
            if (!results[packName]) results[packName] = [];
            results[packName].push({ name: item.name, reason: reason });
        }
    });
}

console.log(JSON.stringify(results, null, 2));
