# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 08/05/2026 - Aggiornamento Prompt Batch 54-63 (COMPLETATO)
**Stato Generale:** Batch 49-53 COMPLETATI | In attesa di Batch 54 | Prompt 54-63 Aggiornati

## Obiettivo Corrente
Completare la generazione e l'integrazione degli asset mancanti seguendo la sequenza dei file `prompts_batch_*.html` situati nella cartella `scratch/`. I prompt dei batch dal 54 al 63 sono stati revisionati e aggiornati con descrizioni specifiche degli incantesimi/maledizioni (es. fulmini per Alzur, neve per Invaerne).

## Stato Repository e Generazione Asset
- **Batch 51 (Rituali/Rune/Spell):** COMPLETATO.
- **Batch 52 (Spells):** COMPLETATO. 20 asset caricati manualmente, ottimizzati e integrati.
- **Batch 53 (Spells):** COMPLETATO. 20 asset caricati manualmente, ottimizzati e integrati.
- **Aggiornamento Prompt:** COMPLETATO. Tutti i file `prompts_batch_*.html` (dal 54 al 63) sono stati aggiornati con i nuovi prompt revisionati dall'utente per coerenza tematica.
- **Post-Processing:** Immagini ridimensionate a 512px, convertite in WebP (80%) e posizionate in `witcher-compendium/assets/...`.
- **Integrazione Dati:** Allineamento path `img` e compilazione LevelDB eseguiti.
- **Blocco Attuale:** Nessuno per i batch completati. Quota AI ancora in reset per nuove generazioni.

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
- **Batch 1-51:** COMPLETATI.
- **Batch 52-53:** COMPLETATI.
- **Prompt 54-63:** AGGIORNATI. Tutti i file HTML dei prompt rimanenti sono allineati ai requisiti.

---

## 🛑 Bloccanti Attuali
1. **Quota AI Esaurita**: Limite ancora attivo per `gemini-3.1-flash-image` (~72h). I prossimi batch (54+) richiederanno caricamento manuale dei PNG in `temp_images/` o attesa del reset.

---

## 📋 Prossimi Passaggi
1. **Procedere al Batch 54**: Usare il file `scratch/prompts_batch_54.html`.
2. **Generazione/Caricamento**: Caricare i PNG manualmente in `temp_images/` (seguire sottocartelle indicate nel file HTML).
3. **Eseguire Deploy**: Eseguire `py scratch/deploy_manual_batches.py`.
4. **Sincronizzare e Compilare**:
   - `node _tools/scripts/core/align_assets_json.mjs`
   - `node _tools/scripts/core/compile_packs.mjs`
5. **Commit e Push**.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `py scratch/deploy_manual_batches.py`: Script per processare PNG manuali (Batch 49+).

