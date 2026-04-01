# Guida all'Installazione su Foundry VTT 🛡️

Essendo questo un repository **Privato**, l'installazione tramite il link del manifest (`module.json`) richiede alcuni passaggi manuali o l'uso di un token di accesso. Ecco i due metodi consigliati:

## Metodo 1: Installazione Manuale (Consigliato)

Questo è il metodo più semplice per repository privati.

1.  **Scarica il Progetto**:
    - Accedi alla pagina principale del repository su GitHub.
    - Clicca sul tasto verde **Code**.
    - Seleziona **Download ZIP**.
2.  **Prepara la Cartella**:
    - Estrai il contenuto del file ZIP.
    - Assicurati che la cartella estratta si chiami esattamente `witcher-compendium` (all'interno deve esserci direttamente il file `module.json`).
3.  **Copia in Foundry**:
    - Sposta la cartella `witcher-compendium` nel percorso dei moduli di Foundry VTT:
      - **Windows**: `%AppData%\FoundryVTT\Data\modules\`
      - **macOS**: `~/Library/Application Support/FoundryVTT/Data/modules/`
      - **Linux**: `~/.local/share/FoundryVTT/Data/modules/`
4.  **Attiva il Modulo**:
    - Avvia Foundry VTT.
    - Entra nel tuo Mondo.
    - Vai in **Configurazioni Impostazioni** -> **Gestisci Moduli**.
    - Cerca "Witcher RPG Compendium" e attivalo.

## Metodo 2: Installazione tramite Manifest (Solo se Pubblico)

Se decidi di rendere il repository **Pubblico** in futuro:

1.  Copia l'URL diretto al file `module.json` (cliccando su "Raw" su GitHub).
2.  In Foundry VTT, nella scheda **Add-on Modules**, clicca su **Install Module**.
3.  Incolla l'URL nel campo **Manifest URL** in basso e clicca su **Install**.

---

### Note Importanti:
- **Struttura**: Il file `module.json` deve trovarsi nella radice della cartella `modules/witcher-compendium/`.
- **Compatibilità**: Questo modulo è verificato per **Foundry VTT v13**.
- **Supporto**: Se riscontri problemi con il Drag & Drop, verifica che il sistema `TheWitcherTRPG` sia aggiornato alla versione più recente.

*Buona caccia, Strigo!* ⚔️🐺
