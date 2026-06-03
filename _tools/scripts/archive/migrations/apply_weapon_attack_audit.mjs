import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const WEAPONS_DIR = path.join(REPO_ROOT, '_tools/src-packs/EQUIPAGGIAMENTO/base/witcher-weapons');
const RUNES_DIR = path.join(REPO_ROOT, '_tools/src-packs/MAGIA/base/witcher-runes');
const EQUIP_DIR = path.join(REPO_ROOT, '_tools/src-packs/EQUIPAGGIAMENTO/base/witcher-equipment');

// Helper to generate a Foundry-like ID
function generateId() {
    return Math.random().toString(16).substring(2, 18).padStart(16, '0');
}

const weaponData = [
    // Spade e Lame Corte Comuni
    { name: "Spada di Ferro", damage: "2d6+2", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 10, hands: "2", effects: [] },
    { name: "Spada d'Arme", damage: "2d6+4", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 15, hands: "1", effects: [] },
    { name: "Gleddyf", damage: "3d6+2", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 5, hands: "2", effects: [] },
    { name: "Falchion da Cacciatore", damage: "3d6", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 15, hands: "1", effects: [] },
    { name: "Krigsverd", damage: "4d6+4", type: { slashing: true, piercing: true }, accuracy: 2, reliability: 10, hands: "1", effects: [] },
    { name: "Esboda", damage: "5d6", type: { slashing: true, piercing: true }, accuracy: 1, reliability: 10, hands: "1", effects: [] },
    { name: "Kord", damage: "5d6", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 15, hands: "1", effects: [{ name: "sanguinamento", percentage: 25 }] },
    { name: "Lama Vicovariana", damage: "5d6+4", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 15, hands: "2", effects: [{ name: "bilanciata", percentage: 100 }] },
    { name: "Torrwr", damage: "6d6", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 15, hands: "2", effects: [{ name: "sanguinamento", percentage: 50 }] },
    { name: "Pugnale", damage: "1d6+2", type: { slashing: true, piercing: true }, accuracy: 0, reliability: 10, hands: "1", effects: [] },
    { name: "Stiletto", damage: "1d6", type: { slashing: true, piercing: true }, accuracy: 2, reliability: 5, hands: "1", effects: [{ name: "occultabile", percentage: 100 }] },
    { name: "Costoliere", damage: "2d6+2", type: { slashing: true, piercing: true }, accuracy: 1, reliability: 10, hands: "1", effects: [{ name: "sanguinamento", percentage: 25 }] },
    { name: "Jambiya", damage: "2d6", type: { slashing: true, piercing: true }, accuracy: 2, reliability: 10, hands: "1", effects: [{ name: "sanguinamento", percentage: 25 }, { name: "trapassare", percentage: 100 }] },

    // Asce e Armi Contundenti Comuni
    { name: "Accetta", damage: "2d6+1", type: { slashing: true }, accuracy: 0, reliability: 10, hands: "1", effects: [] },
    { name: "Ascia da Battaglia", damage: "5d6", type: { slashing: true }, accuracy: 0, reliability: 15, hands: "1", ablating: true, effects: [] },
    { name: "Ascia da Berserker", damage: "6d6", type: { slashing: true }, accuracy: 0, reliability: 15, hands: "2", effects: [{ name: "sanguinamento", percentage: 25 }] },
    { name: "Tirapugni", damage: "1d6", type: { bludgeoning: true }, accuracy: 1, reliability: 15, hands: "1", effects: [{ name: "rissa", percentage: 100 }] },
    { name: "Mazza", damage: "5d6", type: { bludgeoning: true }, accuracy: 0, reliability: 15, hands: "1", effects: [] },
    { name: "Maglio degli Altipiani", damage: "6d6+2", type: { bludgeoning: true }, accuracy: 0, reliability: 20, hands: "2", stun: -2, isMeteorite: true, effects: [] },

    // Armi in Asta e Bastoni Comuni
    { name: "Lancia", damage: "3d6", type: { piercing: true, bludgeoning: true }, accuracy: 0, reliability: 10, hands: "2", range: "Portata", effects: [] },
    { name: "Azza", damage: "4d6+2", type: { slashing: true, piercing: true, bludgeoning: true }, accuracy: 0, reliability: 10, hands: "2", range: "Portata", effects: [] },
    { name: "Alabarda Rossa", damage: "6d6+3", type: { slashing: true, piercing: true, bludgeoning: true }, accuracy: 0, reliability: 10, hands: "2", range: "Portata", effects: [] },
    { name: "Bastone", damage: "1d6+2", type: { bludgeoning: true }, accuracy: 0, reliability: 10, hands: "2", range: "Portata", effects: [{ name: "Focus (1)", percentage: 100 }] },
    { name: "Bastone Uncinato", damage: "2d6", type: { piercing: true, bludgeoning: true }, accuracy: 0, reliability: 10, hands: "2", range: "Portata", effects: [{ name: "Focus (1)", percentage: 100 }, { name: "presa", percentage: 100 }] },
    { name: "Bastone di Ferro", damage: "3d6", type: { bludgeoning: true }, accuracy: 0, reliability: 15, hands: "2", range: "Portata", effects: [{ name: "Focus (2)", percentage: 100 }] },
    { name: "Bastone con Cristallo", damage: "2d6+2", type: { bludgeoning: true }, accuracy: 0, reliability: 5, hands: "2", range: "Portata", effects: [{ name: "Focus (3)", percentage: 100 }, { name: "Focus Superiore", percentage: 100 }] },

    // Armi a Distanza Comuni
    { name: "Coltello da Lancio", damage: "1d6", type: { piercing: true }, accuracy: 0, reliability: 10, hands: "1", range: "FISx4m", effects: [] },
    { name: "Ascia da Lancio", damage: "2d6", type: { slashing: true }, accuracy: 0, reliability: 10, hands: "1", range: "FISx2m", effects: [] },
    { name: "Orione", damage: "1d6", type: { slashing: true }, accuracy: 1, reliability: 5, hands: "1", range: "FISx4m", effects: [] },
    { name: "Arco Corto", damage: "3d6+3", type: { piercing: true }, accuracy: 0, reliability: 10, hands: "2", range: "100m", effects: [] },
    { name: "Arco Lungo", damage: "4d6", type: { piercing: true }, accuracy: 0, reliability: 10, hands: "2", range: "200m", effects: [] },
    { name: "Arco da Guerra", damage: "6d6", type: { piercing: true }, accuracy: 0, reliability: 15, hands: "2", range: "300m", effects: [] },
    { name: "Balestrino", damage: "2d6+2", type: { piercing: true }, accuracy: 1, reliability: 5, hands: "1", range: "50m", effects: [{ name: "Ricarica Lenta", percentage: 100 }] },
    { name: "Balestra", damage: "4d6+2", type: { piercing: true }, accuracy: 1, reliability: 5, hands: "2", range: "100m", effects: [{ name: "Ricarica Lenta", percentage: 100 }] },
    { name: "Balestra da Cacciatore di Mostri", damage: "6d6", type: { piercing: true }, accuracy: 1, reliability: 15, hands: "2", range: "200m", armorPiercing: true, effects: [{ name: "Ricarica Lenta", percentage: 100 }] },

    // Razze Antiche
    { name: "Messer Elfico", damage: "3d6+4", type: { piercing: true, slashing: true }, accuracy: 2, reliability: 15, hands: "1", effects: [{ name: "sanguinamento", percentage: 25 }] },
    { name: "Spada da Cavalleria Vrihedd", damage: "4d6+4", type: { piercing: true, slashing: true }, accuracy: 3, reliability: 15, hands: "1", effects: [] },
    { name: "Spada Meteoritica", damage: "5d6", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 20, hands: "2", isMeteorite: true, effects: [{ name: "bilanciata", percentage: 100 }] },
    { name: "Gwyhyr Gnomesca", damage: "5d6+3", type: { piercing: true, slashing: true }, accuracy: 3, reliability: 15, hands: "2", effects: [{ name: "sanguinamento", percentage: 50 }] },
    { name: "Lama del Tir Tochair", damage: "6d6", type: { piercing: true, slashing: true }, accuracy: 3, reliability: 15, hands: "2", effects: [{ name: "sanguinamento", percentage: 25 }] },
    { name: "Daga a Rondelle Halfling", damage: "2d6+2", type: { piercing: true, slashing: true }, accuracy: 2, reliability: 10, hands: "1", armorPiercing: true, effects: [] },
    { name: "Mannaia Nanica", damage: "3d6", type: { slashing: true, bludgeoning: true }, accuracy: 2, reliability: 15, hands: "1", effects: [] },
    { name: "Ascia Nanica", damage: "5d6+3", type: { slashing: true }, accuracy: 3, reliability: 15, hands: "1", effects: [] },
    { name: "Ascia Nera Gnomesca", damage: "6d6+2", type: { slashing: true }, accuracy: 2, reliability: 15, hands: "2", effects: [] },
    { name: "Martello d'Armi Mahakaman", damage: "5d6", type: { bludgeoning: true }, accuracy: 0, reliability: 15, hands: "2", armorPiercing: true, effects: [] },
    { name: "Mazzafrusto Meteoritico", damage: "6d6", type: { bludgeoning: true }, accuracy: 2, reliability: 20, hands: "1", isMeteorite: true, effects: [{ name: "presa", percentage: 100 }] },
    { name: "Mazzapicchio Nanico", damage: "5d6+2", type: { bludgeoning: true, piercing: true }, accuracy: 0, reliability: 15, hands: "2", range: "Portata", stun: -2, effects: [] },
    { name: "Falcione Elfico", damage: "4d6+3", type: { slashing: true, piercing: true, bludgeoning: true }, accuracy: 2, reliability: 10, hands: "2", range: "Portata", effects: [{ name: "sanguinamento", percentage: 25 }] },
    { name: "Bastone Gnomesco", damage: "3d6+2", type: { bludgeoning: true }, accuracy: 1, reliability: 15, hands: "2", range: "Portata", effects: [{ name: "Focus (3)", percentage: 100 }] },
    { name: "Bastone da Passeggio Elfico", damage: "3d6", type: { bludgeoning: true }, accuracy: 1, reliability: 10, hands: "2", range: "Portata", effects: [{ name: "Focus (3)", percentage: 100 }, { name: "Focus Superiore", percentage: 100 }] },
    { name: "Arco da Viaggio Elfico", damage: "4d6", type: { piercing: true }, accuracy: 1, reliability: 10, hands: "2", range: "200m", effects: [] },
    { name: "Zefhar Elfico", damage: "6d6", type: { piercing: true }, accuracy: 2, reliability: 10, hands: "2", range: "350m", improvedArmorPiercing: true, effects: [] },
    { name: "Balestrino Gnomesco", damage: "2d6", type: { piercing: true }, accuracy: 3, reliability: 10, hands: "1", range: "100m", effects: [{ name: "Ricarica Lenta", percentage: 100 }] },
    { name: "Balestra Pesante Nanica", damage: "5d6", type: { piercing: true }, accuracy: 3, reliability: 15, hands: "2", range: "300m", effects: [{ name: "Ricarica Lenta", percentage: 100 }] },

    // Witcher School Weapons
    { name: "Scuola del Gatto (Acciaio)", damage: "4d6+2", type: { piercing: true, slashing: true }, accuracy: 2, reliability: 15, hands: "2", isMeteorite: true, armorPiercing: true, effects: [{ name: "sanguinamento", percentage: 30 }] },
    { name: "Scuola del Gatto (Argento)", damage: "1d6+2", type: { piercing: true, slashing: true }, accuracy: 2, reliability: 10, hands: "2", silverTrait: true, silverDamage: "3d6", effects: [{ name: "sanguinamento", percentage: 30 }] },
    { name: "Scuola del Gatto (Balestra)", damage: "2d6+2", type: { piercing: true }, accuracy: 1, reliability: 5, hands: "1", range: "50m", effects: [{ name: "bilanciata", percentage: 100 }, { name: "Ricarica Lenta", percentage: 100 }] },
    { name: "Scuola del Grifone (Acciaio)", damage: "5d6+2", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 15, hands: "2", isMeteorite: true, armorPiercing: true, effects: [{ name: "Focus (1)", percentage: 100 }] },
    { name: "Scuola del Grifone (Argento)", damage: "2d6+2", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 10, hands: "2", silverTrait: true, silverDamage: "3d6", effects: [{ name: "Focus (1)", percentage: 100 }] },
    { name: "Scuola del Grifone (Balestra)", damage: "2d6+2", type: { piercing: true }, accuracy: 1, reliability: 5, hands: "2", range: "50m", improvedArmorPiercing: true, effects: [{ name: "Ricarica Lenta", percentage: 100 }] },
    { name: "Scuola del Lupo (Acciaio)", damage: "5d6+2", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 15, hands: "2", isMeteorite: true, improvedArmorPiercing: true, effects: [] },
    { name: "Scuola del Lupo (Argento)", damage: "2d6+2", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 10, hands: "2", silverTrait: true, silverDamage: "3d6", armorPiercing: true, effects: [] },
    { name: "Scuola della Manticora (Acciaio)", damage: "5d6+2", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 15, hands: "2", isMeteorite: true, armorPiercing: true, effects: [{ name: "bilanciata", percentage: 100 }] },
    { name: "Scuola della Manticora (Argento)", damage: "2d6+2", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 10, hands: "2", silverTrait: true, silverDamage: "3d6", effects: [{ name: "bilanciata", percentage: 100 }] },
    { name: "Scuola dell'Orso (Acciaio)", damage: "6d6+2", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 15, hands: "2", isMeteorite: true, armorPiercing: true, ablating: true, effects: [] },
    { name: "Scuola dell'Orso (Argento)", damage: "3d6+2", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 10, hands: "2", silverTrait: true, silverDamage: "3d6", ablating: true, effects: [] },
    { name: "Scuola dell'Orso (Balestra)", damage: "4d6+2", type: { piercing: true }, accuracy: 1, reliability: 5, hands: "2", range: "50m", effects: [{ name: "Ricarica Lenta", percentage: 100 }] },
    { name: "Scuola della Vipera (Acciaio)", damage: "4d6+2", type: { piercing: true, slashing: true }, accuracy: 2, reliability: 15, hands: "2", isMeteorite: true, armorPiercing: true, effects: [{ name: "avvelenato", percentage: 30 }] },
    { name: "Scuola della Vipera (Argento)", damage: "1d6+2", type: { piercing: true, slashing: true }, accuracy: 2, reliability: 10, hands: "2", silverTrait: true, silverDamage: "3d6", effects: [{ name: "avvelenato", percentage: 30 }] },
    { name: "Scuola della Vipera (Zanna)", damage: "2d6+2", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 10, hands: "1", effects: [{ name: "parata", percentage: 100 }] },
    { name: "Scuola della Lumaca (Acciaio)", damage: "8d6", type: { piercing: true, slashing: true }, accuracy: -6, reliability: 20, hands: "2", isMeteorite: true, armorPiercing: true, ablating: true, crushingForce: true, stun: -2, effects: [] },
    { name: "Scuola della Lumaca (Argento)", damage: "5d6", type: { piercing: true, slashing: true }, accuracy: -6, reliability: 15, hands: "2", silverTrait: true, silverDamage: "3d6", ablating: true, crushingForce: true, stun: -2, effects: [] },

    // Villico, Improvvisate e Strumenti
    { name: "Asta", damage: "2d6", type: { bludgeoning: true }, accuracy: 0, reliability: 10, hands: "2", range: "Portata", isNonLethal: true, effects: [] },
    { name: "Badile", damage: "2d6", type: { bludgeoning: true }, accuracy: -3, reliability: 15, hands: "2", isNonLethal: true, effects: [] },
    { name: "Pala", damage: "2d6", type: { bludgeoning: true }, accuracy: -2, reliability: 15, hands: "2", effects: [{ name: "Arma Improvvisata", percentage: 100 }] },
    { name: "Bordone da Pastore", damage: "1d6-2", type: { bludgeoning: true }, accuracy: 0, reliability: 10, hands: "1", isNonLethal: true, effects: [] },
    { name: "Falce", damage: "3d6", type: { piercing: true, slashing: true }, accuracy: -3, reliability: 10, hands: "2", range: "Portata", effects: [{ name: "presa", percentage: 100 }] },
    { name: "Falcetto", damage: "1d6+2", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 10, hands: "1", effects: [{ name: "presa", percentage: 100 }] },
    { name: "Forcone", damage: "2d6+2", type: { piercing: true }, accuracy: -2, reliability: 15, hands: "2", effects: [{ name: "sanguinamento", percentage: 15 }] },
    { name: "Torcia", damage: "1d6", type: { bludgeoning: true }, accuracy: -1, reliability: 5, hands: "1", effects: [{ name: "fuoco", percentage: 25 }] },
    { name: "Rete con Pesi", damage: "N/A", type: {}, accuracy: 0, reliability: 5, hands: "2", effects: [{ name: "intrappolante", percentage: 100 }] },
    { name: "Rete per Mostri", damage: "N/A", type: {}, accuracy: 0, reliability: 5, hands: "2", effects: [{ name: "intrappolante", percentage: 100 }, { name: "Ancora Magica", percentage: 100 }] },
    { name: "Siringa da Campo", damage: "1d6", type: { piercing: true }, accuracy: 1, reliability: 5, hands: "1", armorPiercing: true, effects: [{ name: "Iniezione", percentage: 100 }] },
    { name: "Sperone d'Arpia", damage: "1d6", type: { piercing: true }, accuracy: 1, reliability: 10, hands: "1", range: "FISx4m", effects: [{ name: "avvelenato", percentage: 90 }, { name: "bilanciata", percentage: 100 }] },
    { name: "Spezzalama", damage: "2d6", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 10, hands: "1", effects: [{ name: "Intrappola-Lama", percentage: 100 }] },
    { name: "Scorpione (Balista)", damage: "10d6", type: { piercing: true }, accuracy: 0, reliability: 20, hands: "2", range: "200m", effects: [{ name: "Serventi", percentage: 100 }, { name: "Postazione", percentage: 100 }] },

    // Reliquia
    { name: "Arco Lunare", damage: "8d6+2", type: { piercing: true }, accuracy: 1, reliability: 10, hands: "2", range: "Arco Lungo", effects: [{ name: "congelamento", percentage: 75 }, { name: "bilanciata", percentage: 100 }, { name: "+3 Danni contro gli Spettri", percentage: 100 }] },
    { name: "Bacchetta della Succube", damage: "3d6+2", type: { bludgeoning: true }, accuracy: 0, reliability: 5, hands: "2", range: "Portata", effects: [{ name: "fuoco", percentage: 25 }, { name: "+2 Seduzione", percentage: 100 }, { name: "Focus Superiore (Fuoco)", percentage: 100 }, { name: "Focus (5)", percentage: 100 }] },
    { name: "Caroline", damage: "9d6", type: { piercing: true, slashing: true }, accuracy: 3, reliability: 15, hands: "2", effects: [{ name: "Focus Superiore (Acqua)", percentage: 100 }, { name: "+25 Punti Salute", percentage: 100 }, { name: "bilanciata", percentage: 100 }, { name: "sanguinamento", percentage: 75 }] },
    { name: "Decapitatore", damage: "10d6", type: { slashing: true }, accuracy: 0, reliability: 20, hands: "2", isMeteorite: true, effects: [{ name: "bilanciata", percentage: 100 }, { name: "sanguinamento", percentage: 100 }] },
    { name: "Destino", damage: "2d6+1", type: { piercing: true, slashing: true }, accuracy: 3, reliability: 10, hands: "2", silverTrait: true, silverDamage: "6d6+4", effects: [{ name: "Focus Superiore (Acqua/Fuoco)", percentage: 100 }, { name: "Vacillante", percentage: 75 }] },
    { name: "Devine", damage: "10d6", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 20, hands: "2", isMeteorite: true, armorPiercing: true, stun: 2, effects: [{ name: "Focus Superiore (Aria)", percentage: 100 }] },
    { name: "Lupo", damage: "7d6", type: { piercing: true, slashing: true }, accuracy: 2, reliability: 15, hands: "2", armorPiercing: true, effects: [{ name: "sanguinamento", percentage: 75 }] },
    { name: "Mannaia di Hood", damage: "8d6+2", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 20, hands: "2", isMeteorite: true, armorPiercing: true, effects: [{ name: "bilanciata", percentage: 100 }] },
    { name: "Maugrim", damage: "2d6", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 10, hands: "2", silverTrait: true, silverDamage: "6d6+4", effects: [{ name: "Focus Superiore (Terra/Acqua)", percentage: 100 }, { name: "bilanciata", percentage: 100 }, { name: "congelamento", percentage: 75 }] },
    { name: "Morte Rossa", damage: "10d6", type: { piercing: true }, accuracy: 2, reliability: 15, hands: "2", range: "Balestra", effects: [{ name: "avvelenato", percentage: 100 }, { name: "+3 a Gettare Fatture e Resistere alla Magia", percentage: 100 }] },
    { name: "Ogh'r", damage: "10d6", type: { bludgeoning: true }, accuracy: 0, reliability: 15, hands: "2", armorPiercing: true, stun: 4, effects: [{ name: "bilanciata", percentage: 100 }] },
    { name: "Sentinella dell'Abisso", damage: "7d6+4", type: { piercing: true }, accuracy: 2, reliability: 10, hands: "2", range: "Portata", effects: [{ name: "congelamento", percentage: 75 }, { name: "Focus Superiore (Acqua)", percentage: 100 }] },
    { name: "Spada Lunare", damage: "3d6", type: { piercing: true, slashing: true }, accuracy: 1, reliability: 10, hands: "2", silverTrait: true, silverDamage: "7d6+4", effects: [{ name: "Focus Superiore", percentage: 100 }] },
    { name: "Spina", damage: "3d6", type: { piercing: true, slashing: true }, accuracy: 3, reliability: 15, hands: "1", effects: [{ name: "sanguinamento", percentage: 75 }, { name: "avvelenato", percentage: 100 }] },
    { name: "Pugnale di Diaspro Sang.", damage: "2d6", type: { piercing: true, slashing: true }, accuracy: 0, reliability: 5, hands: "1", effects: [{ name: "sanguinamento", percentage: 25 }] },
    { name: "Bastone del Vincolo", damage: "2d6", type: { bludgeoning: true }, accuracy: 0, reliability: 5, hands: "2", range: "Portata", effects: [{ name: "Focus (3)", percentage: 100 }, { name: "Focus Superiore", percentage: 100 }] },
];

