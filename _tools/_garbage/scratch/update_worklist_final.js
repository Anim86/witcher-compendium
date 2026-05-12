const fs = require('fs');
const workListPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';
const data = JSON.parse(fs.readFileSync(workListPath, 'utf8'));

// 1. Rename in witcher-schematics
if (data['witcher-schematics']) {
    data['witcher-schematics'].forEach(item => {
        if (item.name === "Nanica") {
            item.name = "Schema: Rinforzo Nano";
            item.filename = "Schema_Rinforzo_Nano.webp";
        } else if (item.name === "Elfica") {
            item.name = "Schema: Rinforzo Elfico";
            item.filename = "Schema_Rinforzo_Elfico.webp";
        } else if (item.name === "Fibra") {
            item.name = "Schema: Rinforzo in Fibra";
            item.filename = "Schema_Rinforzo_in_Fibra.webp";
        }
    });
}

// 2. Rename in witcher-weapons
if (data['witcher-weapons']) {
    data['witcher-weapons'].forEach(item => {
        if (item.name === "Lupo") {
            item.name = "Lupo (Spada Lunga Reliquia)";
            item.filename = "Lupo_Spada_Lunga_Reliquia.webp";
        }
    });
}

// 3. Remove in witcher-components
if (data['witcher-components']) {
    data['witcher-components'] = data['witcher-components'].filter(item => item.name !== "Olio");
}

fs.writeFileSync(workListPath, JSON.stringify(data, null, 2), 'utf8');
console.log("Successfully updated work_list.json with new names and removals.");
