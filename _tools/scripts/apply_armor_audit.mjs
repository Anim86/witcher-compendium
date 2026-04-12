import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '../../_tools/src-packs/EQUIPAGGIAMENTO/base/witcher-armor');
const RELIC_DIR = path.resolve(__dirname, '../../_tools/src-packs/MAGIA/base/witcher-runes');

const DATA = {
    // HEAD
    "Cappuccio_da_Arciere_Verden": { pr: 3, vi: 0, poa: 1, w: 0.5, type: "Light", loc: "Head" },
    "Cappuccio_a_Doppia_Trama": { pr: 5, vi: 0, poa: 1, w: 1, type: "Light", loc: "Head" },
    "Elmo_a_Mezza_Maschera": { pr: 8, vi: 0, poa: 0, w: 1, type: "Light", loc: "Head" },
    "Bacinetto_Temeriano": { pr: 16, vi: 0, poa: 1, w: 1.5, type: "Medium", loc: "Head", effect: "Visuale Limitata" },
    "Camaglio": { pr: 12, vi: 0, poa: 0, w: 0.5, type: "Medium", loc: "Head" },
    "Cappuccio_Corazzato": { pr: 14, vi: 0, poa: 0, w: 2, type: "Medium", loc: "Head" },
    "Grande_Elmo": { pr: 20, vi: 0, poa: 1, w: 3.5, type: "Heavy", loc: "Head", effect: "Visuale Limitata" },
    "Elmo_di_Skellige": { pr: 25, vi: 0, poa: 1, w: 3.5, type: "Heavy", loc: "Head", effect: "Visuale Limitata" },
    "Elmo_Nilfgaardiano": { pr: 30, vi: 0, poa: 2, w: 3, type: "Heavy", loc: "Head", effect: "Visuale Limitata" },
    
    // TORSO
    "Gambesone": { pr: 3, vi: 0, poa: 0, w: 1, type: "Light", loc: "Torso" },
    "Gambesone_Aedirniano": { pr: 5, vi: 0, poa: 1, w: 1.5, type: "Light", loc: "Torso" },
    "Gambesone_a_Doppia_Trama": { pr: 8, vi: 0, poa: 1, w: 2.5, type: "Light", loc: "Torso" },
    "Brigantina": { pr: 12, vi: 1, poa: 0, w: 7, type: "Medium", loc: "Torso" },
    "Armatura_da_Alabardiere_Redaniana": { pr: 14, vi: 1, poa: 0, w: 8.5, type: "Medium", loc: "Torso" },
    "Giubba_di_Cuoio_Lyriana": { pr: 16, vi: 1, poa: 1, w: 6.5, type: "Medium", loc: "Torso" },
    "Armatura_a_Piastre": { pr: 20, vi: 2, poa: 1, w: 14, type: "Heavy", loc: "Torso" },
    "Armatura_Pesante_di_Hindarsfjall": { pr: 25, vi: 2, poa: 3, w: 15, type: "Heavy", loc: "Torso" },
    "Armatura_a_Piastre_Nilfgaardiana": { pr: 30, vi: 2, poa: 2, w: 12, type: "Heavy", loc: "Torso" },
    
    // LEGS
    "Brache_da_Cavallerizzo": { pr: 3, vi: 0, poa: 0, w: 0.5, type: "Light", loc: "Leg" },
    "Brache_Imbottite": { pr: 5, vi: 0, poa: 1, w: 1, type: "Light", loc: "Leg" },
    "Brache_a_Doppia_Trama": { pr: 8, vi: 0, poa: 0, w: 1.5, type: "Light", loc: "Leg" },
    "Brache_Corazzate": { pr: 12, vi: 0, poa: 0, w: 3.5, type: "Medium", loc: "Leg" },
    "Schinieri_Redaniani": { pr: 14, vi: 0, poa: 1, w: 4, type: "Medium", loc: "Leg" },
    "Brache_di_Cuoio_Lyriane": { pr: 16, vi: 0, poa: 1, w: 3.5, type: "Medium", loc: "Leg" },
    "Schinieri_di_Piastre": { pr: 20, vi: 1, poa: 1, w: 7.5, type: "Heavy", loc: "Leg" },
    "Gambali_di_Maglia_di_Hindarsfjall": { pr: 25, vi: 1, poa: 3, w: 5, type: "Heavy", loc: "Leg" },
    "Schinieri_Nilfgaardiani": { pr: 30, vi: 1, poa: 2, w: 6, type: "Heavy", loc: "Leg" },

    // WITCHER SETS
    "Armatura del Gatto": { pr: 6, vi: 0, poa: 2, w: 3, type: "Light", loc: "FullCover", effect: "Raffica Fatale" },
    "Armatura della Vipera": { pr: 8, vi: 0, poa: 2, w: 5, type: "Light", loc: "FullCover", effect: "Contrattacco Perfetto" },
    "Armatura della Manticora": { pr: 12, vi: 1, poa: 2, w: 10, type: "Medium", loc: "FullCover", effect: "Blocco Perfetto" },
    "Armatura del Lupo": { pr: 14, vi: 1, poa: 2, w: 14, type: "Medium", loc: "FullCover", effect: "Momentum" },
    "Armatura del Grifone": { pr: 16, vi: 1, poa: 2, w: 18, type: "Medium", loc: "FullCover", effect: "Incantesimo Critico" },
    "Armatura dell'Orso": { pr: 20, vi: 3, poa: 2, w: 24, type: "Heavy", loc: "FullCover", effect: "Critico Devastante" },
    "Armatura della Lumaca": { pr: 30, vi: 6, poa: 1, w: 42, type: "Heavy", loc: "FullCover", 
        res: ["bludgeoning", "elemental", "piercing", "slashing"],
        effect: "Resistenza a danni Contundenti, Elementali, Perforanti e Taglienti. Copre anche la Testa." },

    // RELIC
    "Armatura di Corvo": { pr: 12, vi: 0, poa: 3, w: 12, type: "Light", loc: "FullCover", 
        res: ["poison", "bleeding"],
        effect: "+15 Punti Salute, +3 Coraggio. Resistenze: Veleno, Sanguinamento." },
    "Armatura dei Montanari": { pr: 23, vi: 0, poa: 3, w: 15, type: "Medium", loc: "FullCover", 
        res: ["bludgeoning", "piercing", "slashing", "poison"],
        effect: "Resistenze: Contundente, Perforante, Tagliente, Veleno." },
    "Armatura di Draugr": { pr: 26, vi: 3, poa: 3, w: 37, type: "Heavy", loc: "FullCover", 
        res: ["fire", "poison", "bleeding"],
        effect: "+25 Punti Salute, +2 Res. Magia, +2 Lanciare Incantesimi. Resistenze: Fuoco, Veleno, Sanguinamento." }
};

