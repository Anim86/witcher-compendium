# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 08/05/2026 - Inizio Batch 59
**Stato Generale:** Batch 49-58 COMPLETATI | Batch 59 (1/20) | Prompt 59-63 Aggiornati

## Obiettivo Corrente
Completare la generazione e l'integrazione degli asset mancanti seguendo la sequenza dei file `prompts_batch_*.html` situati nella cartella `scratch/`. I prompt dei batch dal 54 al 63 sono stati revisionati e aggiornati con descrizioni specifiche degli incantesimi/maledizioni.

## Stato Repository e Generazione Asset
- **Batch 51-58:** COMPLETATI.
- **Batch 59 (Investigations/Lore):** PARZIALE (18/20). Generati e integrati 17 nuovi asset oltre al primo già presente. Mancano 2 asset (strade_e_distanze_del_continente, tipi_di_locali_e_taverne).
- **Aggiornamento Prompt:** COMPLETATO. Tutti i file `prompts_batch_*.html` (dal 59 al 63) sono stati aggiornati.
- **Post-Processing:** Eseguito con script Node.js `_tools/scripts/deploy_manual_batches.js` per 17 immagini.
- **Integrazione Dati:** Allineamento path `img` e compilazione LevelDB eseguiti.
- **Blocco Attuale:** Quota AI esaurita per `gemini-3.1-flash-image` (reset atteso tra ~5h).

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

### 🔄 Stato Avanzamento (Batch)
- **Batch 1-58:** COMPLETATI.
- **Batch 59:** IN CORSO (18/20 integrati).
- **Prompt 59-63:** AGGIORNATI e pronti per l'uso.

---

## 🛑 Bloccanti Attuali
1. **Quota AI Esaurita**: Limite attivo per `gemini-3.1-flash-image` (reset atteso tra ~5h). Mancano 2 icone per chiudere il Batch 59.

---

## 📋 Prossimi Passaggi
1. **Completare il Batch 59**: Generare gli ultimi 19 asset dopo il reset della quota (~40h) oppure procedere manualmente.
2. **Generazione/Caricamento**: Caricare i PNG in `temp_images/`.
3. **Eseguire Deploy**: Eseguire `node _tools/scripts/deploy_manual_batches.js`.
4. **Sincronizzare e Compilare**:
   - `node _tools/scripts/core/align_assets_json.mjs`
   - `node _tools/scripts/core/compile_packs.mjs`
5. **Commit e Push**.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `node _tools/scripts/deploy_manual_batches.js`: Script Node.js (alternativo a Python) per processare PNG manuali.
