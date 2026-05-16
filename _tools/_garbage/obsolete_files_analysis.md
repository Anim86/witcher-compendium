# 🧹 Report Pulizia & Analisi File Obsoleti - Witcher Compendium

Questo report riassume le operazioni di pulizia effettuate per consolidare il repository e rimuovere script, report e documenti non più necessari. Tutti i file elencati sono stati spostati in `_tools/_garbage`.

## 📁 File Spostati in `_tools/_garbage`

### 1. Script di Migrazione e Ristrutturazione (Completati)
Questi script facevano parte della grande ristrutturazione dell'equipaggiamento e dell'alchimia.
- `fix_alchemy_paths_flatten.mjs`
- `flatten_alchemy.mjs`
- `reorganize_alchemy.mjs`
- `reorganize_equipment.mjs`
- `unify_magic.mjs`
- `unify_mutagens.mjs`
- `unify_schematics.mjs`
- `update_alchemy_json_paths.mjs`
- `update_equipment_json_paths.mjs`
- `final_consolidate.mjs`
- `fix_metadata.mjs`
- `fix_sourcebooks.mjs`
- `fix_uuids.mjs`
- `migrate_orphans.mjs`
- `refine_orphans.mjs`
- `reorganize_global.mjs`
- `repair_assets.mjs`
- `safe_migrate_orphans.mjs`
- `update_docs_structure.mjs`

### 2. Elaborazione Batch e Asset
Script utilizzati per batch specifici di immagini o recupero dati.
- `convert_batch_20.js`
- `convert_batches_18_19.js`
- `deploy_manual_7_weapons.js`
- `deploy_manual_batches.js`
- `deploy_manual_batches.mjs`
- `fix_asset_filenames.mjs`
- `fix_batch1_sizes.py`
- `process_chaos_assets.mjs`
- `restore_recovered_assets.js`
- `final_recovery.mjs`
- `process_skill_icons.py` (Batch 3)
- `update_batches_*.js` (Tutti i 12 script dalla cartella `prompts_archive`)

### 3. Tool Diagnostici e Scratch (Legacy)
Contenuto delle cartelle `scratch` e vecchi strumenti PowerShell sostituiti dal `smart_asset_guard.mjs`.
- `_tools/scratch/` (18 file tra cui `audit_weapons.ps1`, `fix_all_weapons.ps1`, `monster_status_report.py`, etc.)
- `antigravity/` (Intera cartella di migrazione del bestiario, inclusi 11 script e immagini temporanee)
- `TheWitcherItaNewSystem/scratch/` (Incluso `fix_weapon_skills.py` e `scratch_fix_stats.js`)
- `check_missing_images.ps1`
- `check_name_mismatches.ps1`
- `classify_missing.ps1`
- `move_orphans.py`
- `find_dupes.py`
- `fix_css.py`
- `sync_report_to_json.mjs`

### 4. Report e Documentazione Sessioni Passate
- `session_handover.md`
- `MASTER_GENERATION_LIST.md` (Asset completati al 100%)
- `smart-missing-assets.md` (Report diagnostico superato)
- `brain/` (File CSV di audit magico e incantesimi)
- `comparison_report.md` (Dalla cartella antigravity)

### 5. File Temporanei e Debug
- `convert_tmp.mjs`
- `test_fix.mjs`
- `process_all_temp_images.mjs`

## 🛡️ Seconda Analisi Approfondita
Durante il secondo giro di controllo, sono state identificate e rimosse le seguenti aree di ridondanza:
1.  **Cartella `antigravity`**: Conteneva script duplicati o obsoleti relativi a una vecchia fase di migrazione del bestiario.
2.  **Cartella `prompts_archive`**: Conteneva script di update per batch ormai integrati.
3.  **Utility in `_tools/scripts/utils`**: Molti script "fix_*" e "migrate_*" erano stati mantenuti dopo il consolidamento ma non sono più necessari per il mantenimento ordinario.
4.  **Residui in `TheWitcherItaNewSystem`**: Rimossi file di scratch che sporcavano la cartella di sistema.

## ✅ Stato Attuale
Il repository è ora estremamente snello. Gli strumenti di manutenzione principali rimasti sono:
- `_tools/scripts/core/`: Script stabili per compilazione, ottimizzazione e audit.
- `_tools/scripts/utils/smart_asset_guard.mjs`: Il guardiano principale dell'iconografia.
- `_tools/DocumentoLavoro/`: Guide operative e briefing.

Tutto il materiale "storico" è conservato in `_tools/_garbage`.
