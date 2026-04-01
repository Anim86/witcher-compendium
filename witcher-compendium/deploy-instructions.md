# ISTRUZIONI DI DEPLOY — COMPENDIO THE WITCHER RPG

Queste istruzioni guidano l'installazione manuale del modulo nel server Foundry VTT (v13).

## 📂 Struttura Cartella
La cartella `witcher-compendium` deve essere posizionata nella directory `Data/modules` del server Foundry.

```text
FoundryVTT/Data/modules/
└── witcher-compendium/
    ├── module.json
    ├── packs/
    │   ├── witcher-alchemy.db
    │   ├── ... (tutti i 14 .db)
    ├── assets/
    │   └── Immagini/
    │       └── PagXXX_...
    ├── languages/
    │   └── it.json
    └── final-check.js
```

## 🚀 Istruzioni Passo-Passo

1.  **Copia**: Copia la cartella `witcher-compendium` nella cartella `Data/modules` di Foundry.
2.  **Riavvio**: Opzionale, ma consigliato per assicurarsi che i manifesti vengano ri-letti.
3.  **Attivazione**:
    - Entra nel tuo Mondo di gioco (sistema `TheWitcherTRPG`).
    - Vai in **Gestione Moduli**.
    - Cerca "The Witcher RPG Compendio Completo".
    - Attiva il modulo e salva.
4.  **Verifica**:
    - Vai nel pannello **Compendi** (Compendium Packs).
    - Dovresti vedere 14 nuovi pack raggruppati (es: *Tomo - Bestiario*, *Chaos - Incantesimi*).
    - Trascina un oggetto o un mostro su un Actor per testare il caricamento delle statistiche e dell'immagine.

## 🔍 Note per il GM
- Tutti i mostri hanno statistiche rimappate in inglese per permettere l'utilizzo dei tiri automatici della scheda.
- Gli oggetti magici del Tomo del Caos includono la descrizione completa e narrativa del manuale.
- Le immagini sono ottimizzate per il caricamento in Foundry, ma assicurati che il server abbia i permessi di lettura per la cartella `assets/`.

**BUON GIOCO! (v1.0.0)**
