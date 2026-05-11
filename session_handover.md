# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 11/05/2026 - Ripresa Lavoro (Batch 74-77)
**Stato Generale:** INTEGRAZIONE NUOVI BATCH (17/53 nuovi asset completati).

## Obiettivo Corrente
Generazione e integrazione di asset mancanti identificati nei Batch 74, 75, 76 e 77. 

## Stato Repository e Generazione Asset
- **Batch 74 (Oli e Decotti):** COMPLETATO (17/17 asset generati e integrati).
- **Batch 75-77:** PENDENTI (Quota AI Image Generation esaurita).
- **Post-Processing & Integrazione:** Allineamento JSON e compilazione LevelDB effettuati per il Batch 74.
- **Blocco Attuale:** Quota AI Image Generation esaurita (reset previsto tra circa 5 ore).

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
- **Batch 1-63:** COMPLETATI.
- **Batch 64-73:** ANNULLATI (Asset mappati automaticamente).

---

## 🛑 Bloccanti Attuali
Nessun bloccante. Il processo di integrazione è concluso.

---

## 📋 Prossimi Passaggi
1. **Reset Quota AI**: Attendere il reset della quota per generare i Batch 75, 76 e 77.
2. **Generazione Batch 75-77**: Usare i prompt definiti nei rispettivi file .html in `scratch/`.
3. **QA Finale in Foundry**: Verificare che i nuovi oli e decotti del Batch 74 siano corretti.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `node _tools/scripts/deploy_manual_batches.js`: Script Node.js (alternativo a Python) per processare PNG manuali.
