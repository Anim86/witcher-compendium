// ==========================================
// MACRO: SVUOTA TUTTI I COMPENDI (MONDO INTERO)
// ==========================================
// Attenzione: Questa macro svuoterà TUTTI i compendi 
// presenti nel mondo, a prescindere dal modulo di origine
// o dal nome delle cartelle.

const packs = game.packs; // Prende TUTTI I COMPENDI

if (packs.size === 0) {
    ui.notifications.warn(`Nessun compendio trovato nel mondo.`);
} else {
    Dialog.confirm({
        title: "Svuotamento TOTALE Compendi",
        content: `
            <p style="color:red; font-size:18px;"><strong>ATTENZIONE PERICOLO</strong></p>
            <p>Sei sicuro di voler <strong>ELIMINARE TUTTI I DATI</strong> da <strong>TUTTI I COMPENDI</strong> dell'intero mondo di Foundry?</p>
            <p>Questa operazione non fa distinzioni di modulo o cartella. Eliminerà tutto.</p>
        `,
        yes: async () => {
            let deletedTotal = 0;
            ui.notifications.info("Iniziata la pulizia profonda di TUTTI i compendi...");
            
            for (let pack of packs) {
                const wasLocked = pack.locked;
                if (wasLocked) await pack.configure({locked: false});
                
                const index = await pack.getIndex();
                const ids = index.map(i => i._id);
                
                if (ids.length > 0) {
                    await pack.documentClass.deleteDocuments(ids, {pack: pack.collection});
                    console.log(`[Pulizia Globale] Eliminati ${ids.length} elementi dal compendio ${pack.metadata.label}`);
                    deletedTotal += ids.length;
                }
                
                if (wasLocked) await pack.configure({locked: true});
            }
            
            ui.notifications.info(`Pulizia completata! Eliminati in totale ${deletedTotal} elementi da tutti i compendi.`);
        },
        no: () => ui.notifications.info("Operazione annullata.")
    });
}
