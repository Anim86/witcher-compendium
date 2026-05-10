# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 10/05/2026 - Conclusione Definitiva (100% Asset)
**Stato Generale:** TUTTI GLI ASSET COMPLETATI (1513/1513).

## Obiettivo Corrente
Tutti gli asset del compendio sono stati completati, allineati e compilati. Le icone mancanti (ferite, abilità specifiche, magie e oggetti generici) sono state risolte tramite "Smart Mapping" riutilizzando in modo intelligente le icone di macro-categoria precedentemente generate.

## Stato Repository e Generazione Asset
- **Allineamento Esistenti:** COMPLETATO.
- **Smart Mapping Orfani:** COMPLETATO (188 file mappati su immagini generiche esistenti).
- **Batch 1-63:** COMPLETATI.
- **Batch 64-73 (Recupero Mancanti):** ANNULLATI (Risolti tramite Smart Mapping).
- **Post-Processing & Integrazione:** COMPLETATO al 100%. Path JSON allineati e pacchetti LevelDB compilati.
- **Blocco Attuale:** Nessuno. Il modulo è pronto per l'uso.

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
1. **QA Finale in Foundry**: Aprire il mondo in Foundry VTT (v14) e assicurarsi che le icone delle abilità, ferite, e magie mappate automaticamente rendano bene visivamente.
2. **Commit e Push**: Pushare tutti gli aggiornamenti finali (JSON, WebP, LevelDB) sul repository remoto.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `node _tools/scripts/deploy_manual_batches.js`: Script Node.js (alternativo a Python) per processare PNG manuali.
