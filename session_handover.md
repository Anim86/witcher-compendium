# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 06/05/2026 - Aggiornamento Batch 46 (Parte 1)
**Stato Generale:** Generazione Asset in corso | Batch 45 Completato | Batch 46 (4/10) Completato | Quota Limite Raggiunta

## Obiettivo Corrente
Completare la generazione e l'integrazione degli asset mancanti seguendo la sequenza dei file `prompts_batch_*.html` situati nella cartella `scratch/`.

## Stato Repository e Generazione Asset
- **Batch 45 (Equipaggiamento/Trasporti):** COMPLETATO. 10 icone (Guida del Raccoglitore, Incensiere, ecc.) integrate correttamente.
- **Batch 46 (Witcher Gear/Trasporti):** IN CORSO (4/10). Generati: Protesi da Witcher, Protesi Focus, Protesi Magica, Ruote di Scorta.
- **Post-Processing:** Le immagini sono state ridimensionate a 512px, convertite in WebP (80%) e posizionate nelle cartelle finali (`assets/EQUIPAGGIAMENTO_E_TRASPORTI/...`).
- **Integrazione Dati:** I file JSON orfani sono stati spostati da `_review_orphans` ai pack corretti e i percorsi `img` sono stati allineati.
- **Blocco Attuale:** La quota di generazione immagini (gemini-3.1-flash-image) è esaurita. Riprendere tra circa 5 ore.

## Standard Tecnici (Mandatori)
### 1. Asset Grafici
- **Formato:** WebP (lossy, quality 80).
- **Risoluzione:** Max **512x512px**.
- **Naming:** `snake_case` (es. `protesi_da_witcher.webp`).
- **Path:** Coerente con la posizione del file JSON sorgente (es. `assets/EQUIPAGGIAMENTO_E_TRASPORTI/Protesi/...`).

### 2. Architettura 3 Colonne
Ogni modifica deve essere sincronizzata tra:
1.  **_tools/src-packs/**: Fonte di verità (JSON).
2.  **assets/**: Risorse grafiche ottimizzate.
3.  **packs/**: Database binari compilati (LevelDB).

> [!IMPORTANT]
> **UTILIZZO PROMPT BATCH:** Utilizzare SEMPRE i file `scratch/prompts_batch_*.html` già generati per i prompt e i nomi file. Questi file contengono la mappatura corretta e i prompt ottimizzati per lo stile "Digital Painting on Stone Slab".

## Action Required per la Prossima Sessione
1. **Completare Batch 46:** Terminare i restanti 6 item di `prompts_batch_45.html` (Schema Sedia a Rotelle, Scudo Manticora, ecc.).
2. **Iniziare Batch 47:** Passare al file `scratch/prompts_batch_46.html` (Spade Witcher e Doni Magici).
3. **Pipeline di Deployment:** 
    - Usare `scratch/deploy_batch_46.py` (o simili) per processare le immagini.
    - Spostare i JSON da `_review_orphans` alle cartelle finali.
    - Eseguire `node _tools/scripts/core/align_assets_json.mjs`.
    - Eseguire `node _tools/scripts/core/compile_packs.mjs`.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `py scratch/deploy_batch_46.py`: Post-processing specifico per il batch attuale.
