# 📜 BRIEFING OPERATIVO: MAINTENANCE WITCHER COMPENDIUM
> [!IMPORTANT]
> **AMBIENTE DI SVILUPPO**: [Foundry VTT Stable 14 build 361](https://foundryvtt.com/releases/14.361)

## Documento di Handover per AI Builder (Antigravity & Friends)

Questo documento è la **fonte di verità** per chiunque debba operare sugli strumenti di manutenzione del compendio Witcher TRPG. Seguire queste istruzioni garantisce che il lavoro sia sincronizzato, professionale e compatibile con Foundry V14.

---

## 🏗️ 1. ARCHITETTURA DELLE 3 COLONNE (1:1:1)

Il progetto si basa su tre pilastri fondamentali che devono restare SEMPRE allineati.

1.  **SORGENTE (`_tools/src-packs/`)**: Contiene i file JSON divisi per categoria. Questa è l'**unica fonte di verità**. Le modifiche ai dati si fanno SOLO qui.
2.  **ASSETS (`witcher-compendium/assets/`)**: Contiene le immagini WebP. La struttura delle cartelle deve rispecchiare quella dei pack (es. `assets/weapons/weapon_name.webp`).
3.  **PACKS (`witcher-compendium/packs/`)**: Contiene i database LevelDB compilati. **MAI** editare questi file direttamente. Vengono sovrascritti ad ogni compilazione.

---

## 🛠️ 2. IL TOOLSET PROFESSIONALE

Tutti gli script sono stati riorganizzati in `_tools/scripts/`. Ogni script usa percorsi relativi calcolati dinamicamente rispetto alla root del repo.

### 🚀 Core Pipeline (Manutenzione Ordinaria)

| Script | Linguaggio | Scopo | Quando usarlo |
| :--- | :--- | :--- | :--- |
| **`core/align_assets_json.mjs`** | Node.js | Allinea i percorsi `img` nei JSON | Dopo aver aggiunto nuove immagini in `assets`. |
| **`core/compile_packs.mjs`** | Node.js | Genera i LevelDB (V14 format) | Prima di ogni test in Foundry o rilascio. |
| **`core/audit_project.mjs`** | Node.js | Verifica coerenza JSON vs `module.json` | Per trovare file mancanti o non dichiarati. |
| **`utils/update_docs_structure.mjs`** | Node.js | Aggiorna le mappe cartelle nei file .md | Quando viene cambiata la gerarchia di `src-packs`. |
| **`utils/asset_guard.mjs`** | Node.js | Trova icone mancanti o placeholder | Per generare la lista di asset da produrre/correggere. |

### 🔧 Utility & Debug
-   **`core/update_special_abilities.py`**: Mappa automaticamente le abilità speciali ai loro asset in `assets/SPECIAL/` (Normalized).
-   `utils/fix_uuids.mjs`: Genera o corregge gli ID (16 char hex).
-   `utils/fix_metadata.mjs`: Normalizza i metadati `_stats` per la v14.
-   `debug/diagnose_packs.js`: Scansione veloce per file corrotti o mancanti.

---

## 🔄 3. WORKFLOW OPERATIVO (Standard)

Per qualsiasi attività di modifica o espansione, seguire rigorosamente questo ordine:

### Fase A: Modifica Dati (Massiva o Singola)
1.  Modificare i JSON sorgente in `_tools/src-packs/`.
2.  In caso di modifiche massive (regex), assicurarsi di non rompere la sintassi JSON.

### Fase B: Gestione Asset (Immagini)
Ci sono due strategie alternative per la gestione degli asset, a seconda della disponibilità della quota AI:

*   **Opzione 1 (Primaria): Generazione Immagini AI**
    1.  Se manca un'icona tematica e la quota AI lo consente, usare il tool `generate_image`.
    2.  Salvare l'immagine generata (rinominata con logica snake_case) direttamente in `witcher-compendium/assets/[CATEGORIA]/`.
    
*   **Opzione 2 (Fallback): Upload Manuale tramite `temp_images/`**
    1.  *Quando usarlo:* Se la quota AI è esaurita o si possiedono asset ufficiali/estratti da PDF.
    2.  L'operatore umano carica i file grezzi in `temp_images/` (anche mantenendo i tag sporchi del PDF).
    3.  L'AI esegue il batch: `python _tools/scripts/utils/process_new_images.py`.
    4.  Lo script si occupa di rinominare, ottimizzare in WebP, posizionare nella corretta cartella (es. `GEOGRAFIA` o `PNG`) e aggiornare i JSON.

**Naming Convention Naturale**: Il nome del file finale deve corrispondere approssimativamente al nome del file JSON (tutto minuscolo, spazi sostituiti da `_`).
*Esempio*: Item `Spada d'Argento` -> Asset `spada_d_argento.webp`.

### Fase C: Sincronizzazione & Normalizzazione
1.  Per normalizzazioni specifiche su macro-categorie (es. equipaggiamenti generici o ricondizionamenti geografici):
    ```powershell
    python _tools/scripts/utils/fix_paths_and_normalize.py
    ```
2.  Per un riallineamento totale o generico dei path `img`:
    ```powershell
    node _tools/scripts/core/align_assets_json.mjs
    ```

### Fase D: Compilazione & Deploy
1.  Compilare i pacchetti:
    ```powershell
    node _tools/scripts/core/compile_packs.mjs
    ```
2.  Eseguire il deploy nel server locale (se necessario):
    ```powershell
    ./deploy.ps1
    ```

---

## ⚠️ 4. REGOLE D'ORO PER L'AI

> [!IMPORTANT]
> **COMPATIBILITÀ V14**: Ogni JSON deve avere il blocco `_stats` con `systemId: "TheWitcherItaNewSystem"` e `coreVersion: 14`. Non usare `systemVersion`.

> [!WARNING]
> **NO ABSOLUTE PATHS**: Non usare mai percorsi assoluti (es. `C:\Users\...`) negli script o nei JSON. Usa sempre la costante `REPO_ROOT` definita negli script core.

> [!TIP]
> **MASSIVE CHANGES**: Se devi cambiare un attributo su 500 file, scrivi una piccola utility in `_tools/scripts/utils/` (seguendo il template di `fix_metadata.mjs`) invece di fare centinaia di replace manuali. È più sicuro e documentato.

---

## 📂 5. STRUTTURA DELLE CARTELLE (LIVE)
Questa sezione è aggiornata automaticamente dal tool `update_docs_structure.mjs`.

<!-- FOLDER_STRUCTURE_START -->
```
_tools/src-packs/
├── ALCHIMIA_E_ARTIGIANATO
│   ├── Componenti
│   │   ├── witcher-components
│   │   ├── witcher-components-diario
│   │   ├── witcher-components-mutageni-dw
│   │   ├── witcher-components-racconti
│   │   └── witcher-dlc-ms-components
│   ├── Formule_e_Ricette
│   │   ├── witcher-alchemy
│   │   ├── witcher-dlc-ap-alchemy
│   │   └── witcher-dlc-ts-alchemy
│   ├── Mutageni
│   │   ├── witcher-mutations
│   │   └── witcher-mutazioni-tc
│   └── Schemi_di_Fabbricazione
│       ├── witcher-dlc-sl-schematics
│       ├── witcher-dlc-sw-schematics
│       ├── witcher-dlc-ts-schematics
│       ├── witcher-schematics
│       └── witcher-schematics-racconti
├── BESTIARIO
│   ├── witcher-animals
│   ├── witcher-characters
│   └── witcher-monsters
├── EQUIPAGGIAMENTO_E_TRASPORTI
│   ├── _review_orphans
│   ├── Armi_e_Armature
│   │   ├── witcher-armor
│   │   ├── witcher-dlc-ap-equipment
│   │   ├── witcher-dlc-sl-equipment
│   │   ├── witcher-dlc-sr-equipment
│   │   ├── witcher-dlc-sw-equipment
│   │   ├── witcher-dlc-ts-equipment
│   │   ├── witcher-weapons
│   │   └── witcher-weapons-racconti
│   ├── Attrezzatura_e_Oggetti
│   │   ├── witcher-equipment
│   │   ├── witcher-special
│   │   └── witcher-special-chaos
│   ├── Protesi
│   │   └── witcher-dlc-dp-equipment
│   ├── Reliquie_e_Artefatti
│   │   └── witcher-magic-items
│   └── Trasporti
│       └── witcher-transports
├── MAGIA_E_MALEDIZIONI
│   ├── Doni_del_Caos
│   │   ├── witcher-gifts
│   │   ├── witcher-goetia
│   │   └── witcher-invocations
│   ├── Incantesimi_e_Rituali
│   │   ├── witcher-rituals
│   │   ├── witcher-rituals-chaos
│   │   ├── witcher-runes
│   │   ├── witcher-spells
│   │   └── witcher-spells-chaos
│   ├── Maledizioni_e_Fatture
│   │   ├── witcher-curses
│   │   ├── witcher-hexes
│   │   └── witcher-hexes-base
│   ├── Necromanzia
│   │   └── witcher-necromanzia
│   └── Segni
│       ├── witcher-signs
│       └── witcher-signs-chaos
├── REGOLAMENTO_E_NARRATIVA
│   ├── Ferite_Critiche
│   │   └── witcher-critical-wounds
│   ├── Geografia
│   │   └── witcher-geografia
│   ├── Investigazioni
│   │   └── witcher-investigations
│   ├── Lore_e_Racconti
│   │   ├── witcher-dlc-sr-lore
│   │   ├── witcher-lore
│   │   ├── witcher-lore-chaos
│   │   └── witcher-lore-racconti
│   ├── Professioni_e_Abilita
│   │   ├── witcher-dlc-np-professions
│   │   ├── witcher-professions
│   │   ├── witcher-races
│   │   └── witcher-skills
│   └── Trofei
│       └── witcher-trophies
└── TABELLEOPERATIVE
    ├── CriticieCombattimento
    ├── DisastriMagici
    └── StrumentiGM
```
*Ultimo aggiornamento automatico: 29 aprile 2026*
<!-- FOLDER_STRUCTURE_END -->

## 📜 6. ARCHIVIO STORICO
Se hai bisogno di capire come sono stati estratti i dati originariamente, consulta:
-   `_tools/scripts/archive/legacy/parsers/`: Logiche di estrazione OCR/TXT.
-   `_tools/scripts/archive/legacy/audits/`: Logiche di validazione storica.

---
*Mantenere questo documento aggiornato è parte integrante del task di manutenzione.*
