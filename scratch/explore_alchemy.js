const fs = require('fs');
const path = require('path');

const baseDir = "e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\ALCHIMIA_E_ARTIGIANATO";
const results = [];

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.json')) {
            try {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                const name = data.name || "Unknown";
                const type = data.type || "Unknown";
                const systemType = data.system && data.system.type || "";
                const relPath = path.relative(baseDir, fullPath);
                results.push({
                    name: name,
                    type: type,
                    systemType: systemType,
                    relPath: relPath,
                    file: file
                });
            } catch (e) {
                console.error("Error reading file:", fullPath, e);
            }
        }
    });
}

walk(baseDir);
console.log(`Found ${results.length} alchemy/crafting assets.`);
fs.writeFileSync("e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\alchemy_assets.json", JSON.stringify(results, null, 4), 'utf8');
console.log("Results saved to alchemy_assets.json");
