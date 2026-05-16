const fs = require('fs');
const path = require('path');

const monstersDir = path.join(__dirname, '..', 'src-packs', 'BESTIARIO', 'witcher-monsters');

const statsData = {
    "Elementale di Fuoco": {
        stats: { int: 1, ref: 7, dex: 6, body: 11, spd: 5, emp: 1, cra: 1, will: 9, luck: 0, armor: 15 },
        derived: { hp: 100, sta: 50, rec: 10 },
        defenses: { dodge: 14, athletics: 10, brawling: 16 },
        capacities: ["Soffocare le Fiamme", "Alimentato dal Fuoco", "Schianto Fiammeggiante", "Aura di Fornace", "Anello di Fuoco"],
        weight: 100,
        file: "Elementale_di_Fuoco_0b1a8754f3c2e96d.json"
    },
    "Elementale di Ghiaccio": {
        stats: { int: 1, ref: 6, dex: 5, body: 13, spd: 3, emp: 1, cra: 1, will: 9, luck: 0, armor: 20 },
        derived: { hp: 110, sta: 55, rec: 11 },
        defenses: { brawling: 15 },
        capacities: ["Schianto Ghiacciato", "Anello di Ghiaccio", "Congelare Liquidi"],
        weight: 130,
        file: "Elementale_di_Ghiaccio_b326af7c5e18490d.json"
    },
    "Glustyworp": {
        stats: { int: 1, ref: 8, dex: 7, body: 10, spd: 7, emp: 1, cra: 3, will: 5, luck: 0, armor: 10 },
        derived: { hp: 70, sta: 35, rec: 7 },
        defenses: { dodge: 16, athletics: 12, brawling: 17 },
        capacities: ["Movimento Limitato (su terraferma RIF, DES e VEL scendono a 3)", "Anfibio", "Antenne Sensibili", "Mimetizzazione"],
        weight: 100,
        file: "glustyworp_0275fca75d31b216.json"
    },
    "Scolopendra Gigante": {
        stats: { int: 1, ref: 7, dex: 6, body: 5, spd: 6, emp: 1, cra: 1, will: 4, luck: 0, armor: 8 },
        derived: { hp: 20, sta: 20, rec: 4 },
        defenses: { dodge: 10, athletics: 11, brawling: 11 },
        capacities: ["Sensibile alle Vibrazioni", "Ventre Molle (Armatura 3 sul ventre)", "Scavare", "Anello Protettivo"],
        weight: 50,
        file: "Scolopendra_Gigante_ea4189d5603b2c7f.json"
    },
    "Cultista del Coram Agh Tera": {
        stats: { int: 7, ref: 7, dex: 6, body: 7, spd: 6, emp: 7, cra: 5, will: 9, luck: 0, armor: 0 },
        derived: { hp: 40, rec: 8 },
        defenses: { dodge: 15, athletics: 11, brawling: 13 },
        capacities: ["Rituali (Piromanzia, Rituale Purificatore)", "Fatture (L'Incubo, Il Bacio della Pesta)", "Spinto dalla Rabbia"],
        file: "cultista_del_coram_agh_tera_418c67ecf457abcb.json"
    },
    "La Damigella Circondata di Farfalle": {
        stats: { int: 6, ref: 14, dex: 12, body: 8, spd: 10, emp: 1, cra: 6, will: 8, luck: 0, armor: 0 },
        derived: { sta: 40, rec: 9 },
        defenses: { dodge: 14, athletics: 12, brawling: 13 },
        capacities: ["Salute Proporzionale (15 PS per ogni ciocca)", "Parassita", "Attacchi Proporzionali", "Immunità alle Ferite Critiche", "Spinta dall'Ira", "Sensibile alle Vibrazioni", "Vulnerabilità all'Acciaio"],
        weight: 80,
        file: "la_damigella_circondata_di_farfalle_5d75b59543f2c2c3.json"
    },
    "Armatura Marionetta": {
        stats: { int: 1, ref: 8, dex: 6, body: 10, spd: 4, emp: 1, cra: 3, will: 8 },
        derived: { hp: 50 },
        defenses: { dodge: 12, athletics: 10, brawling: 14 },
        capacities: ["Costrutto", "Punto Debole: Tagliare i Fili"],
        armor: 15,
        file: "armatura_marionetta_b0d266ed3861ded7.json"
    },
    "Arpia": {
        stats: { int: 1, ref: 7, dex: 6, body: 5, spd: 6, emp: 1, cra: 1, will: 4 },
        derived: { hp: 20 },
        defenses: { dodge: 14, athletics: 10, brawling: 12 },
        capacities: ["Volo", "Cleptomania"],
        armor: 0,
        file: "Arpia_1e728fda490563cb.json"
    },
    "Barghest": {
        stats: { int: 1, ref: 7, dex: 6, body: 5, spd: 7, emp: 1, cra: 1, will: 6 },
        derived: { hp: 25 },
        defenses: { dodge: 13, athletics: 11, brawling: 12 },
        capacities: ["Carica Spettrale", "Brando Incorporeo"],
        armor: 0,
        file: "Barghest_1873eda52b0c64f9.json"
    },
    "Battiroccia": {
        stats: { int: 1, ref: 6, dex: 6, body: 12, spd: 4, emp: 1, cra: 1, will: 6 },
        derived: { hp: 60 },
        defenses: { dodge: 15, athletics: 14, brawling: 13 },
        capacities: ["Pelle di Roccia", "Letargo"],
        armor: 10,
        file: "Battiroccia_52f91a6ec3074bd8.json"
    },
    "Bullvore": {
        stats: { int: 2, ref: 7, dex: 5, body: 12, spd: 4, emp: 1, cra: 1, will: 6 },
        derived: { hp: 60 },
        defenses: { dodge: 11, athletics: 9, brawling: 14 },
        capacities: ["Vomito Acido", "Carica", "Rigenerazione"],
        armor: 10,
        file: "Bullvore_a26b1940ed7c3f85.json"
    },
    "Demone Putrefatto": {
        stats: { int: 1, ref: 6, dex: 6, body: 5, spd: 7, emp: 1, cra: 1, will: 4 },
        derived: { hp: 20 },
        defenses: { dodge: 12, athletics: 12, brawling: 12 },
        capacities: ["Sangue Acido", "Esplosione alla Morte"],
        armor: 0,
        file: "Demone_Putrefatto_0e418579b3fa26dc.json"
    },
    "Elementale di Terra": {
        stats: { int: 1, ref: 6, dex: 5, body: 13, spd: 3, emp: 1, cra: 1, will: 9 },
        derived: { hp: 110 },
        defenses: { dodge: 12, athletics: 9, brawling: 15 },
        capacities: ["Carica Implacabile", "Pelle Rocciosa"],
        armor: 20,
        file: "Elementale_di_Terra_279c64d03ebf1a85.json"
    },
    "Frightener": {
        stats: { int: 1, ref: 9, dex: 7, body: 18, spd: 8, emp: 1, cra: 1, will: 6 },
        derived: { hp: 120 },
        defenses: { dodge: 15, athletics: 9, brawling: 17 },
        capacities: ["Ululato Stordente", "Salto Prodigioso"],
        armor: 30,
        file: "Frightener_4fb21c96538da7e0.json"
    },
    "Godling": {
        stats: { int: 5, ref: 8, dex: 8, body: 3, spd: 6, emp: 8, cra: 7, will: 7 },
        derived: { hp: 15 },
        defenses: { dodge: 14, athletics: 13, brawling: 8 },
        capacities: ["Odore del Bosco", "Punto Debole: Bardana"],
        armor: 0,
        file: "Godling_ea0b462d9f5871c3.json"
    },
    "Hym": {
        stats: { int: 6, ref: 10, dex: 8, body: 8, spd: 8, emp: 3, cra: 6, will: 10 },
        derived: { hp: 40 },
        defenses: { dodge: 18, athletics: 16, brawling: 17 },
        capacities: ["Parassita dell'Ombra", "Aura di Terrore", "Incorporeo", "Assorbire Luce"],
        armor: 0,
        file: "Hym_e5df03bc61479a82.json"
    },
    "Pesta": {
        stats: { int: 4, ref: 9, dex: 8, body: 6, spd: 7, emp: 1, cra: 5, will: 8 },
        derived: { hp: 30 },
        defenses: { dodge: 15, athletics: 15, brawling: 15 },
        capacities: ["Aura di Malattia", "Forma Incorporea"],
        armor: 0,
        file: "Pesta_463e78129a5b0dcf.json"
    },
    "Succube & Incubo": {
        stats: { int: 6, ref: 8, dex: 7, body: 5, spd: 6, emp: 10, cra: 6, will: 8 },
        derived: { hp: 25 },
        defenses: { dodge: 14, athletics: 14, brawling: 13 },
        capacities: ["Sguardo Ammaliante", "Telepatia", "Magia (Segno Axii)"],
        armor: 0,
        file: "succube_incubo_7ed094f23185bc6a.json"
    },
    "Vendigo": {
        stats: { int: 4, ref: 10, dex: 9, body: 12, spd: 8, emp: 1, cra: 6, will: 8 },
        derived: { hp: 60 },
        defenses: { dodge: 18, athletics: 17, brawling: 18 },
        capacities: ["Fame Inestinguibile", "Evocare Tormenta"],
        armor: 0,
        file: "Vendigo_e4a39bc56f780d12.json"
    },
    "Vero Drago": {
        stats: { int: 8, ref: 10, dex: 8, body: 16, spd: 10, emp: 4, cra: 5, will: 10 },
        derived: { hp: 150 },
        defenses: { dodge: 18, athletics: 15, brawling: 20 },
        capacities: ["Soffio Elementale", "Volo", "Creatura Immensa"],
        armor: 25,
        file: "Vero_Drago_b3a1d9c72e4f0a6d.json"
    }
};

