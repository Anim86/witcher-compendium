# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 11/05/2026 - Sessione Rimediazione Prioritaria
**Stato Generale:** RIMEDIAZIONE ASSET CORROTTI (Armi vs Schemi).

## Obiettivo Corrente
1. **Rimediazione Prioritaria (15 Asset)**: Generazione di immagini reali per le armi delle Scuole Witcher che attualmente mostrano erroneamente lo schema blueprint.
2. **Batch 75-77**: Completare la generazione di oli, decotti e altri asset mancanti.

## Stato Repository e Generazione Asset
- **Priorità Rimediazione**: Allineata in cima a `scratch/prompts_batch_75.html` (15 item).
- **Batch 74 (Oli e Decotti)**: COMPLETATO.
- **Batch 75-77**: PENDENTI (Quota AI Image Generation esaurita).
- **Blocco Attuale**: Quota AI Image Generation esaurita (reset previsto tra circa 4 ore).

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
