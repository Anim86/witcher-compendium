# WITCHER COMPENDIUM — PROTOCOLLO OPERATIVO COMPLETO
## Documento di riferimento per LLM / AI Builder
### Versione: 3.5 — Data: 13 Aprile 2026 (Sync Post-Unificazione)
### Autore: Antigravity per il team Manuel

---

## 0. CONTESTO DEL PROGETTO

Stiamo costruendo un modulo compendio completo per **The Witcher TTRPG** su **Foundry VTT v14**.
Il modulo si chiama `witcher-compendium` e gira sul sistema `TheWitcherItaNewSystem`.
Tutto il contenuto è in italiano e si basa su diversi manuali ufficiali:
- **Tomo Base (MB)** — manuale principale
- **Tomo del Caos (TC)** — espansione magia
- **Libro dei Racconti (LR)** — espansione avventure e razze
- **Diario di un Witcher (DW)** — espansione bestiario e indagini

Il compendio contiene ~1000+ entries divise in pack LevelDB.
L'obiettivo attuale è mantenere la struttura rigorosa e garantire la piena compatibilità con Foundry V14.

---

## 1. IL TEAM E I RUOLI

| Membro | Ruolo | Cosa fa |
|---|---|---|
| **Manuel** | Team Manager | Supervisiona, valida, fa da tramite fisico, testa in Foundry |
| **Perplexity** | Strategist | Coordina il lavoro, prepara brief, interroga NotebookLM, analizza risultati |
| **Antigravity** | Builder | Riceve brief precisi, legge TXT, modifica JSON, esegue script, produce log |

**Flusso di comunicazione:**
```
Perplexity prepara brief → Manuel lo passa ad Antigravity
Antigravity produce output → Manuel lo porta a Perplexity
Perplexity analizza → prepara prossimo brief
```

---

## 2. STRUTTURA DEI FILE SORGENTE

### 2.1 Dove vivono i testi originali
```
Tomo Base:           Tomo Base/Testi/PagXXX_NomeSezione.txt
Tomo del Caos:       Tomo del Caos/Testi/PagXXX_NomeSezione.txt
Libro dei Racconti:  Libro dei Racconti/Testi/PagXXX_NomeSezione.txt
Diario di un Witcher: Diario di un Witcher/Testi/PagXXX_NomeSezione.txt
```

### 2.2 File TXT rilevanti (Copertura Estesa)

| Pack Foundry | File TXT sorgente | Fonte |
|---|---|---|
| witcher-weapons | Pag074_Armi.txt | MB |
| witcher-weapons-racconti| Appendice Equipaggiamento | LR |
| witcher-components | Pag212_Componenti e Mutageni.txt | MB |
| witcher-components-diario | Componenti aggiuntivi | DW |
| witcher-components-racconti | Appendice Crafting | LR |
| witcher-schematics | Schemi vari | MB / TC |
| witcher-schematics-racconti| Appendice Schemi | LR |
| witcher-monsters | Bestiario Unificato (MB + TC + DW + LR) | Tutti |
| witcher-png | Personaggi Non Giocanti Unificati | Tutti |
| witcher-races | Razze giocabili | MB / LR |
| witcher-trophies | Pag126_Trofei.txt | TC |
| witcher-transports | Pag093_Trasporti.txt | MB |

---

## 3. STRUTTURA JSON E METADATI (ARCHITETTURA 1:1:1)

### 3.1 Dove vivono i JSON sorgente
```
_tools/src-packs/[CATEGORIA]/[sottocartella]/[NomePack]/[NomeVoce].json
```