const attackData = {
    "Alp": [
        { name: "Morso", base: 16, damage: "5d6", type: "P", effects: "Succhiare Sangue, Trapassare", rof: 1 },
        { name: "Artigli", base: 16, damage: "4d6", type: "T", effects: "Sanguinamento (50%)", rof: 2 }
    ],
    "Arachas": [
        { name: "Chele", base: 15, damage: "5d6", type: "T", effects: "Veleno (25%)", rof: 2 }
    ],
    "Archeospora": [
        { name: "Morso", base: 12, damage: "2d6+2", type: "P", effects: "Portata", rof: 1 }
    ],
    "Barbegazi": [
        { name: "Artigli", base: 13, damage: "2d6+2", type: "T", effects: "Nessuno", rof: 2 },
        { name: "Morso", base: 13, damage: "4d6", type: "P", effects: "Sanguinamento (30%)", rof: 1 }
    ],
    "Botchling": [
        { name: "Morso", base: 16, damage: "3d6", type: "P", effects: "Succhiare Sangue, Trapassare", rof: 1 },
        { name: "Artigli", base: 16, damage: "5d6+4", type: "T", effects: "Nessuno", rof: 2 }
    ],
    "Bruxa": [
        { name: "Morso", base: 24, damage: "5d6+3", type: "P", effects: "Sanguinamento (75%), Succhiare Sangue, Trapassare Migliorato", rof: 1 },
        { name: "Artigli", base: 24, damage: "4d6+4", type: "T/P", effects: "Sanguinamento (50%), Trapassare", rof: 2 }
    ],
    "Casglydd": [
        { name: "Artigli", base: 16, damage: "4d6", type: "T", effects: "Sanguinamento (25%)", rof: 2 }
    ],
    "Cockatrice": [
        { name: "Becco", base: 17, damage: "5d6", type: "P", effects: "Avvelenato (50%)", rof: 1 },
        { name: "Artigli", base: 17, damage: "4d6+3", type: "T", effects: "Sanguinamento (50%)", rof: 2 },
        { name: "Spazzata Coda", base: 17, damage: "4d6+3", type: "T", effects: "Portata, Sanguinamento (75%)", rof: 1 },
        { name: "Colpo d'Ala", base: 17, damage: "2d6", type: "C", effects: "Vacillante (25%)", rof: 1 }
    ],
    "Bes": [
        { name: "Artigli", base: 16, damage: "6d6+2", type: "T", effects: "Nessuno", rof: 2 },
        { name: "Corna", base: 16, damage: "8d6", type: "P", effects: "-1 Danno Armatura (Ablativo)", rof: 1 },
        { name: "Morso", base: 16, damage: "7d6", type: "P", effects: "Sanguinamento (50%)", rof: 1 }
    ],
    "Drowner": [
        { name: "Artigli", base: 12, damage: "2d6+2", type: "T", effects: "Nessuno", rof: 2 }
    ],
    "Endriaghe (Lavoratore)": [
        { name: "Chele", base: 11, damage: "3d6", type: "T", effects: "Veleno (25%)", rof: 1 }
    ],
    "Endriaghe (Guerriero)": [
        { name: "Chele", base: 13, damage: "4d6", type: "T", effects: "Veleno (50%)", rof: 2 },
        { name: "Coda", base: 13, damage: "5d6", type: "C", effects: "Nessuno", rof: 1 }
    ],
    "Fenice": [
        { name: "Artigli", base: 16, damage: "4d6", type: "T", effects: "Sanguinamento (50%)", rof: 2 },
        { name: "Colpo d'Ala", base: 16, damage: "3d6", type: "C", effects: "A Fuoco (50%), Vacillante (25%)", rof: 1 }
    ],
    "Foglet": [
        { name: "Artigli", base: 15, damage: "3d6+2", type: "T", effects: "Nessuno", rof: 2 }
    ],
    "Garkain": [
        { name: "Morso", base: 18, damage: "5d6", type: "P", effects: "Sanguinamento (75%)", rof: 1 },
        { name: "Artigli", base: 18, damage: "4d6+4", type: "T", effects: "Sanguinamento (25%)", rof: 2 }
    ],
    "Gatto Mannaro": [
        { name: "Morso", base: 16, damage: "4d6", type: "P", effects: "Sanguinamento (50%)", rof: 1 },
        { name: "Artigli", base: 16, damage: "3d6", type: "T", effects: "Sanguinamento (25%)", rof: 2 }
    ],
    "Ghoul": [
        { name: "Artigli", base: 12, damage: "3d6", type: "T", effects: "Nessuno", rof: 1 },
        { name: "Morso", base: 12, damage: "3d6+2", type: "P", effects: "Sanguinamento (25%), -1 Danno all'Armatura", rof: 1 }
    ],
    "Gigascorpione": [
        { name: "Chele", base: 17, damage: "4d6+3", type: "P", effects: "Nessuno", rof: 2 },
        { name: "Pungiglione", base: 17, damage: "6d6+3", type: "P", effects: "Portata, Sanguinamento (30%), Veleno (100%)", rof: 1 }
    ],
    "Golem": [
        { name: "Pugni", base: 14, damage: "8d6", type: "C", effects: "Forza Schiacciante, Danno Ablativo", rof: 1 }
    ],
    "Grifoni": [
        { name: "Artigli", base: 16, damage: "6d6", type: "T", effects: "Nessuno", rof: 2 },
        { name: "Morso", base: 16, damage: "7d6+2", type: "P", effects: "Sanguinamento (50%)", rof: 1 }
    ],
    "Succube & Incubo": [
        { name: "Testata", base: 13, damage: "5d6", type: "C", effects: "Forza Schiacciante, Stordimento (-2)", rof: 1 },
        { name: "Calcio", base: 16, damage: "4d6+4", type: "C", effects: "Atterramento (50%), Forza Schiacciante", rof: 1 },
        { name: "Pugno", base: 16, damage: "3d6+3", type: "C", effects: "Forza Schiacciante", rof: 2 }
    ],
    "Katakan": [
        { name: "Artigli", base: 18, damage: "6d6", type: "T", effects: "Sanguinamento (50%)", rof: 2 },
        { name: "Morso", base: 18, damage: "7d6+2", type: "P", effects: "Sanguinamento (100%)", rof: 1 }
    ],
    "Leshen": [
        { name: "Artigli", base: 16, damage: "4d6", type: "T", effects: "Nessuno", rof: 2 }
    ],
    "Lupi Mannari": [
        { name: "Artigli", base: 16, damage: "5d6", type: "T", effects: "Sanguinamento (25%)", rof: 2 },
        { name: "Morso", base: 16, damage: "6d6", type: "P", effects: "Sanguinamento (50%)", rof: 1 }
    ],
    "Lupo": [
        { name: "Morso", base: 11, damage: "2d6+2", type: "P", effects: "Sanguinamento (25%)", rof: 1 }
    ],
    "Manticora": [
        { name: "Artigli", base: 16, damage: "4d6", type: "T", effects: "Nessuno", rof: 2 },
        { name: "Morso", base: 16, damage: "5d6", type: "P", effects: "Nessuno", rof: 1 },
        { name: "Coda", base: 16, damage: "3d6", type: "C", effects: "Veleno Bohun Upas (CD 15)", rof: 1 }
    ],
    "MARI LWYD": [
        { name: "Schianto", base: 15, damage: "6d6", type: "C", effects: "Forza Schiacciante", rof: 2 }
    ],
    "Nekker": [
        { name: "Artigli", base: 11, damage: "2d6", type: "T", effects: "Nessuno", rof: 1 }
    ],
    "Oritteropo": [
        { name: "Artigli", base: 10, damage: "1d6", type: "T", effects: "Sanguinamento (100%)", rof: 2 },
        { name: "Coda", base: 10, damage: "2d6", type: "C", effects: "Nessuno", rof: 1 }
    ],
    "Scaltrocertola": [
        { name: "Morso", base: 20, damage: "7d6+2", type: "P", effects: "Trapassare", rof: 1 },
        { name: "Artigli", base: 20, damage: "6d6+2", type: "T", effects: "Sanguinamento (50%)", rof: 2 },
        { name: "Spazzata Coda", base: 20, damage: "6d6", type: "C", effects: "Forza Schiacciante, Portata, Sang (50%), Veleno (75%)", rof: 1 }
    ],
    "Sirene": [
        { name: "Artigli", base: 13, damage: "2d6+2", type: "T", effects: "-1 Danno Armatura (Ablativo)", rof: 1 },
        { name: "Coda", base: 13, damage: "3d6+2", type: "C", effects: "Nessuno", rof: 1 }
    ],
    "Streghe dei Sepolcri": [
        { name: "Artigli", base: 15, damage: "5d6", type: "T", effects: "Sanguinamento (50%)", rof: 2 },
        { name: "Morso", base: 15, damage: "6d6", type: "P", effects: "Veleno (75%)", rof: 1 },
        { name: "Lingua", base: 15, damage: "3d6+2", type: "C", effects: "Veleno (100%), Gittata 4m", rof: 1 }
    ],
    "Troll di Roccia": [
        { name: "Pugni", base: 13, damage: "6d6", type: "C", effects: "Forza Schiacciante", rof: 2 }
    ],
    "Vampiro Superiore": [
        { name: "Morso", base: 24, damage: "6d6", type: "P", effects: "Sanguinamento (100%), Succhiare Sangue, Trapassare Migliorato", rof: 1 },
        { name: "Artigli", base: 24, damage: "5d6+3", type: "T/P", effects: "Bilanciato, Sanguinamento (75%)", rof: 4 }
    ],
    "Viverne": [
        { name: "Aculei", base: 14, damage: "5d6+2", type: "P", effects: "Veleno (75%)", rof: 1 },
        { name: "Artigli", base: 14, damage: "6d6", type: "T", effects: "Nessuno", rof: 2 },
        { name: "Morso", base: 14, damage: "7d6", type: "P", effects: "Veleno (25%)", rof: 1 }
    ],
    "Warg": [
        { name: "Morso", base: 13, damage: "4d6", type: "P", effects: "Sanguinamento (25%)", rof: 1 }
    ],
    "Wraith": [
        { name: "Artigli", base: 13, damage: "5d6", type: "T", effects: "Nessuno", rof: 2 }
    ],
    "Wraith Diurni": [
        { name: "Artigli", base: 15, damage: "4d6", type: "T", effects: "Spesso utilizza anche un colpo speciale che prosciuga vitalità", rof: 2 }
    ],
    "Elementale di Fuoco": [
        { name: "Pugno", base: 16, damage: "5d6", type: "C", effects: "Forza Schiacciante, A Fuoco (50%)", rof: 2 }
    ],
    "Elementale di Ghiaccio": [
        { name: "Pugno", base: 15, damage: "8d6", type: "C", effects: "Forza Schiacciante, Congelamento (50%)", rof: 1 }
    ],
    "Glustyworp": [
        { name: "Morso", base: 17, damage: "6d6", type: "P", effects: "Ablativa, Sanguinamento (75%)", rof: 1 },
        { name: "Artigli", base: 17, damage: "4d6", type: "T", effects: "Portata, Presa", rof: 2 },
        { name: "Coda", base: 15, damage: "5d6", type: "C", effects: "Stordimento", rof: 1 }
    ],
    "Scolopendra Gigante": [
        { name: "Morso", base: 10, damage: "3d6", type: "P", effects: "Veleno (30%)", rof: 1 }
    ],
    "Cultista del Coram Agh Tera": [
        { name: "Bastone", base: 13, damage: "1d6+2", type: "C", effects: "Focus (1), Portata", rof: 2 }
    ],
    "La Damigella Circondata di Farfalle": [
        { name: "Frusta di Capelli", base: 16, damage: "3d6+2", type: "C", effects: "Bilanciata", rof: 1 }
    ],
    "Armatura Marionetta": [
        { name: "Gleddyf Decorativo", base: 15, damage: "4d6+2", type: "T", effects: "Nessuno", rof: 2 }
    ],
    "Arpia": [
        { name: "Artigli", base: 12, damage: "2d6", type: "T", rof: 2 },
        { name: "Becco", base: 12, damage: "3d6", type: "P", rof: 1 }
    ],
    "Barghest": [
        { name: "Morso", base: 12, damage: "2d6", type: "P", rof: 1 }
    ],
    "Battiroccia": [
        { name: "Pugno", base: 14, damage: "4d6", type: "C", rof: 2 },
        { name: "Lancio Masso", base: 14, damage: "6d6", type: "C", rof: 1 }
    ],
    "Bullvore": [
        { name: "Artigli", base: 14, damage: "3d6+3", type: "T", rof: 2 },
        { name: "Incornata", base: 14, damage: "5d6", type: "P", rof: 1 }
    ],
    "Demone Putrefatto": [
        { name: "Artigli", base: 11, damage: "2d6", type: "T", rof: 2 }
    ],
    "Elementale di Terra": [
        { name: "Pugno", base: 15, damage: "8d6", type: "C", rof: 1 }
    ],
    "Frightener": [
        { name: "Artigli", base: 17, damage: "6d6+2", type: "T", rof: 2 },
        { name: "Morso", base: 17, damage: "8d6", type: "P", rof: 1 }
    ],
    "Godling": [
        { name: "Pugno", base: 8, damage: "1d6-2", type: "C", rof: 1 }
    ],
    "Hym": [
        { name: "Artigli", base: 17, damage: "4d6", type: "T", rof: 2 }
    ],
    "Pesta": [
        { name: "Bacio della Pesta", base: 15, damage: "3d6", type: "T", rof: 1 }
    ],
    "Vero Drago": [
        { name: "Artigli", base: 20, damage: "6d6", type: "T", rof: 2 },
        { name: "Morso", base: 20, damage: "8d6", type: "P", rof: 1 },
        { name: "Colpo di Coda", base: 18, damage: "6d6", type: "C", rof: 1 }
    ]
};

