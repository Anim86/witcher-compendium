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

### 📦 Compilazione Compendi LevelDB (V14) & `compile_packs.mjs` v3.0.0
La compilazione dei compendi in Foundry V14 segue regole severe sui documenti incorporati (es. l'inventario `items` o gli `effects` all'interno degli attori):
- **Struttura Corretta**: In LevelDB, l'oggetto genitore (es. `!actors!{actorId}`) deve contenere solo un array di ID stringa (es. `items: ["id1", "id2"]`), NON gli interi oggetti JSON incorporati. Ciascun elemento incorporato deve risiedere separatamente con chiave `!actors.items!{actorId}.{itemId}` contenente l'oggetto completo.
- **Funzionamento dello Script**: Lo script `compile_packs.mjs` utilizza la libreria ufficiale `@foundryvtt/foundryvtt-cli`.
- **Requisito `_key`**: La CLI ufficiale richiede che ogni file JSON contenga a livello radice un campo `_key` (es. `"_key": "!actors!{_id}"`). **ATTENZIONE**: Se `_key` è assente, la CLI salterà il file silenziosamente senza segnalare errori o warning.
- **Logica Temporanea**: Per non sporcare il repository git con questi attributi runtime, lo script crea una cartella `__tmp_keyed`, vi copia i file sorgente, aggiunge ricorsivamente i campi `_key` adatti e genera ID esadecimali casuali per eventuali sotto-documenti privi di `_id` (come alcuni item dei mostri), per poi procedere alla compilazione e pulire la cartella temporanea.

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
1.  **Arrestare Foundry VTT**: Se Foundry è in esecuzione (specialmente come servizio Windows "FoundryVTT"), fermarlo per rilasciare i blocchi sui file LevelDB (è possibile usare lo script `stop_foundry.bat` come amministratore).
2.  **Compilare i pacchetti**: Generare i database LevelDB dai JSON sorgente:
    ```powershell
    node _tools/scripts/core/compile_packs.mjs
    ```
3.  **Eseguire il deploy**: Copiare i file compilati e il sistema di gioco nella cartella dati di Foundry:
    ```powershell
    # Tramite script di automazione (esegue anche arresto e riavvio del servizio)
    ./deploy.bat
    ```
4.  **Riavviare Foundry VTT** (è possibile usare `start_foundry.bat` come amministratore).

> [!CAUTION]
> **PULIZIA DELLA CACHE DEL MONDO (FONDAMENTALE)**:
> Foundry VTT memorizza nella cartella del mondo (es. `worlds/witcher/data/actors.db`) la copia locale degli attori/oggetti importati.
> Qualsiasi modifica effettuata e ricompilata nel compendio **NON si rifletterà automaticamente** sugli attori già trascinati o presenti nella barra laterale destra del mondo.
> Per vedere i cambiamenti (es. il ripristino di un inventario corretto o una nuova immagine), lo sviluppatore/utente deve **eliminare l'entità dalla barra laterale del Mondo e re-importarla dal Compendio**.

---

## ⚠️ 4. REGOLE D'ORO PER L'AI

> [!IMPORTANT]
> **COMPATIBILITÀ V14**: Ogni JSON deve avere il blocco `_stats` con `systemId: "TheWitcherItaNewSystem"` e `coreVersion: 14`. Non usare `systemVersion`. Gli attori e i loro oggetti incorporati devono seguire lo schema di chiavi LevelDB (`!actors.items!`) anziché l'incorporamento ad-hoc diretto per evitare il bug dell'inventario vuoto.

> [!WARNING]
> **NO ABSOLUTE PATHS**: Non usare mai percorsi assoluti (es. `C:\Users\...`) negli script o nei JSON. Usa sempre la costante `REPO_ROOT` definita negli script core.

> [!TIP]
> **MASSIVE CHANGES**: Se devi cambiare un attributo su 500 file, scrivi una piccola utility in `_tools/scripts/utils/` (seguendo il template di `fix_metadata.mjs`) invece di fare centinaia di replace manuali. È più sicuro e documentato.

> [!IMPORTANT]
> **INTEGRITÀ DEI DATI E DI _ID**:
> - **Niente _id duplicati**: Ogni entità sorgente JSON deve avere un ID unico a 16 caratteri esadecimali. ID duplicati (come avvenuto per `Endriaghe (Lavoratore)` ed `Endriaghe (Guerriero)`) portano a collisioni in compilazione in cui una delle due entità sovrascrive l'altra.
> - **ID per Oggetti Incorporati**: Assicurarsi che gli oggetti dell'inventario o gli effetti all'interno di un attore abbiano sempre un proprio `_id` definito nel JSON. Se manca, lo script genererà un ID casuale runtime, ma averlo statico previene disallineamenti o problemi di stabilità.
> - **Tipo di Dati Coerente**: Prestare attenzione a campi legacy come `effects` che a volte presentano il valore `0` (numero) invece del corretto array vuoto `[]`.

---

## 📂 5. STRUTTURA DELLE CARTELLE (LIVE)
Questa sezione è aggiornata automaticamente dal tool `update_docs_structure.mjs`.

<!-- FOLDER_STRUCTURE_START -->
```
_tools/src-packs/
├── ALCHIMIA_E_ARTIGIANATO
│   ├── witcher-components
│   ├── witcher-formulas
│   ├── witcher-mutations
│   ├── witcher-mutazioni-tc
│   ├── witcher-potions
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
│   ├── witcher-trophies
│   └── witcher-weapons
├── MAGIA
│   ├── witcher-curses
│   ├── witcher-gifts
│   ├── witcher-hexes
│   ├── witcher-invocations
│   ├── witcher-rituals
│   ├── witcher-runes
│   ├── witcher-signs
│   └── witcher-spells
├── PROFESSIONI_E_ABILITA
│   ├── witcher-professions
│   ├── witcher-races
│   └── witcher-skills
└── REGOLAMENTO_E_NARRATIVA
    ├── CriticieCombattimento
    ├── DisastriMagici
    ├── StrumentiGM
    ├── witcher-critical-wounds
    ├── witcher-geografia
    ├── witcher-investigations
    ├── witcher-lore
    └── witcher-necromanzia
```
*Ultimo aggiornamento automatico: 22 maggio 2026*
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
*Ultimo aggiornamento guida: 21 Maggio 2026 (Integrazione compilatore LevelDB V14 ufficiale, correzione bug inventario vuoto e allineamento deployment)*
