# WITCHER COMPENDIUM — PROTOCOLLO OPERATIVO COMPLETO
## Documento di riferimento per LLM / AI Builder
### Versione: 3.1 — Data: 13 Aprile 2026
### Autore: Perplexity (Strategist) per il team Manuel + Antigravity

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
Tomo Base:     Tomo Base/Testi/PagXXX_NomeSezione.txt
Tomo del Caos: Tomo del Caos/Testi/PagXXX_NomeSezione.txt
Libro dei Racconti: Libro dei Racconti/Testi/PagXXX_NomeSezione.txt
Diario di un Witcher: Diario di un Witcher/Testi/PagXXX_NomeSezione.txt
```

### 2.2 File TXT rilevanti (Copertura Estesa)

| Pack Foundry | File TXT sorgente | Fonte |
|---|---|---|
| witcher-weapons | Pag074_Armi.txt | MB |
| witcher-weapons-racconti| Appendice Equipaggiamento | LR |
| witcher-components | Pag212_Componenti e Mutageni.txt | MB / DW |
| witcher-components-racconti | Appendice Crafting | LR |
| witcher-schematics | Schemi vari | MB / TC |
| witcher-schematics-racconti| Appendice Schemi | LR |
| witcher-monsters | Bestiario Base | MB |
| witcher-monsters-chaos | Bestiario Chaos | TC |
| witcher-monsters-racconti | Mostri Avventure | LR |
| witcher-monsters-diario | Bestiario Completo | DW |
| witcher-npc-racconti | PNG Avventure | LR |
| witcher-spells-racconti | Incantesimi e Rituali | LR |
| witcher-races | Razze giocabili | MB / LR |
| witcher-trophies | Pag126_Trofei.txt | TC |
| witcher-transports | Pag093_Trasporti.txt | MB |

---

## 3. STRUTTURA JSON E METADATI (REGOLE V14 V3.0)

### 3.1 Dove vivono i JSON sorgente
```
_tools/src-packs/[CATEGORIA]/[sottocartella]/[NomeVoce].json
```

**Struttura cartelle:**
```
_tools/src-packs/
├── EQUIPAGGIAMENTO/
│   ├── base/
│   ├── caos/
│   └── racconti/                  ← witcher-weapons-racconti
├── CRAFTING/
│   ├── base/
│   ├── diario/                    ← witcher-components-diario
│   └── racconti/                  ← witcher-schematics-racconti, witcher-components-racconti
├── BESTIARIO/
│   ├── PNG/
│   │   ├── base/
│   │   ├── caos/
│   │   ├── diario/                ← witcher-monsters-diario
│   │   └── racconti/              ← witcher-monsters-racconti
│   └── NPC/
│       └── racconti/              ← witcher-npc-racconti
├── MAGIA/
│   ├── base/
│   ├── caos/
│   └── racconti/                  ← witcher-spells-racconti
├── GAMEPLAY/
│   └── base/
├── LORE/
│   └── base/
└── CORE/
    └── witcher-races/             ← (Gnomo, Vran, Bobolak, ecc.)
