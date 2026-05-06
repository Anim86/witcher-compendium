# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 06/05/2026 - Aggiornamento Batch 48 (Completato) e 49 (Parte 1)
**Stato Generale:** Generazione Asset in corso | Batch 48 COMPLETATO | Batch 49 (5/20) Completato | Quota Limite Raggiunta

## Obiettivo Corrente
Completare la generazione e l'integrazione degli asset mancanti seguendo la sequenza dei file `prompts_batch_*.html` situati nella cartella `scratch/`.

## Stato Repository e Generazione Asset
- **Batch 48 (Goetia/Invocazioni):** COMPLETATO. Tutti i 20 item dal file `scratch/prompts_batch_47.html` sono stati generati, processati e integrati.
- **Batch 49 (Invocazioni/Rituali):** IN CORSO (5/20). Generati i primi 5 item dal file `scratch/prompts_batch_48.html`: Marchio dell'Avvizzimento, Miracolo di Lebioda, Ombra di Bleobheris, Parola Evocatrice, Penna del Divino.
- **Post-Processing:** Le immagini sono state ridimensionate a 512px, convertite in WebP (80%) e posizionate nelle cartelle finali (`assets/MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-invocations`).
- **Integrazione Dati:** Allineamento path `img` eseguito con `align_assets_json.mjs` e compilazione LevelDB eseguita con `compile_packs.mjs`.
- **Blocco Attuale:** La quota di generazione immagini (gemini-3.1-flash-image) è nuovamente esaurita al 6° item del Batch 49 (Pozzo di Conoscenza). Riprendere tra circa 5 ore (reset previsto per le 00:55 UTC del 07/05).

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
1. **Completare Batch 49:** Terminare i restanti 15 item di `scratch/prompts_batch_48.html` (partendo da Pozzo di Conoscenza, Presagi di Sventura, Presenza del Divino, ecc.).
2. **Iniziare Batch 50:** Passare al file batch successivo nella cartella `scratch/` (`prompts_batch_49.html`).
3. **Pipeline di Deployment:** 
    - Usare script simili a `scratch/deploy_batch_49_part1.py` per il post-processing.
    - Eseguire `node _tools/scripts/core/align_assets_json.mjs`.
    - Eseguire `node _tools/scripts/core/compile_packs.mjs`.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `py scratch/deploy_batch_49_part1.py`: Esempio di post-processing per il batch 49.