const fileMap = {
    "Alp": "alp_98a5d96883ceea1f.json",
    "Arachas": "Arachas_121e9ba4fc214734.json",
    "Archeospora": "Archeospora_b3f7102e8a56c9d4.json",
    "Barbegazi": "Barbegazi_e8ad2614f03759cb.json",
    "Botchling": "Botchling_e718b2094dc653fa.json",
    "Bruxa": "Bruxa_39f04128bca6d5e7.json",
    "Casglydd": "CASGLYDD_74369e6bcb144839.json",
    "Cockatrice": "Cockatrice_345c27df89b0a6e1.json",
    "Bes": "BES_7e2ac369b1344d85.json",
    "Drowner": "Drowner_9597d81f6d124efa.json",
    "Endriaghe (Lavoratore)": "Endriaghe (Lavoratore)_73c3990b5b604c52.json",
    "Endriaghe (Guerriero)": "Endriaghe (Guerriero)_73c3990b5b604c52.json",
    "Fenice": "Fenice_395027d6cbea148f.json",
    "Foglet": "Foglet_02deb874c639fa51.json",
    "Garkain": "Garkain_e4d1b092f7c638a5.json",
    "Gatto Mannaro": "gatto_mannaro_b15180fc4f723850.json",
    "Ghoul": "Ghoul_12a2486818104394.json",
    "Gigascorpione": "gigascorpione_33590ff433306c9d.json",
    "Golem": "Golem_3733a2e542bc4422.json",
    "Grifoni": "Grifoni_78ef677ff12f4842.json",
    "Succube & Incubo": "succube_incubo_7ed094f23185bc6a.json",
    "Katakan": "Katakan_fbbeb3e855404782.json",
    "Leshen": "Leshen_d25be16a30987c4f.json",
    "Lupi Mannari": "Lupi_Mannari_035913ab7f634834.json",
    "Lupo": "lupo_d847c2fbfd02418a.json",
    "Manticora": "Manticora_16b379d2c05e4f8a.json",
    "MARI LWYD": "MARI_LWYD_817df366a12d4597.json",
    "Nekker": "Nekker_0d0ad6b62ee84666.json",
    "Oritteropo": "oritteropo_a2663c6721e4f823.json",
    "Scaltrocertola": "Scaltrocertola_31e65a29f7d048bc.json",
    "Sirene": "Sirene_d56af36cf7084deb.json",
    "Streghe dei Sepolcri": "Streghe_dei_Sepolcri_260905ff0083427c.json",
    "Troll di Roccia": "Troll_di_Roccia_aad7dc7659774d5b.json",
    "Vampiro Superiore": "Vampiro_Superiore_c6f1d0a29b3e8a47.json",
    "Viverne": "Viverne_203eba78f51748a4.json",
    "Warg": "warg_e958d3ecee13529b.json",
    "Wraith": "Wraith_68e7591ef4dc408b.json",
    "Wraith Diurni": "Wraith_Diurni_f5a1fd3e32584e48.json",
    "Elementale di Fuoco": "Elementale_di_Fuoco_0b1a8754f3c2e96d.json",
    "Elementale di Ghiaccio": "Elementale_di_Ghiaccio_b326af7c5e18490d.json",
    "Glustyworp": "glustyworp_0275fca75d31b216.json",
    "Scolopendra Gigante": "Scolopendra_Gigante_ea4189d5603b2c7f.json",
    "Cultista del Coram Agh Tera": "cultista_del_coram_agh_tera_418c67ecf457abcb.json",
    "La Damigella Circondata di Farfalle": "la_damigella_circondata_di_farfalle_5d75b59543f2c2c3.json",
    "Armatura Marionetta": "armatura_marionetta_b0d266ed3861ded7.json",
    "Arpia": "Arpia_1e728fda490563cb.json",
    "Barghest": "Barghest_1873eda52b0c64f9.json",
    "Battiroccia": "Battiroccia_52f91a6ec3074bd8.json",
    "Bullvore": "Bullvore_a26b1940ed7c3f85.json",
    "Demone Putrefatto": "Demone_Putrefatto_0e418579b3fa26dc.json",
    "Elementale di Terra": "Elementale_di_Terra_279c64d03ebf1a85.json",
    "Frightener": "Frightener_4fb21c96538da7e0.json",
    "Godling": "Godling_ea0b462d9f5871c3.json",
    "Hym": "Hym_e5df03bc61479a82.json",
    "Pesta": "Pesta_463e78129a5b0dcf.json",
    "Vendigo": "Vendigo_e4a39bc56f780d12.json",
    "Vero Drago": "Vero_Drago_b3a1d9c72e4f0a6d.json"
};

