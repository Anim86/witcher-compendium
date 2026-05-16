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
| **`utils/update_docs_structure.mjs`** | Node.js | Aggiorna Section 5 del Briefing | Dopo ogni cambio strutturale ai pack. |
| **`core/align_assets_json.mjs`** | Node.js | Allinea i percorsi `img` nei JSON | Legacy/Manuale - Preferire `smart_asset_guard`. |

### 🔧 Utility & Debug
-   **`core/update_special_abilities.py`**: Mappa automaticamente le abilità speciali ai loro asset in `assets/SPECIAL/` (Normalized).
-   `debug/diagnose_packs.js`: Scansione veloce per file corrotti o mancanti.
-   `_garbage/`: Contiene script obsoleti (es. `fix_uuids.mjs`, `fix_metadata.mjs`) non più necessari per la v14.

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
│   ├── witcher-alchemy
│   ├── witcher-components
│   ├── witcher-mutations
│   ├── witcher-mutazioni-tc
│   └── witcher-schematics
├── BESTIARIO
│   ├── witcher-animals
│   ├── witcher-characters
│   └── witcher-monsters
├── EQUIPAGGIAMENTO
│   ├── witcher-armor
│   ├── witcher-equipment
│   ├── witcher-magic-items
│   ├── witcher-special
│   ├── witcher-transports
│   └── witcher-weapons
├── MAGIA_E_MALEDIZIONI
│   ├── Doni_del_Caos
│   │   ├── witcher-gifts
│   │   ├── witcher-goetia
│   │   └── witcher-invocations
│   ├── Incantesimi_e_Rituali
│   │   ├── witcher-rituals
│   │   ├── witcher-runes
│   │   └── witcher-spells
│   ├── Maledizioni_e_Fatture
│   │   ├── witcher-curses
│   │   └── witcher-hexes
│   ├── Necromanzia
│   │   └── witcher-necromanzia
│   └── Segni
│       └── witcher-signs
└── REGOLAMENTO_E_NARRATIVA
    ├── Ferite_Critiche
    │   └── witcher-critical-wounds
    ├── Geografia
    │   └── witcher-geografia
    ├── Investigazioni
    │   └── witcher-investigations
    ├── Lore_e_Racconti
    │   ├── witcher-lore
    │   ├── witcher-lore-chaos
    │   └── witcher-lore-racconti
    ├── Professioni_e_Abilita
    │   ├── witcher-professions
    │   ├── witcher-races
    │   └── witcher-skills
    ├── Tabelle_Operative
    │   ├── CriticieCombattimento
    │   └── DisastriMagici
    └── Trofei
        └── witcher-trophies
```
*Ultimo aggiornamento automatico: 16 maggio 2026*
<!-- FOLDER_STRUCTURE_END -->

## 📈 6. PROGRESSIONE E CHARACTER SHEET
Il sistema di progressione (Improvement Points / P.I.) segue logiche specifiche implementate in `progressionMixin.js`:

| Tipo Incremento | Costo (P.I.) | Note |
| :--- | :--- | :--- |
| **Skill Standard** | Livello Corrente (min 1) | Cap a livello 10. |
| **Skill Difficili** | Livello Corrente * 2 | Sblocco Liv 1 costa 2 P.I. |
| **Statistiche Base** | Livello Corrente * 10 | Massimo 10 per ogni statistica. |
| **Skill Professione** | Livello Corrente (min 1) | Richiede Liv 5 nell'abilità precedente del ramo. |

### 🛡️ Monster Sheets (V14 Standard)
- **Layout**: Griglia a due colonne compatta per le statistiche.
- **Risorse**: Data binding diretto per HP, STA, Vigore e Tossicità.
- **Status**: Integrazione nativa con gli Active Effects della V14.

---

## 📜 7. ARCHIVIO STORICO
Se hai bisogno di capire come sono stati estratti i dati originariamente, consulta:
-   `_tools/scripts/archive/legacy/parsers/`: Logiche di estrazione OCR/TXT.
-   `_tools/scripts/archive/legacy/audits/`: Logiche di validazione storica.

---
*Ultimo aggiornamento guida: 16 Maggio 2026 (Integrazione Sistema P.I. & Cleanup Repository)*