async function updateWeapons() {
    const files = fs.readdirSync(WEAPONS_DIR).filter(f => f.endsWith('.json'));
    const runeFiles = fs.readdirSync(RUNES_DIR).filter(f => f.endsWith('.json'));

    // Process normal weapons
    for (const weaponItem of weaponData) {
        let found = false;
        let targetFile = files.find(f => f.toLowerCase().includes(weaponItem.name.toLowerCase().replace(/ /g, '_').replace(/'/g, '')));
        let currentDir = WEAPONS_DIR;

        if (!targetFile) {
            targetFile = runeFiles.find(f => f.toLowerCase().includes(weaponItem.name.toLowerCase().replace(/ /g, ' ')));
            if (targetFile) {
                currentDir = RUNES_DIR;
            }
        }

        let filePath;
        let data;

        if (targetFile) {
            filePath = path.join(currentDir, targetFile);
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`Aggiornamento arma esistente: ${weaponItem.name}`);
        } else {
            // Create new
            const newId = generateId();
            const fileName = `${weaponItem.name.replace(/ /g, '_').replace(/'/g, '')}_${newId}.json`;
            filePath = path.join(WEAPONS_DIR, fileName);
            data = {
                _id: newId,
                name: weaponItem.name,
                type: "weapon",
                img: `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/base/witcher-weapons/Armatura_a_Piastre.webp`, // Placeholder generic weapon
                system: {
                    description: "",
                    weight: 1,
                    cost: 100,
                    sourcebook: "TRPG"
                },
                effects: [],
                flags: {},
                _stats: { systemId: "TheWitcherItaNewSystem", coreVersion: 14 }
            };
            console.log(`Creazione nuova arma: ${weaponItem.name}`);
        }

        // Apply stats
        const s = data.system;
        s.damage = weaponItem.damage;
        s.accuracy = weaponItem.accuracy;
        s.reliability = { value: weaponItem.reliability, max: weaponItem.reliability };
        s.hands = weaponItem.hands === "1" ? "1" : (weaponItem.hands === "2" ? "2" : "both");
        
        if (weaponItem.range) s.range = weaponItem.range;
        if (weaponItem.type) {
            s.type = {
                text: "",
                slashing: !!weaponItem.type.slashing,
                piercing: !!weaponItem.type.piercing,
                bludgeoning: !!weaponItem.type.bludgeoning,
                elemental: !!weaponItem.type.elemental,
            };
        }

        if (!s.damageProperties) s.damageProperties = {};
        s.damageProperties.armorPiercing = !!weaponItem.armorPiercing;
        s.damageProperties.improvedArmorPiercing = !!weaponItem.improvedArmorPiercing;
        s.damageProperties.ablating = !!weaponItem.ablating;
        s.damageProperties.crushingForce = !!weaponItem.crushingForce;
        s.damageProperties.isMeteorite = !!weaponItem.isMeteorite;
        s.damageProperties.isNonLethal = !!weaponItem.isNonLethal;
        if (weaponItem.stun) s.damageProperties.stun = weaponItem.stun;
        
        if (weaponItem.silverTrait) {
            s.damageProperties.silverTrait = true;
            s.damageProperties.silverDamage = weaponItem.silverDamage;
        }

        // Map effects to array of objects
        s.damageProperties.effects = weaponItem.effects.map(e => ({
            id: generateId(),
            name: e.name,
            statusEffect: null,
            percentage: e.percentage,
            varEffect: false
        }));

        // Move relics to weapons dir if they were in runes
        if (currentDir === RUNES_DIR) {
            const newFileName = `${weaponItem.name.replace(/ /g, '_')}_${data._id}.json`;
            const newPath = path.join(WEAPONS_DIR, newFileName);
            fs.writeFileSync(newPath, JSON.stringify(data, null, 4));
            fs.unlinkSync(filePath);
            console.log(`Mossa reliquia: ${weaponItem.name} -> witcher-weapons`);
        } else {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        }
    }
}

updateWeapons().then(() => console.log("Audit armi completato!")).catch(console.error);