```

### 3.2 Regole CRITICHE sui campi
- **`_id`**: UUID a esattamente 16 caratteri esadecimali, UNIVOCO IN ASSOLUTO su tutti i pack. Eseguire sempre check duplicati.
- **`description`**: testo in `<p>...</p>`, MAI testo grezzo, MAI tabelle OCR.
- **`sourcebook`**: formato "MB [pagina]", "TC [pagina]", "LR [pagina]", o "DW [pagina]". Se ci sono duplicati logici (es. due armi uguali ma con stats diverse), il sourcebook discrimina.
- **`cost` / `weight`**: per gli schemi, imporre SEMPRE 0. Per il resto, estrarre dai manuali.
- **Nomi**: NON usare parentesi nei nomi dei JSON per distinguere le edizioni (usa solo il `sourcebook`).

### 3.3 Campo _stats — LA REGOLA D'ORO DEL METADATA
Tutti i JSON devono avere il seguente blocco esatto:
```json
"_stats": {
  "systemId": "TheWitcherItaNewSystem",
  "coreVersion": 14
}
```
⚠️ `coreVersion` deve essere un **numero intero** (`14`), MAI stringa.
⚠️ La voce `systemVersion` **NON DEVE ESSERE PRESENTE**.
⚠️ Nessun file deve presentare il **Byte Order Mark (BOM)** a inizio file, altrimenti il parsing JSON fallirà e i compilatori salteranno i file. Lo script `fix-metadata.mjs` è configurato per epurare il BOM automaticamente preservando i caratteri accentati (UTF-8).

---

## 4. COME TROVARE I TESTI NEI FILE TXT

1. Cerca il nome esatto della voce nel TXT.
2. Prendi il TESTO NARRATIVO subito sotto il titolo.
3. SCARTA le tabelle (righe con numeri, trattini, pipes `|` per le stats).
4. Wrappa il testo estratto in `<p>...</p>`.
5. Gestione apostrofi: usa `replace(/[\u2018\u2019]/g, "'")` per matchare i nomi correttamente.

---

## 5. BUILD E DEPLOY

### 5.1 Compilatore ufficiale V14
```powershell
node _tools/scripts/compile-packs-v11.mjs
```
- Esegue una pulizia locale dei database e ricompila tutti i file in `_tools/src-packs` verso i rispettivi file LevelDB in `witcher-compendium/packs/`.
- Ignora e avvisa in caso di file vuoti o danneggiati.

### 5.2 Check pre-compilazione OBBLIGATORI (Sprint 12 Aprile)
1. **Script Global Metadata**: `node _tools/scripts/fix-metadata.mjs` (rimuove il BOM e controlla _stats).
2. **Controllo Duplicati**: Esaminare l'univotà degli ID su intero `src-packs`.
3. **Cartelle Vuote**: Verificare che nessun pack registrato in `module.json` chiami una cartella vuota su disco.
4. **Verifica Versioning**: Fare bump progressivo nel file `module.json` concordandolo con il team.

### 5.3 Workflow GitHub e Rilascio
1. Eseguire sempre il rebase (`git pull --rebase origin main`) prima di pushare per prevenire conflitti con la CI e i bot.
2. Se compaiono conflitti di natura binaria/LevelDB (`LOG` / `MANIFEST`), la soluzione è abortire il rebase/merge, risolvere manualmente i file base (es. `module.json`), e **rieseguire il comando di compilazione node** per pulire le cartelle DB e allinearle.
3. Caricare le modifiche su git.
4. Creare un file `.zip` (es. `witcher-compendium-v14.1.55.zip`).
5. Richiedere a Manuel di verificare in Foundry ed eseguire la Release GitHub.

---

## 6. DOCUMENTO DI STATO LIVE

### 6.1 Scopo
Il file `_tools/reports/stato-compendio-live.md` è la fonte di verità
ufficiale sullo stato reale del compendio in ogni momento.
Viene usato da Perplexity come base di partenza per ogni nuova sessione
di lavoro, eliminando il rischio di doppioni o voci già presenti.

### 6.2 Struttura obbligatoria

| Sezione | Contenuto |
|---|---|
| Pack attivi | Nome, cartella, N. voci, sourcebook, note |
| Voci aggiunte (sessione) | Nome, pack, sourcebook, data |
| Voci modificate (sessione) | Nome, pack, modifica, data |
| Pack pianificati | Nome, fonte, stato |
| Issue aperte | Descrizione, priorità, assegnato |
| Changelog sessioni | Data, operazione, N. voci, autore |

### 6.3 Regola operativa — OBBLIGATORIA
L'aggiornamento di `stato-compendio-live.md` è L'ULTIMA operazione
di ogni sessione di lavoro, prima del commit Git.

Nessuna sessione si chiude senza:
1. Aggiornamento del documento live
2. Commit Git con messaggio formato: `[DATA] sessione — N voci aggiunte/modificate`

### 6.4 Uso da parte di Perplexity
All'inizio di ogni nuova conversazione, Manuel porta
`stato-compendio-live.md` come primo allegato.
Questo permette a Perplexity di avere il quadro aggiornato
senza dover ricostruire lo stato dal log storico.

### 6.5 Chi aggiorna il documento
- **Antigravity**: aggiorna voci aggiunte/modificate e changelog
- **Perplexity**: aggiorna pack pianificati e issue aperte
- **Manuel**: valida e approva prima del commit

---

*Documento aggiornato da Antigravity — 13 Aprile 2026 — v3.1*
*Precedente versione: v3.0 del 12 Aprile 2026*
*Modifiche v3.1: Aggiunta sezione 6 per la gestione del documento di stato live tramite Perplexity e Antigravity.*
