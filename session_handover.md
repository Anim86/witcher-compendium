# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 07/05/2026 - Aggiornamento Batch 49, 50 e 51 (COMPLETATI)
**Stato Generale:** Batch 49-51 COMPLETATI | In attesa di Batch 52

## Obiettivo Corrente
Completare la generazione e l'integrazione degli asset mancanti seguendo la sequenza dei file `prompts_batch_*.html` situati nella cartella `scratch/`.

## Stato Repository e Generazione Asset
- **Batch 48 (Goetia/Invocazioni):** COMPLETATO. Tutti i 20 item dal file `scratch/prompts_batch_47.html` sono stati generati, processati e integrati.
- **Batch 49 (Invocazioni/Rituali):** COMPLETATO.
- **Batch 50 (Rituali/Chaos):** COMPLETATO.
- **Batch 51 (Rituali/Rune/Spell):** COMPLETATO. Tutti i 20 item integrati (caricati manualmente e ottimizzati).
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
- **Batch 1-47:** COMPLETATI.
- **Batch 48 (Goetia/Invocazioni):** COMPLETATO.
- **Batch 49-51:** COMPLETATI.

---

## 🛑 Bloccanti Attuali
1. **Quota AI Esaurita**: Limite ancora attivo per `gemini-3.1-flash-image` (~78h). I prossimi batch (51+) richiederanno caricamento manuale dei PNG in `temp_images/` o attesa del reset.

---

## 📋 Prossimi Passaggi
1. **Procedere al Batch 52**: Usare il file `scratch/prompts_batch_52.html`.
2. **Generazione/Caricamento**: Caricare i PNG manualmente in `temp_images/` (seguire sottocartelle indicate nel file HTML).
3. **Eseguire Deploy**: Eseguire `py scratch/deploy_manual_batches.py`.
4. **Sincronizzare e Compilare**:
   - `node _tools/scripts/core/align_assets_json.mjs`
   - `node _tools/scripts/core/compile_packs.mjs`
5. **Commit e Push**.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `py scratch/deploy_manual_batches.py`: Script per processare PNG manuali (Batch 49/50).
