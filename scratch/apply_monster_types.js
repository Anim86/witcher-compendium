import fs from 'fs';
import path from 'path';

const SRC_DIR = '_tools/src-packs';
const MAPPING = {
    // MOSTRI
    "Amalgama Di Corpi": "Elementa",
    "Arachas": "Insectoid",
    "Archeospora": "CursedOne",
    "Armatura Marionetta": "Elementa",
    "Armatura Vivente": "Elementa",
    "Arpia": "Hybrid",
    "Barbegazi": "Ogroid",
    "Barghest": "Specter",
    "Battiroccia": "Elementa",
    "Bestia del Lago Tankred": "Relict",
    "Bes": "Relict",
    "Botchling": "CursedOne",
    "Bruxa": "Vampire",
    "Bullvore": "Necrophage",
    "Casglydd": "Relict",
    "Ciclope": "Ogroid",
    "Cinghiale": "Beast",
    "Cockatrice": "Draconid",
    "Demone Putrefatto": "Necrophage",
    "Demoni": "Relict",
    "Drowner": "Necrophage",
    "Elementale di Fuoco": "Elementa",
    "Elementale di Ghiaccio": "Elementa",
    "Elementale di Terra": "Elementa",
    "Endriaghe": "Insectoid",
    "Fenice": "Hybrid",
    "Foglet": "Necrophage",
    "Frightener": "Insectoid",
    "Garkain": "Vampire",
    "Ghoul": "Necrophage",
    "Gigascorpione": "Insectoid",
    "Godling": "Relict",
    "Golem": "Elementa",
    "Grande Orso": "Beast",
    "Grifoni": "Hybrid",
    "Hym": "Specter",
    "Katakan": "Vampire",
    "La Damigella Circondata di Farfalle": "Relict",
    "Leshen": "Relict",
    "Lupi e Warg": "Beast",
    "Lupi Mannari": "CursedOne",
    "Manticora": "Hybrid",
    "Mari Lwyd": "Relict",
    "Nekker": "Ogroid",
    "Oritteropo": "Beast",
    "Orso": "Beast",
    "Pantera": "Beast",
    "Penitente": "Specter",
    "Pesta": "Specter",
    "Plumard": "Vampire",
    "Scaltrocertola": "Draconid",
    "Scolopendra Gigante": "Insectoid",
    "Shaelmaar": "Relict",
    "Oberhasil (Silvano)": "Relict",
    "Sirene": "Hybrid",
    "Streghe dei Sepolcri": "Necrophage",
    "Succube & Incubo": "Relict",
    "Troll": "Ogroid",
    "Troll di Mahakam (Flip)": "Ogroid",
    "Troll di Roccia": "Ogroid",
    "Vampiro Superiore": "Vampire",
    "Vendigo": "Relict",
    "Vero Drago": "Draconid",
    "Viverne": "Draconid",
    "Wraith": "Specter",
    "Wraith Diurni": "Specter",
    
    // PNG (acting as monsters)
    "Arcieri Scoia’tael": "Humanoid",
    "Banditi": "Humanoid"
};

function walk(dir, callback) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath, callback);
        } else {
            callback(fullPath);
        }
    }
}

function applyMapping() {
    let updatedCount = 0;
    let fallbackCount = 0;

    walk(SRC_DIR, (filePath) => {
        if (!filePath.endsWith('.json')) return;

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            if (data.type === 'monster') {
                const name = data.name;
                const typeToApply = MAPPING[name];

                if (typeToApply) {
                    if (!data.system) data.system = {};
                    if (!data.system.details) data.system.details = {};
                    
                    data.system.details.monsterType = typeToApply;
                    
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
                    console.log(`✅ [UPDATED] ${name} -> ${typeToApply}`);
                    updatedCount++;
                } else {
                    console.warn(`⚠️ [MISSING MAPPING] ${name} (${filePath})`);
                    fallbackCount++;
                }
            }
        } catch (e) {
            console.error(`❌ [ERROR] ${filePath}: ${e.message}`);
        }
    });

    console.log(`\nMapping complete!`);
    console.log(`Total Updated: ${updatedCount}`);
    console.log(`Total Missed: ${fallbackCount}`);
}

applyMapping();
