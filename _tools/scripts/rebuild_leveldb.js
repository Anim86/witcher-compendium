/**
 * Ricrea le LevelDB di TUTTI i pack del compendio
 * dai file JSON sorgente, eliminando qualsiasi duplicato/record corrotto.
 * ESEGUIRE CON FOUNDRY CHIUSO!
 */
const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

const BASE = 'e:/AntigravitiProgetti/CompendioTheWitcher';
const SRC = path.join(BASE, '_tools', 'src-packs');
const PACKS = path.join(BASE, 'witcher-compendium', 'packs');

async function rebuildPack(packName) {
    const srcDir = path.join(SRC, packName);
    const packDir = path.join(PACKS, packName);
    
    console.log(`\n=== Ricostruzione ${packName} ===`);
    
    if (!fs.existsSync(srcDir)) {
        console.log(`  Cartella sorgente non trovata: ${srcDir}`);
        return;
    }
    
    // Leggi tutti i JSON sorgente
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    const records = [];
    for (const fname of files) {
        const data = JSON.parse(fs.readFileSync(path.join(srcDir, fname), 'utf-8'));
        if (!data._id || data._id === null || data._id === 'null') {
            console.log(`  ATTENZIONE: ${fname} non ha _id valido, salto.`);
            continue;
        }
        records.push(data);
    }
    console.log(`  Totale record validi: ${records.length}`);
    
    // Elimina la vecchia cartella LevelDB
    if (fs.existsSync(packDir)) {
        fs.rmSync(packDir, { recursive: true, force: true });
        console.log(`  Cartella LevelDB eliminata.`);
    }
    
    const isActorPack = packName.includes('monsters');
    
    // Ricrea LevelDB da zero con i dati puliti
    const db = new ClassicLevel(packDir, { valueEncoding: 'json' });
    for (const record of records) {
        // Foundry v11+ uses !actors! for Actor packs, !items! for Item packs
        const prefix = isActorPack ? '!actors!' : '!items!';
        const key = `${prefix}${record._id}`;
        await db.put(key, record);
    }
    await db.close();
    console.log(`  LevelDB ricostruito con ${records.length} record (Prefisso: ${isActorPack ? '!actors!' : '!items!'}).`);
}

(async () => {
    console.log('Inizio ricostruzione LevelDB di tutto il compendio...');
    console.log('ASSICURATI CHE FOUNDRY SIA CHIUSO!\n');
    
    const packs = fs.readdirSync(SRC).filter(f => fs.statSync(path.join(SRC, f)).isDirectory());
    for (const pack of packs) {
        await rebuildPack(pack);
    }
    
    console.log('\n=== FATTO ===');
    console.log('Avvia Foundry. Il compendio completo ora ha i referenziamenti corretti ed è aggiornato.');
})().catch(console.error);