// Endriaghe Special Case
const endriagheBaseFile = path.join(monstersDir, "Endriaghe_73c3990b5b604c52.json");
if (fs.existsSync(endriagheBaseFile)) {
    const baseContent = fs.readFileSync(endriagheBaseFile, 'utf-8');
    
    // Lavoratore
    const lav = JSON.parse(baseContent);
    lav.name = "Endriaghe (Lavoratore)";
    fs.writeFileSync(path.join(monstersDir, "Endriaghe (Lavoratore)_73c3990b5b604c52.json"), JSON.stringify(lav, null, 4));
    
    // Guerriero
    const gue = JSON.parse(baseContent);
    gue.name = "Endriaghe (Guerriero)";
    fs.writeFileSync(path.join(monstersDir, "Endriaghe (Guerriero)_73c3990b5b604c52.json"), JSON.stringify(gue, null, 4));
    
    fs.unlinkSync(endriagheBaseFile);
}

function patchFile(monsterName) {
    const fileName = fileMap[monsterName];
    if (!fileName) return;
    const filePath = path.join(monstersDir, fileName);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    const stats = statsData[monsterName] || {};
    const attacks = attackData[monsterName] || [];

    if (stats.stats) {
        for (const [key, val] of Object.entries(stats.stats)) {
            data.system.stats[key] = { value: val, max: val, unmodifiedMax: val };
        }
    }
    if (stats.armor !== undefined) {
        data.system.armorHead = stats.armor;
        data.system.armorUpper = stats.armor;
        data.system.armorLower = stats.armor;
    }
    if (stats.derived) {
        for (const [key, val] of Object.entries(stats.derived)) {
            data.system.derivedStats[key] = { value: val, max: val, unmodifiedMax: val };
        }
    }
    if (stats.weight) {
        if (!data.system.details) data.system.details = {};
        data.system.details.weight = stats.weight + " Kg";
    }

    // Defense Skills
    if (stats.defenses) {
        const ref = data.system.stats.ref ? data.system.stats.ref.value : 10;
        const dex = data.system.stats.dex ? data.system.stats.dex.value : 10;
        if (!data.system.skills.ref) data.system.skills.ref = {};
        if (!data.system.skills.dex) data.system.skills.dex = {};
        
        if (stats.defenses.dodge) data.system.skills.ref.dodge = { value: stats.defenses.dodge - ref, isVisible: true };
        if (stats.defenses.athletics) data.system.skills.dex.athletics = { value: stats.defenses.athletics - dex, isVisible: true };
        if (stats.defenses.brawling) data.system.skills.dex.brawling = { value: stats.defenses.brawling - dex, isVisible: true };
        if (stats.defenses.melee) data.system.skills.ref.melee = { value: stats.defenses.melee - ref, isVisible: true };
    }

    // Attacks
    if (!data.items) data.items = [];
    data.items = data.items.filter(i => i.type !== 'weapon' && i.type !== 'ability');
    for (const atk of attacks) {
        const skillName = (atk.name.toLowerCase().includes('morso') || atk.name.toLowerCase().includes('artigli') || atk.name.toLowerCase().includes('pugno') || atk.name.toLowerCase().includes('chele')) ? 'brawling' : 'melee';
        const statVal = skillName === 'brawling' ? (data.system.stats.dex ? data.system.stats.dex.value : 10) : (data.system.stats.ref ? data.system.stats.ref.value : 10);
        
        if (skillName === 'brawling') {
            if (!data.system.skills.dex) data.system.skills.dex = {};
            data.system.skills.dex.brawling = { value: atk.base - statVal, isVisible: true };
        } else {
            if (!data.system.skills.ref) data.system.skills.ref = {};
            data.system.skills.ref.melee = { value: atk.base - statVal, isVisible: true };
        }

        data.items.push({
            _id: Math.random().toString(16).substr(2, 16),
            name: atk.name,
            type: "weapon",
            img: "modules/witcher-compendium/assets/SPECIAL/weapon_sword.webp",
            system: {
                description: atk.effects || "",
                damage: atk.damage,
                accuracy: 0,
                effects: atk.effects || "",
                rateOfFire: atk.rof || 1
            }
        });
    }

    if (stats.capacities) {
        for (const cap of stats.capacities) {
            data.items.push({
                _id: Math.random().toString(16).substr(2, 16),
                name: "[Capacità] " + cap,
                type: "ability",
                img: "modules/witcher-compendium/assets/BESTIARIO/traits/trait_generico.webp",
                system: { description: "", isStored: false }
            });
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

Object.keys(fileMap).forEach(patchFile);
console.log("Patching complete.");
