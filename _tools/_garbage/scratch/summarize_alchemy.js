const fs = require('fs');
const assets = JSON.parse(fs.readFileSync("e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\alchemy_assets.json", 'utf8'));

const groups = {};
assets.forEach(asset => {
    const parts = asset.relPath.split(/[\\/]/);
    const category = parts[0];
    const key = `${category} (Type: ${asset.type}, SystemType: ${asset.systemType})`;
    if (!groups[key]) {
        groups[key] = [];
    }
    groups[key].push(asset);
});

console.log("Groups and counts:");
for (const [key, list] of Object.entries(groups)) {
    console.log(`- ${key}: ${list.length} assets`);
    console.log("  Examples:", list.slice(0, 3).map(a => a.name).join(", "));
}
