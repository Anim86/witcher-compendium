# Guida all'Installazione su Foundry VTT 🛡️

Essendo questo un repository **Privato**, l'installazione tramite il tasto "Install Module" (Manifest URL) di Foundry non è supportata nativamente poiché richiede autenticazione.

Per i collaboratori del progetto, ecco i due metodi migliori per installare il compendio:

## Metodo 1: Download Manuale (Il più semplice)

1.  Accedi a GitHub e vai nella pagina del repository `Anim86/witcher-compendium`.
2.  Clicca sul tasto verde **Code** e seleziona **Download ZIP**.
3.  Estrai il contenuto nella cartella dei moduli di Foundry:
    - **Percorso**: `Data/modules/witcher-compendium`
    - *Nota: Assicurati che la cartella si chiami esattamente `witcher-compendium` e contenga subito il file `module.json`.*
4.  Riavvia Foundry e attiva il modulo.

## Metodo 2: Git Clone (Per Collaboratori/Sviluppatori)

Se hai Git installato sul tuo PC, questo è il metodo più "professionale" perché ti permette di aggiornare il compendio con un semplice comando.

1.  Apri il terminale (o Git Bash) nella cartella `Data/modules/` di Foundry.
2.  Esegui il comando:
    ```bash
    git clone https://github.com/Anim86/witcher-compendium.git
    ```
3.  Da questo momento, per scaricare gli aggiornamenti futuri, basterà entrare nella cartella e scrivere:
    ```bash
    git pull
    ```

---

## FAQ per Collaboratori

### Perché non posso usare il link del Manifest?
Foundry VTT non supporta l'inserimento di credenziali o "Token" nell'interfaccia di installazione dei moduli. Trattandosi di un repository privato, GitHub blocca l'accesso anonimo al file `module.json`.

### Come faccio a vedere il compendio in gioco?
Una volta attivato il modulo (v1.0.0), troverai 14 nuovi pack nella scheda **Compendium Packs** (l'icona del libro in Foundry). Sono tutti pronti per il Drag & Drop sulle tue schede Personaggio o sulla Mappa.

*Buona caccia, Strigo!* ⚔️🐺