**Struttura cartelle REALE (Verificata 13 Apr 2026):**
```
_tools/src-packs/
├── BESTIARIO/
│   ├── MOSTRI/                ← Pack: witcher-monsters (UNIFICATO)
│   └── PNG/                   ← Pack: witcher-png (UNIFICATO)
├── CORE/
│   ├── witcher-professions/
│   ├── witcher-races/
│   └── witcher-skills/
├── CRAFTING/
│   ├── diario/
│   │   └── witcher-components-diario/
│   ├── racconti/
│   │   ├── witcher-components-racconti/
│   │   └── witcher-schematics-racconti/
│   ├── witcher-alchemy/
│   ├── witcher-components/
│   ├── witcher-mutations/
│   └── witcher-schematics/
├── EQUIPAGGIAMENTO/
│   ├── base/
│   │   ├── witcher-armor/
│   │   ├── witcher-equipment/
│   │   ├── witcher-special/
│   │   ├── witcher-transports/
│   │   └── witcher-weapons/
│   ├── caos/
│   │   ├── witcher-special-chaos/
│   │   └── witcher-trophies/
│   └── racconti/
│       └── witcher-weapons-racconti/
├── GAMEPLAY/
│   └── base/
│       ├── witcher-critical-wounds/
│       └── witcher-curses/
├── LORE/
│   └── base/
│       └── witcher-lore/
├── MAGIA/
│   ├── base/
│   │   ├── witcher-hexes-base/
│   │   ├── witcher-rituals/
│   │   ├── witcher-runes/
│   │   ├── witcher-signs/
│   │   └── witcher-spells/
│   ├── caos/
│   │   ├── witcher-gifts/
│   │   ├── witcher-goetia/
│   │   ├── witcher-hexes/
│   │   ├── witcher-invocations/
│   │   ├── witcher-rituals-chaos/
│   │   ├── witcher-signs-chaos/
│   │   └── witcher-spells-chaos/
│   └── racconti/
│       └── witcher-spells-racconti/
└── _DA_RICOLLOCARE/
    └── trofei/                ← Mappato su witcher-trophies
```

### 3.2 Regole CRITICHE sui campi
- **`_id`**: UUID a esattamente 16 caratteri esadecimali, UNIVOCO.
- **`description`**: testo in `<p>...</p>`, NO tabelle OCR.
- **`sourcebook`**: formato "MB [pagina]", "TC [pagina]", "LR [pagina]", o "DW [pagina]".
- **`img`**: Percorso dinamico gestito dallo script di mirroring: `modules/witcher-compendium/assets/[PercorsoFisico].webp`.
- **`cost` / `weight`**: Per gli schemi, obbligatorio 0.

### 3.3 Campo _stats — OBBLIGATORIO (Foundry V14)
```json
"_stats": {
  "systemId": "TheWitcherItaNewSystem",
  "coreVersion": 14
}
```
⚠️ `coreVersion` intero (`14`). `systemVersion` **VIETATO**. No BOM.

---

## 4. PIPELINE DI SVILUPPO E DEPLOY

### 4.1 La Regola d'Oro (Allineamento 1:1:1)
Ogni modifica deve rispettare l'allineamento tra:
1. **Master (`src-packs`)**: Sorgente della verità.
2. **Assets (`assets`)**: Mirroring delle immagini (allineato via script).
3. **Packs (`packs`)**: Database compilati 1:1 dalle cartelle Master.

### 4.2 Workflow di Rilascio Locale
1. **Mirroring**: `py _tools/scratch/mirror_structure.py` (allinea assets e percorsi JSON).
2. **Cleanup**: `py _tools/scratch/cleanup_assets.py` (rimuove asset orfani).
3. **Compile**: `node _tools/scripts/compile-packs-v11.mjs` (genera LevelDB).
4. **Deploy**: `./deploy.ps1` (copia in Foundry).

### 4.3 Gestione Folder UI Sidebar
Le cartelle in Foundry sono gestite da `scripts/setup-folders.js`.
Lo script crea la gerarchia UI (`Categoria > Sottocartella > Pack`) leggendo la posizione dei file su disco.
Per forzare il refresh: `game.settings.set("witcher-compendium", "foldersCreated", false)`.

---

## 5. DOCUMENTO DI STATO LIVE

### 5.1 Scopo
Il file `_tools/reports/stato-compendio-live.md` (o simile) è la fonte di verità ufficiale sullo stato reale del compendio.

### 5.2 Regola operativa — OBBLIGATORIA
Nessuna sessione si chiude senza:
1. Aggiornamento del documento live (voci aggiunte/modificate).
2. Commit Git con versione corretta (es. `v14.1.57`).
3. Push del tag corrispondente per attivare la build automatica.

---

*Documento aggiornato da Antigravity — 13 Aprile 2026 — v3.5*
*Modifiche v3.5: Correzione totale dell'alberatura BESTIARIO (unificati Mostri e PNG). Integrazione pipeline di mirroring e deploy 1:1:1.*
