# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 06/05/2026 - Aggiornamento Batch 47 (Completato) e 48 (Parte 1)
**Stato Generale:** Generazione Asset in corso | Batch 47 COMPLETATO | Batch 48 (8/20) Completato | Quota Limite Raggiunta

## Obiettivo Corrente
Completare la generazione e l'integrazione degli asset mancanti seguendo la sequenza dei file `prompts_batch_*.html` situati nella cartella `scratch/`.

## Stato Repository e Generazione Asset
- **Batch 47 (Spade Witcher/Doni Magici):** COMPLETATO. Tutti i 20 item (inclusi Fortificare, Geocinesi, Migliorare Arma, Pirocinesi, ecc.) sono stati generati e posizionati.
- **Batch 48 (Goetia/Invocazioni):** IN CORSO (8/20). Generati i primi 8 item dal file `scratch/prompts_batch_47.html`: Vedere Aura, Evocazione Controllata, Evocazione Incontrollata, Rituale del Manto di Capra, Rituale del Nome, Rituale del Vincolo, Arma Benedetta, Banchetto dell'Abbondanza.
- **Post-Processing:** Le immagini sono state ridimensionate a 512px, convertite in WebP (80%) e posizionate nelle cartelle finali (`assets/MAGIA_E_MALEDIZIONI/Doni_del_Caos/witcher-gifts`, `.../witcher-goetia`, e `.../witcher-invocations`).
- **Integrazione Dati:** Allineamento path `img` eseguito con `align_assets_json.mjs` e compilazione LevelDB eseguita con `compile_packs.mjs`.
- **Blocco Attuale:** La quota di generazione immagini (gemini-3.1-flash-image) è nuovamente esaurita al 9° item (Benedizione dell'Abbondanza). Riprendere tra circa 5 ore (reset previsto per le 18:43 UTC).

## Standard Tecnici (Mandatori)
### 1. Asset Grafici
- **Formato:** WebP (lossy, quality 80).
- **Risoluzione:** Max **512x512px**.
- **Naming:** `snake_case` (es. `spada_dacciaio_del_manticora.webp`).
- **Path:** Coerente con la posizione del file JSON sorgente.

### 2. Architettura 3 Colonne
Ogni modifica deve essere sincronizzata tra:
1.  **_tools/src-packs/**: Fonte di verità (JSON).
2.  **assets/**: Risorse grafiche ottimizzate.
3.  **packs/**: Database binari compilati (LevelDB).

> [!IMPORTANT]
> **UTILIZZO PROMPT BATCH:** Utilizzare SEMPRE i file `scratch/prompts_batch_*.html` già generati per i prompt e i nomi file. Questi file contengono la mappatura corretta e i prompt ottimizzati per lo stile "Digital Painting on Stone Slab".

## Action Required per la Prossima Sessione
1. **Completare Batch 48:** Terminare i restanti 12 item di `scratch/prompts_batch_47.html` (partendo da Benedizione dell'Abbondanza, Campione del Fiume, Cercare i Cercatori, ecc.).
2. **Iniziare Batch 49:** Passare al file batch successivo nella cartella `scratch/`.
3. **Pipeline di Deployment:** 
    - Usare script simili a `scratch/deploy_batch_48_part1.py` per processare le immagini generate in PNG convertendole in WebP 512px.
    - Eseguire `node _tools/scripts/core/align_assets_json.mjs`.
    - Eseguire `node _tools/scripts/core/compile_packs.mjs`.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `py scratch/deploy_batch_48_part1.py`: Esempio di post-processing per il batch 48.
