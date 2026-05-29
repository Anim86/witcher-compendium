const fs = require('fs');
const path = require('path');

const itJsonPath = path.join(__dirname, '..', 'TheWitcherItaNewSystem', 'lang', 'it.json');
const professionsDir = path.join(__dirname, 'src-packs', 'PROFESSIONI_E_ABILITA', 'witcher-professions');

const itJson = JSON.parse(fs.readFileSync(itJsonPath, 'utf8'));
const skillsData = itJson.WITCHER.skills;

// Build reverse map: 'Rapidità di Mano' -> 'sleightOfHand'
const reverseMap = {};
for (const [key, value] of Object.entries(skillsData)) {
    if (value && value.label) {
        // use lower case for matching
        const labelClean = value.label.replace(/\s*\(\d+\)\s*/g, '').toLowerCase().trim();
        reverseMap[labelClean] = key;
    }
}

// Map overrides for minor mismatches if any
reverseMap["lame corte"] = "smallblades";
reverseMap["falsificare"] = "forgery";
reverseMap["pronto soccorso"] = "firstaid";
reverseMap["lingua comune"] = "commonSpeech";
reverseMap["lingua antica"] = "elderSpeech";
reverseMap["nanico"] = "dwarvenSpeech";
reverseMap["5 abilità di combattimento a scelta (archi"] = "archery";
reverseMap["balestre"] = "crossbow";
reverseMap["scherma"] = "swordsmanship";
reverseMap["armi in asta"] = "staffspear";
reverseMap["rissa"] = "brawling";
reverseMap["tattica)"] = "tactics";

const files = fs.readdirSync(professionsDir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(professionsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.system && typeof data.system.professionSkills === 'string') {
        let skillStr = data.system.professionSkills;
        // Fix Bardo
        skillStr = skillStr.replace("Linguaggio (1 a scelta)", "Lingua Comune, Lingua Antica, Nanico");
        // Fix Mercante
        skillStr = skillStr.replace("Linguaggio (2 a scelta)", "Lingua Comune, Lingua Antica, Nanico");
        
        const skillsArray = skillStr.split(',').map(s => s.trim()).filter(Boolean);
        const newSkills = skillsArray.map(s => {
            const clean = s.toLowerCase();
            const key = reverseMap[clean];
            if (!key) {
                console.warn(`Warning: Could not map skill "${s}" in profession ${data.name}`);
                return s; // keep original if fail
            }
            return key;
        });
        
        data.system.professionSkills = newSkills;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`Migrated ${file}`);
    }
}
