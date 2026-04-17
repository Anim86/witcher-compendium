// ==========================================
// MACRO: ELIMINA TUTTE LE CARTELLE DEI COMPENDI
// ==========================================
// Questa macro elimina tutte le cartelle (UI della barra laterale)
// all'interno della tab Compendi. Utile quando si disattivano moduli
// e rimangono le cartelle vuote.

const compendiumFolders = game.folders.filter(f => f.type === "Compendium");

if (compendiumFolders.length === 0) {
    ui.notifications.warn("Nessuna cartella trovata nella tab Compendi.");
} else {
    Dialog.confirm({
        title: "Eliminazione Cartelle Compendi",
        content: `
            <p>Sei sicuro di voler eliminare <strong>TUTTE le ${compendiumFolders.length} cartelle</strong> presenti nella tab dei Compendi?</p>
            <p>I compendi all'interno non verranno eliminati, verranno solo spostati alla radice della lista, ma la struttura ad albero sarà cancellata.</p>
        `,
        yes: async () => {
            ui.notifications.info("Rimozione cartelle in corso...");
            const folderIds = compendiumFolders.map(f => f.id);
            await Folder.deleteDocuments(folderIds);
            ui.notifications.info(`Cancellate ${folderIds.length} cartelle con successo!`);
        },
        no: () => ui.notifications.info("Operazione annullata.")
    });
}
