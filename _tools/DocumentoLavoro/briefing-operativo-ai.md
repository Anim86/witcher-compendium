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
| **`core/compile_packs.mjs`** | Node.js | Genera i LevelDB (V14 format) | Prima di ogni test in Foundry o rilascio. |
| **`core/audit_project.mjs`** | Node.js | Verifica coerenza JSON vs `module.json` | Per trovare file mancanti o non dichiarati. |
| **`utils/smart_asset_guard.mjs`** | Node.js | Audit avanzato asset + Fix automatico | Per trovare mismatch di naming e correggere i path JSON (`--fix`). |
| **`normalize_asset_filenames.mjs`** | Node.js | Normalizzazione asset su disco | Quando vengono aggiunti file con nomi non standard. |
| **`core/align_assets_json.mjs`** | Node.js | Allinea i percorsi `img` nei JSON | Legacy/Manuale - Preferire `smart_asset_guard`. |

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
    2.  Salvare l'immagine generata (rinominata con logica `slugify`) e **ottimizzarla sempre a 512px** prima di muoverla in `witcher-compendium/assets/[CATEGORIA]/`.
    
*   **Opzione 2 (Fallback): Upload Manuale tramite `temp_images/`**
    1.  *Quando usarlo:* Se la quota AI è esaurita o si possiedono asset ufficiali/estratti da PDF.
    2.  L'operatore umano carica i file grezzi in `temp_images/`.
    3.  L'AI esegue il batch di ottimizzazione: **WebP conversion + 512px resizing**.
    4.  Posizionamento finale nella corretta cartella di `assets/` e aggiornamento dei JSON.

### 🖼️ Specifiche Tecniche Asset
| Parametro | Standard |
| :--- | :--- |
| **Formato** | WebP (Lossy) |
| **Risoluzione** | **Max 512x512px** (obbligatorio per performance) |
| **Qualità** | 80-85% |
| **Naming Standard** | **Slugify Centralizzato** (`lowercase`, `underscores` only) |

**Logica di Naming (Slugify)**:
Il nome del file deve essere generato tramite la funzione `slugify` (definita in `_tools/scripts/core/utils.mjs`). 
1.  Tutto minuscolo.
2.  Spazi e trattini sostituiti da `_`.
3.  Rimozione di caratteri speciali: `' " « » „ “ ” ( ) [ ] : , . ! ?`.
4.  Rimozione di suffissi tecnici legacy (es. `_wp_`, `_dec_`, `_ex_`).
5.  Nessun doppio underscore (`__` -> `_`).

*Esempio*: Item `Spada d'Argento (Rara)` -> Asset `spada_d_argento_rara.webp`.

### Fase C: Sincronizzazione & Normalizzazione
1.  **Normalizzazione Asset su Disco**:
    Se sono stati aggiunti file con nomi non standard o caratteri speciali:
    ```powershell
    node _tools/scripts/normalize_asset_filenames.mjs
    ```
2.  **Riallineamento Path nei JSON**:
    Per aggiornare i campi `img` nei JSON sorgente affinché puntino ai nuovi nomi normalizzati:
    ```powershell
    node _tools/scripts/utils/smart_asset_guard.mjs --fix
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
│   │   ├── witcher-weapons
│   │   └── witcher-weapons-racconti
│   ├── Attrezzatura_e_Oggetti
│   │   ├── witcher-equipment
│   │   ├── witcher-special
│   │   └── witcher-special-chaos
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
│   │   ├── witcher-spells-chaos
│   │   └── witcher-spells-racconti
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
    └── DisastriMagici
```
*Ultimo aggiornamento automatico: 5 maggio 2026*
<!-- FOLDER_STRUCTURE_END -->

## 📜 6. ARCHIVIO STORICO
Se hai bisogno di capire come sono stati estratti i dati originariamente, consulta:
-   `_tools/scripts/archive/legacy/parsers/`: Logiche di estrazione OCR/TXT.
-   `_tools/scripts/archive/legacy/audits/`: Logiche di validazione storica.

---
*Ultimo aggiornamento guida: 11 Maggio 2026 (Integrazione Smart Asset Guard & Slugify Standard)*