function processItem(content, updateData) {
    content.system = {
        ...content.system,
        type: updateData.type,
        location: updateData.loc,
        encumb: updateData.vi,
        enhancements: updateData.poa,
        weight: updateData.w,
        headStopping: (updateData.loc === "Head" || updateData.loc === "FullCover") ? updateData.pr : 0,
        headMaxStopping: (updateData.loc === "Head" || updateData.loc === "FullCover") ? updateData.pr : 0,
        torsoStopping: (updateData.loc === "Torso" || updateData.loc === "FullCover") ? updateData.pr : 0,
        torsoMaxStopping: (updateData.loc === "Torso" || updateData.loc === "FullCover") ? updateData.pr : 0,
        leftArmStopping: (updateData.loc === "Torso" || updateData.loc === "FullCover") ? updateData.pr : 0,
        leftArmMaxStopping: (updateData.loc === "Torso" || updateData.loc === "FullCover") ? updateData.pr : 0,
        rightArmStopping: (updateData.loc === "Torso" || updateData.loc === "FullCover") ? updateData.pr : 0,
        rightArmMaxStopping: (updateData.loc === "Torso" || updateData.loc === "FullCover") ? updateData.pr : 0,
        leftLegStopping: (updateData.loc === "Leg" || updateData.loc === "FullCover") ? updateData.pr : 0,
        leftLegMaxStopping: (updateData.loc === "Leg" || updateData.loc === "FullCover") ? updateData.pr : 0,
        rightLegStopping: (updateData.loc === "Leg" || updateData.loc === "FullCover") ? updateData.pr : 0,
        rightLegMaxStopping: (updateData.loc === "Leg" || updateData.loc === "FullCover") ? updateData.pr : 0,
        
        // Resistances
        bludgeoning: updateData.res?.includes("bludgeoning") || false,
        slashing: updateData.res?.includes("slashing") || false,
        piercing: updateData.res?.includes("piercing") || false,
        elemental: updateData.res?.includes("elemental") || false,
        fire: updateData.res?.includes("fire") || false,
        poison: updateData.res?.includes("poison") || false,
        bleeding: updateData.res?.includes("bleeding") || false
    };

    if (updateData.effect) {
        // Simple append if not there
        if (!content.system.description.includes(updateData.effect)) {
            content.system.description += `<p><strong>Effetti:</strong> ${updateData.effect}</p>`;
        }
    }
    return content;
}

function processFolder(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (!file.endsWith('.json')) return;
        const filePath = path.join(dir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const nameKey = content.name;
        const baseKey = file.replace(/_[a-f0-9]{16}\.json$/, '').replace(/\.json$/, '');
        
        let updateData = DATA[nameKey] || DATA[baseKey];
        
        if (updateData) {
            console.log(`Updating ${content.name}...`);
            const updated = processItem(content, updateData);
            fs.writeFileSync(filePath, JSON.stringify(updated, null, 4), 'utf8');
        }
    });
}

processFolder(BASE_DIR);
processFolder(RELIC_DIR);
console.log("Done.");
