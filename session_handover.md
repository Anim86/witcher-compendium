# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 06/05/2026 - Aggiornamento Post-Audit Asset
**Stato Generale:** Audit Completato (556 mancanti reali confermati) | Generazione Asset in corso (Quota Limite Raggiunta)

## Obiettivo Corrente
Ripristinare le immagini mancanti ("broken links") del compendio. Abbiamo verificato che le discrepanze identificate dall'audit sono reali (i file `.webp` non esistono fisicamente e Foundry usa icone di fallback). L'obiettivo è generare queste icone tramite AI per avere un compendio "premium" completo.

## Stato Repository e Generazione Asset
- **Audit:** Lo script `_tools/broken_images_audit.json` riporta correttamente le mancanze. Abbiamo isolato le mancanze reali in `_tools/truly_missing.json` (circa 556 item tra schemi, magie, personaggi unici ed equipaggiamento).
- **Batch 44 (Decotti):** Completato. Generati e posizionati i 10 decotti mancanti in `witcher-special`.
- **Batch 45 (Personaggi):** Iniziato. Generati 4 ritratti (Aenarinn, Arkam, Asdis, Cuor Nero).
- **Batch 46 (Equipaggiamento Generico):** Iniziato. Generati 2 oggetti (Lanterna, Lucchetto).
- **Post-Processing Automatico:** Creati script Python (`deploy_assets.py`, `deploy_characters.py`, `deploy_equipment.py` in `_tools/scripts/utils/`) che ridimensionano in automatico a 512px, convertono in WebP (qualità 80) e spostano i file nelle cartelle corrette. I JSON li agganciano automaticamente.
- **Blocco Attuale:** La quota di generazione immagini dell'AI è esaurita. Riprendere la generazione non appena possibile.

## Standard Tecnici (Mandatori)
### 1. Asset Grafici
- **Formato:** WebP (lossy, quality 80).
- **Risoluzione:** Max **512x512px**.
- **Naming:** `snake_case` (es. `spada_acciaio_militare.webp`).
- **Path:** Sempre `modules/witcher-compendium/assets/[CATEGORIA]/...`.
- **Estetica AI:** "Dark Fantasy", stile pittorico coerente con gli asset esistenti.

### 2. Architettura 3 Colonne
Ogni modifica deve essere sincronizzata tra:
1.  **_tools/src-packs/**: Fonte di verità (JSON).
2.  **witcher-compendium/assets/**: Risorse grafiche ottimizzate.
3.  **witcher-compendium/packs/**: Database binari compilati (LevelDB).

### 3. Sviluppo UI (ApplicationV2)
- **CSS Selectors:** Seguire la `_tools/DocumentoLavoro/foundry-v14-css-selectors-guide.md`.
- **Nota Critica:** Usare selettori basati sulle classi reali del DOM (es. `.monster-v2`).
- **Parts:** Usare `[data-application-part="..."]` per lo styling.

## Action Required per la Prossima Sessione
1. **Riprendere Generazione Asset:** Appena la quota AI si resetta, continuare con il **Batch 46** (Equipaggiamento Generico: Mazzo di Gwent, Pipa, Sacca da Viaggio, ecc.) estraendo i nomi da `_tools/truly_missing.json` e proseguire con Magie/Personaggi. Non serve rifare i controlli o gli audit.
2. **Utilizzo Script Deploy:** Usare gli script Python creati in `_tools/scripts/utils/deploy_*.py` per convertire a 512px WebP e posizionare automaticamente le immagini generate.
3. **Compilazione DB:** Dopo aver posizionato gli asset, eseguire la compilazione perché i JSON già puntano ai file giusti.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `python _tools/scripts/utils/deploy_*.py`: Post-processing e deployment immagini AI.
