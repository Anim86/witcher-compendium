import fs from 'fs';
import path from 'path';

const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_schemi_asset.md';

function main() {
    if (!fs.existsSync(reportPath)) {
        console.error("Report file not found!");
        return;
    }

    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.split('\n');

    let currentCategory = 'Unknown';
    const categories = {};

    for (const line of lines) {
        if (line.startsWith('### ')) {
            currentCategory = line.replace('### ', '').trim();
            categories[currentCategory] = [];
        } else if (line.startsWith('| [ ] |')) {
            // Found a remaining schematic
            const parts = line.split('|');
            if (parts.length > 2) {
                const name = parts[2].replace(/\*\*/g, '').trim();
                const file = parts[3].trim();
                const prompt = parts[4].trim();
                categories[currentCategory].push({ name, file, prompt });
            }
        }
    }

    console.log("=== REMAINING SCHEMATICS TO GENERATE ===");
    let total = 0;
    for (const [cat, items] of Object.entries(categories)) {
        if (items.length > 0) {
            console.log(`\n📂 Category: ${cat} (${items.length} items left)`);
            items.forEach((item, idx) => {
                console.log(`  ${idx + 1}. ${item.name} (${item.file})`);
            });
            total += items.length;
        }
    }
    console.log(`\n📊 Total remaining schematics: ${total}`);
}

main();
