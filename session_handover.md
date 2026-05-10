# Session Handover - Witcher Compendium Maintenance

**Data/Ora:** 10/05/2026 - Conclusione Batch
**Stato Generale:** Batch 1-63 COMPLETATI.

## Obiettivo Corrente
Tutti i batch previsti (fino al 63) sono stati generati, integrati e compilati. La fase di generazione massiva degli asset è da considerarsi conclusa con successo.

## Stato Repository e Generazione Asset
- **Batch 1-63:** COMPLETATI (Le immagini finali sono state processate a mano dall'utente).
- **Aggiornamento Prompt:** COMPLETATO.
- **Post-Processing:** Eseguito con script Node.js `_tools/scripts/deploy_manual_batches.js` su tutti i batch.
- **Integrazione Dati:** Allineamento path `img` e compilazione LevelDB eseguiti.
- **Blocco Attuale:** Nessuno. Tutti i task previsti sono stati completati.

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

---

## 🛑 Bloccanti Attuali
Nessun bloccante. Il processo di integrazione è concluso.

---

## 📋 Prossimi Passaggi
1. **Verifica Finale**: Eseguire test di QA all'interno di Foundry VTT (v14) per accertarsi che le icone di quest'ultima tornata siano visualizzate correttamente in tutte le sezioni.
2. **Commit e Push**: Pushare i file JSON, gli asset WebP e i pack aggiornati sul repository remoto.

## Script di Riferimento
- `node _tools/scripts/core/compile_packs.mjs`: Compilazione LevelDB.
- `node _tools/scripts/core/align_assets_json.mjs`: Riallineamento path immagini.
- `node _tools/scripts/deploy_manual_batches.js`: Script Node.js (alternativo a Python) per processare PNG manuali.
