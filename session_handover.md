# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 05/05/2026 - 23:55
**Stato Generale:** Asset Ottimizzati (512px) | Repository Sincronizzato | Pronto per Migrazione UI

## Obiettivo Corrente
Mantenere l'integrità dell'architettura a "3 Colonne" e proseguire con il restyling delle schede in **ApplicationV2 (Foundry V14)**.

## Stato Repository
- **Asset Optimization:** Completata. Tutti i file in `assets/` sono ora `.webp`, `snake_case` e hanno una risoluzione **MAX 512px** (Risparmiati >240MB).
- **Cleanup:** La cartella `temp_images` è stata svuotata. Tutti i sorgenti validi sono stati processati e spostati in `assets/`.
- **Database (JSON):** 932 file in `_tools/src-packs/` aggiornati con i nuovi path e nomi file normalizzati.
- **Compilazione:** Tutti i pacchetti in `witcher-compendium/packs/` sono stati ricompilati e allineati ai sorgenti.

## Standard Tecnici (Mandatori)
### 1. Asset Grafici
- **Formato:** WebP (lossy, quality 80).
- **Risoluzione:** Max **512x512px**.
- **Naming:** `snake_case` (es. `spada_acciaio_militare.webp`).
- **Path:** Sempre `modules/witcher-compendium/assets/[CATEGORIA]/...`.

### 2. Architettura 3 Colonne
Ogni modifica deve essere sincronizzata tra:
1.  **_tools/src-packs/**: Fonte di verità (JSON).
2.  **witcher-compendium/assets/**: Risorse grafiche ottimizzate.
3.  **witcher-compendium/packs/**: Database binari compilati (LevelDB).

### 3. Sviluppo UI (ApplicationV2)
- **CSS Selectors:** Seguire la `_tools/DocumentoLavoro/foundry-v14-css-selectors-guide.md`.
- **Nota Critica:** Usare selettori basati sulle classi reali del DOM (es. `.monster-v2` anche per i personaggi se Foundry concatena così le classi).
- **Parts:** Usare `[data-application-part="..."]` per lo styling dei componenti.

## Action Required per la Prossima Sessione
1. **Audit Asset Futuri:** Se vengono generati nuovi asset, passare sempre attraverso lo script di ridimensionamento a 512px.
2. **Restyling Monster Sheet:** Verificare il rendering delle immagini dei mostri (risoluzione 512px ora disponibile).
3. **Sincronizzazione Git:** Effettuare regolarmente `pull --rebase` e `push` per mantenere il workspace pulito.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `_tools/scratch/deep_optimize_images.py`: (Logica da integrare) Ridimensionamento a 512px.

---
*Documento aggiornato per allineamento Foundry v14.361*
