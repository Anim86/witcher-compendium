const fs = require('fs');
const path = require('path');

const spellsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells/';

const targetSpells = [
    // Novice
    "Aine Verseos", "Alzare le Fiamme", "Bussola Magica", "Codi Bywyd", "Incantesimo Diagnostico",
    "Lampo Magico", "Lastra di Ghiaccio", "Penna di Luthien", "Rhwystr Graig", "Sacca d'aria",
    // Journeyman
    "Acquazzone", "Adenydd", "Aenye", "Anialwch", "Cenlly Graig",
    "Controllare Acque", "Comando Mentale", "Derviscio", "Fiammata", "Illusione",
    // Master
    "Tuono di Alzur", "Dissipazione", "Dividere le Acque", "Effetto Specchio", "Portale", "Teletrasporto", "Soffio di Korath"
];

const foundItems = [];

const files = fs.readdirSync(spellsDir);
files.forEach(file => {
    if (!file.endsWith('.json')) return;
    const content = JSON.parse(fs.readFileSync(path.join(spellsDir, file), 'utf8'));
    
    const normName = content.name.toLowerCase().trim();
    const match = targetSpells.find(ts => ts.toLowerCase() === normName || (normName === "sacca daria" && ts === "Sacca d'aria"));

    if (match) {
        if (content.system.pendingStats !== undefined) delete content.system.pendingStats;
        // Standardize folder
        content.folder = "Incantesimi Mago";
        foundItems.push(content);
    }
});

// PATCH 1: Teletrasporto (Overwriting found one if exists)
const teletrasportoPatch = {
  "name": "Teletrasporto",
  "type": "spell",
  "folder": "Incantesimi Mago",
  "system": {
    "activation": { "type": "spell", "cost": 10 },
    "range": { "value": 0, "units": "special", "label": "N/A" },
    "duration": { "units": "inst" },
    "target": { "value": 1, "type": "self" },
    "damage": null,
    "element": "Misto",
    "spellLevel": "Maestro",
    "source": "Tomo Base",
    "pendingStats": false,
    "variants": [
      {
        "name": "Luogo Noto",
        "CD": 15,
        "failureDeviation": "1d6 km casuale"
      },
      {
        "name": "Alla Cieca",
        "CD": 20,
        "requiresObject": true,
        "failureDeviation": "2d10 km casuale"
      }
    ],
    "limitations": [
      "Solo incantatore (no passeggeri)",
      "Solo ciò che indossa o tiene in mano",
      "Tentare con altri: trasporta solo l'incantatore"
    ],
    "description": {
      "value": "Teletrasporta l'incantatore in luogo noto (CD 15) o alla cieca con oggetto del luogo (CD 20). Fallimento: deviazione 1d6 km (noto) o 2d10 km (cieco). Non trasporta altri: l'incantatore parte solo. Interazione Portale: destinazione ignota funziona come Teletrasporto Alla Cieca."
    }
  },
  "img": "systems/witcher/assets/icons/magia/teletrasporto.webp"
};

const teleIdx = foundItems.findIndex(i => i.name.toLowerCase() === "teletrasporto");
if (teleIdx !== -1) {
    foundItems[teleIdx] = teletrasportoPatch;
} else {
    foundItems.push(teletrasportoPatch);
}

// PATCH 2: Portale
const portale = foundItems.find(i => i.name.toLowerCase() === "portale");
if (portale) {
    portale.system.unknownDestinationRule = {
        "type": "Teletrasporto Alla Cieca",
        "CD": 20,
        "deviation": "2d10 km",
        "requiresObject": false,
        "note": "Per Portale basta non conoscere la destinazione, non serve oggetto del luogo"
    };
}

// PATCH 3: Esiti Disastri Magici
const esitiDisastri = {
  "name": "Esiti Disastri Magici",
  "type": "RollTable",
  "formula": "1d10",
  "results": [
    {
      "range": [1, 6],
      "text": "La magia crepita e scintilla: l'incantatore subisce 1 danno per ogni punto del disastro, ma l'incantesimo ha comunque effetto."
    },
    {
      "range": [7, 9],
      "text": "La magia s'incendia dentro l'incantatore. L'incantesimo FALLISCE. Applica effetto disastro elementale (tabella elemento usato)."
    },
    {
      "range": [10, 10],
      "text": "Esplosione devastante. L'incantesimo FALLISCE. Disastro elementale + tutti gli oggetti focus esplodono: 1d10 danni, raggio 2m."
    }
  ]
};

// PATCH 4: Disastri Elementali
const disastriElementali = {
  "name": "Disastri Elementali",
  "type": "RollTable",
  "entries": [
    {
      "element": "Fuoco",
      "formula": "fixed",
      "effect": "Il corpo dell'incantatore prende fuoco. 1 danno per ogni punto del disastro + A Fuoco.",
      "conditions": ["A Fuoco"],
      "damage": "1*disasterPoints"
    },
    {
      "element": "Acqua",
      "formula": "fixed",
      "effect": "Crosta di ghiaccio scricchiolante. 1 danno per ogni punto del disastro + Congelato.",
      "conditions": ["Congelato"],
      "damage": "1*disasterPoints"
    },
    {
      "element": "Aria",
      "formula": "fixed",
      "effect": "Il vento soffia intorno all'incantatore. 1 danno per ogni punto del disastro + scagliato indietro di 2m.",
      "conditions": ["Knockback 2m"],
      "damage": "1*disasterPoints"
    },
    {
      "element": "Terra",
      "formula": "fixed",
      "effect": "La terra trema intorno all'incantatore. 1 danno per ogni punto del disastro + Stordito.",
      "conditions": ["Stordito"],
      "damage": "1*disasterPoints"
    },
    {
      "element": "Misto",
      "formula": "1d4",
      "note": "GM sceglie casualmente tra gli effetti sopra.",
      "usedBy": ["Preti", "Druidi"],
      "ruleRef": "I preti usano sempre la tabella Misto perché estrapolano la magia da vari elementi tramite devozione, non incanalano direttamente il Caos grezzo.",
      "results": [
        { "range": [1,1], "text": "A Fuoco (come Fuoco)" },
        { "range": [2,2], "text": "Congelato (come Acqua)" },
        { "range": [3,3], "text": "Knockback 2m (come Aria)" },
        { "range": [4,4], "text": "Stordito (come Terra)" }
      ]
    }
  ]
};

// PATCH 5: SystemRule
const systemRule = {
  "name": "Sovraffaticamento Magico",
  "type": "SystemRule",
  "rules": {
    "onOvercast": {
      "damage": "5 PS per punto oltre Soglia Vigore",
      "triggerRollTable": "Esiti Disastri Magici",
      "elementTable": {
        "mage": "elemento incantesimo usato",
        "priest": "Misto (sempre)",
        "druid": "Misto (sempre)"
      }
    }
  }
};

const finalOutput = [
    ...foundItems,
    esitiDisastri,
    disastriElementali,
    systemRule
];

fs.writeFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/final_magic_compendium.json', JSON.stringify(finalOutput, null, 2));

console.log(`Final Compendium Generated: ${finalOutput.length} items total.`);
console.log(`Spells: ${foundItems.length}`);
console.log(`Tables: 2`);
console.log(`Rules: 1`);
