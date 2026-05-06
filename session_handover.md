# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 06/05/2026 - Aggiornamento Batch 46 e 47 (Parte 1)
**Stato Generale:** Generazione Asset in corso | Batch 46 COMPLETATO | Batch 47 (11/20) Completato | Quota Limite Raggiunta

## Obiettivo Corrente
Completare la generazione e l'integrazione degli asset mancanti seguendo la sequenza dei file `prompts_batch_*.html` situati nella cartella `scratch/`.

## Stato Repository e Generazione Asset
- **Batch 46 (Witcher Gear/Trasporti/Schemi):** COMPLETATO. 10 icone (Protesi, Sedia a Rotelle, Scudo Manticora, ecc.) integrate correttamente.
- **Batch 47 (Spade Witcher/Doni Magici):** IN CORSO (11/20). Generati: Spade Manticora/Orso/Vipera, Strumento Elfico, Taglia-monete, Tavolo Strategico, Aerocinesi, Aura di Paura, Calmare Animali, Criocinesi.
- **Post-Processing:** Le immagini sono state ridimensionate a 512px, convertite in WebP (80%) e posizionate nelle cartelle finali (`assets/EQUIPAGGIAMENTO_E_TRASPORTI/_review_orphans` e `assets/MAGIA_E_MALEDIZIONI/Doni_del_Caos/witcher-gifts`).
- **Integrazione Dati:** Allineamento path `img` eseguito con `align_assets_json.mjs` e compilazione LevelDB eseguita con `compile_packs.mjs`.
- **Blocco Attuale:** La quota di generazione immagini (gemini-3.1-flash-image) è di nuovo esaurita. Riprendere tra circa 5 ore (reset previsto per le 18:22 UTC).

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
1. **Completare Batch 47:** Terminare i restanti 9 item di `prompts_batch_46.html` (Fortificare, Geocinesi, ecc.).
2. **Iniziare Batch 48:** Passare al file `scratch/prompts_batch_47.html`.
3. **Pipeline di Deployment:** 
    - Usare script simili a `scratch/deploy_batch_47_part1.py` per processare le immagini.
    - Eseguire `node _tools/scripts/core/align_assets_json.mjs`.
    - Eseguire `node _tools/scripts/core/compile_packs.mjs`.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `py scratch/deploy_batch_47_part1.py`: Esempio di post-processing per batch.
