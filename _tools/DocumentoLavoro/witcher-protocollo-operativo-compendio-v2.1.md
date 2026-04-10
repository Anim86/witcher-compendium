# WITCHER COMPENDIUM — PROTOCOLLO OPERATIVO COMPLETO
## Documento di riferimento per LLM / AI Builder
### Versione: 2.4 — Data: 10 Aprile 2026 ore 22:40
### Autore: Perplexity (Strategist) per il team Manuel + Antigravity

---

## 0. CONTESTO DEL PROGETTO

Stiamo costruendo un modulo compendio completo per **The Witcher TTRPG** su **Foundry VTT v14**.
Il modulo si chiama `witcher-compendium` e gira sul sistema `TheWitcherItaNewSystem`.
Tutto il contenuto è in italiano e si basa su due manuali fisici:
- **Tomo Base (MB)** — manuale principale
- **Tomo del Caos (TC)** — espansione

Il compendio contiene ~700+ entries divise in pack LevelDB.
L'obiettivo attuale è portare ogni pack al **100% di completezza e accuratezza**.

---

## 1. IL TEAM E I RUOLI

| Membro | Ruolo | Cosa fa |
|---|---|---|
| **Manuel** | Team Manager | Supervisiona, valida, fa da tramite fisico tra i tool, testa in Foundry |
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
```

### 2.2 File TXT rilevanti (VERIFICATI al 10 Apr 2026)

| Pack Foundry | File TXT sorgente | Pagine manuale |
|---|---|---|
| witcher-weapons | Pag074_Armi.txt | 72-77 |
| witcher-armor | Pag080_Armature.txt | 78-82 |
| witcher-equipment | Pag073_Equipaggiamento.txt + Pag094_Utensili.txt + Pag095_Oggetti Vari.txt | 71, 93-97 |
| witcher-special | Pag248_Equipaggiamento da Witcher.txt | 246-250 |
| witcher-special-chaos | Pag119_Oggetti Magici.txt + Pag125_Acquistare Oggetti Magici.txt | 119-128 |
| witcher-components | Pag212_Componenti e Mutageni.txt | 212+ |
| witcher-schematics | TXT Schemi (MB + TC) | Varie |
| witcher-alchemy | TXT Alchimia (MB + TC) | Varie |
| witcher-monsters | TXT Bestiario Tomo Base | Varie |
| witcher-monsters-chaos | TXT Bestiario Tomo del Caos | Varie |
| witcher-npc | TXT NPC (MB + TC) | Varie |
| witcher-trophies | Pag126_Trofei.txt + Pag127.txt | TC 126-127 |
| witcher-transports | Pag093_Trasporti.txt | MB 93 |

### 2.3 File TXT per nuovi pack (identificati 10 Apr 2026)

| Pack proposto | File TXT sorgente | Pagine | Priorità |
|---|---|---|---|
| witcher-signs | TXT Segni Witcher | MB 114-115 | 🔴 Alta |
| witcher-signs-chaos | TXT Segni Avanzati | TC 101 | 🔴 Alta |
| witcher-hexes | TXT Fatture/Maledizioni | TC 105-106 | 🔴 Alta |
| witcher-invocations | TXT Invocazioni Preti+Druidi | TC 91-100 | 🔴 Alta |
| witcher-mutations | TXT Mutageni + Decotti | MB 251-252 + TC 134-138 | 🔴 Alta |
| witcher-gifts | TXT Doni Magici | TC 74-75 | 🔴 Alta |
| witcher-goetia | TXT Rituali Goetici | TC 139-149 | 🔴 Alta |
| witcher-runes | TXT Rune/Glifi/Reliquie | MB 253-266 | 🔴 Alta |
| witcher-critical-wounds | TXT Ferite Critiche | MB 159-161 | 🟡 Media |
| witcher-curses | TXT Maledizioni GM | MB 230-231 | 🟡 Media |
| witcher-lore | TXT Fazioni/Religioni | MB 179-210 | 🟢 Bassa |

---

## 3. STRUTTURA JSON — FORMATO REALE VERIFICATO

### 3.1 Dove vivono i JSON sorgente
```
_tools/src-packs/[CATEGORIA]/[sottocartella]/[NomeVoce].json
```

**Struttura cartelle aggiornata al 10 Apr 2026:**
```
_tools/src-packs/
├── EQUIPAGGIAMENTO/
│   ├── base/
│   │   ├── witcher-weapons/
│   │   ├── witcher-armor/
│   │   ├── witcher-equipment/
│   │   ├── witcher-special/
│   │   └── witcher-transports/        ← NUOVO 10 Apr
│   └── caos/
│       ├── witcher-special-chaos/
│       └── witcher-trophies/          ← NUOVO 10 Apr (da _DA_RICOLLOCARE)
├── CRAFTING/                          ← RINOMINATA da CREAZIONE il 10 Apr
│   └── base/
│       ├── witcher-components/
│       ├── witcher-schematics/
│       └── witcher-alchemy/
├── BESTIARIO/
│   ├── PNG/
│   │   ├── base/
│   │   │   └── witcher-monsters/
│   │   └── caos/
│   │       └── witcher-monsters-chaos/
│   └── NPC/                           ← NUOVO 10 Apr
│       └── witcher-npc/
├── MAGIA/
│   └── base/
│       ├── witcher-spells/
│       └── witcher-rituals/
├── GAMEPLAY/                          ← NUOVO 10 Apr
│   └── base/
│       ├── witcher-critical-wounds/
│       └── witcher-curses/
└── LORE/                              ← NUOVO 10 Apr
    └── base/
        └── witcher-lore/
```

### 3.2 Struttura JSON esempio — ARMA
```json
{
  "_id": "0678c7fef48542fe",
  "name": "Arco Lungo",
  "type": "weapon",
  "img": "percorso/immagine.webp",
  "system": {
    "description": "<p>Testo narrativo in italiano...</p>",
    "weight": 2,
    "cost": 475,
    "reliability": { "value": 10, "max": 10 },
    "accuracy": 0,
    "hands": 2,
    "reach": "200m",
    "effects": "N/A",
    "sourcebook": "MB 76"
  },
  "_stats": {
    "systemId": "TheWitcherItaNewSystem",
    "coreVersion": 14
  }
}
```

### 3.3 Struttura JSON esempio — SCHEMA
```json
{
  "_id": "UUID16CARATTERI",
  "name": "Schema: Spada Lunga",
  "type": "schematic",
  "img": "percorso/immagine.webp",
  "system": {
    "description": "<p>Testo narrativo. Componenti: X, Y, Z. CD Manifattura: 15. Tempo: 3 giorni.</p>",
    "weight": 0,
    "cost": 0,
    "sourcebook": "MB 74"
  },
  "_stats": {
    "systemId": "TheWitcherItaNewSystem",
    "coreVersion": 14
  }
}
```

### 3.4 Struttura JSON esempio — INGREDIENTE ALCHEMICO
```json
{
  "_id": "UUID16CARATTERI",
  "name": "Arenaria",
  "type": "component",
  "img": "assets/alchemy/pianta.webp",
  "system": {
    "description": "<p>Testo narrativo...</p>",
    "weight": 0.5,
    "cost": 10,
    "substanceType": "Vetriolo",
    "sourcebook": "MB 95"
  },
  "_stats": {
    "systemId": "TheWitcherItaNewSystem",
    "coreVersion": 14
  }
}
```

### 3.5 Struttura JSON esempio — NPC / MOSTRO (Actor)
```json
{
  "_id": "UUID16CARATTERI",
  "name": "Geralt di Rivia",
  "type": "Actor",
  "img": "modules/witcher-compendium/assets/images/NPC/Geralt.webp",
  "system": {
    "description": "<p>Testo narrativo...</p>",
    "sourcebook": "MB 277"
  },
  "_stats": {
    "systemId": "TheWitcherItaNewSystem",
    "coreVersion": 14
  }
}
```

### 3.6 Regole CRITICHE sui campi
- **`_id`**: UUID a esattamente 16 caratteri esadecimali, UNIVOCO in tutto il compendio
- **`description`**: testo in `<p>...</p>`, MAI testo grezzo, MAI tabelle OCR
- **`sourcebook`**: formato "MB [pagina]" per Tomo Base, "TC [pagina]" per Tomo del Caos
- **`cost`**: numero intero in Corone — NON stringa, NON oggetto con .value
- **`system.type`**: usa booleani (piercing/bludgeoning/elemental: true)
- **NON ESISTE** il campo `weaponType` come stringa
- **NON USARE** struttura `system.cost.value` — è il vecchio formato v13

### 3.7 Campo _stats — OBBLIGATORIO su TUTTI i file (v14)
```json
"_stats": {
  "systemId": "TheWitcherItaNewSystem",
  "coreVersion": 14
}
```
⚠️ `coreVersion` è un **numero intero** — NON una stringa `"14"`
⚠️ `systemVersion` è stato rimosso definitivamente. NON va incluso.
⚠️ Questo campo va aggiunto su OGNI file creato o modificato, senza eccezioni.

### 3.8 Regole specifiche per pack

**witcher-schematics:**
- `cost: 0` e `weight: 0` su tutti gli schemi
- Nella `description`: lista componenti, CD Manifattura, tempo di lavorazione

**witcher-alchemy — sistema icone a 2 livelli:**
- 🌿 Ingredienti vegetali → icona pianta
- 🦴 Ingredienti mostruosi → icona parte di mostro
- 🧪 Pozioni, Elisir, Oli → icona ampolla
- `substanceType` obbligatorio su tutti gli ingredienti

**witcher-npc:**
- Tipo: `Actor`
- Stats inizializzate a 0 (da completare in sprint dedicato)
- Path immagini: `modules/witcher-compendium/assets/images/NPC/NomeNPC.webp`

**witcher-trophies:**
- Provenienza: Tomo del Caos, TC 126-127
- Folder: `EQUIPAGGIAMENTO/caos/witcher-trophies/`

**witcher-transports:**
- Tipo: `Item` (come equipaggiamento)
- 18 voci: 9 trasporti + 9 equipaggiamenti da monta
- Folder: `EQUIPAGGIAMENTO/base/witcher-transports/`

---

## 4. COME TROVARE I TESTI NEI FILE TXT

### 4.1 Struttura tipica di un file TXT
```
[TITOLO SEZIONE]
[Testo introduttivo]
[NOME OGGETTO]
[Testo narrativo]
[Tabella statistiche — DA IGNORARE per la description]
[NOME OGGETTO 2]
[Testo narrativo...]
```

### 4.2 Come estrarre la descrizione corretta
1. Cerca il nome esatto della voce nel TXT
2. Prendi il TESTO NARRATIVO subito sotto il titolo
3. SCARTA le tabelle: righe con numeri, trattini, pipes | sono stats
4. SCARTA watermark OCR: righe ripetitive o prive di senso
5. Wrappa il testo estratto in `<p>...</p>`

### 4.3 Gestione apostrofi nel matching nomi
I TXT usano apostrofo tipografico ' (U+2019), i nomi JSON usano ' standard.
```javascript
const normalizza = (s) => s.replace(/[\u2018\u2019]/g, "'").toLowerCase().trim();
```

### 4.4 Quando il testo non si trova nel TXT principale
1. Controlla TXT delle pagine adiacenti
2. Interroga NotebookLM (vedi sezione 5)
3. Se ancora non trovato: flag `DESCRIZIONE MANCANTE` nel log

---

## 5. COME USARE NOTEBOOKLM

### 5.1 Ruolo di NotebookLM
NotebookLM ha accesso ai PDF completi di Tomo Base e Tomo del Caos.
È il consulente per: pagine esatte, liste complete, dati numerici, descrizioni mancanti nei TXT.
Manuel interroga NotebookLM direttamente e porta le risposte a Perplexity.

### 5.2 Template query per NotebookLM
**Lista completa:** "Nel [Tomo], quali [voci] sono nel capitolo [nome] (pag X-Y)? Lista completa con nome, costo, peso, effetti, pagina."

**Descrizione voce:** "Nel [Tomo] a pagina X, qual è il testo narrativo (non le statistiche) per [nome]?"

**Ricognizione contenuti:** "Nel [Tomo], quali sezioni contengono liste di elementi NON ancora coperti da [elenco pack esistenti]? Indica capitolo, pagine, tipo contenuto, numero voci."

### 5.3 Quando interrogare NotebookLM
- PRIMA di ogni nuovo pack: lista completa voci + pagine
- Quando il TXT ha dati corrotti o mancanti
- Per verificare stats incongruenti
- Per mappare contenuti non ancora coperti da nessun pack

---

## 6. WORKFLOW COMPLETO — 10 STEP

```
STEP 1  Perplexity prepara Brief Audit
STEP 2  Manuel passa brief ad Antigravity
STEP 3  Antigravity esegue audit (confronto TXT vs JSON pack)
STEP 4  Antigravity produce audit-[pack].md con:
        - voci presenti: OK
        - voci mancanti: MANCANTE + nome + pagina
        - descrizioni errate: ERRATA + prima riga testo attuale + correzione
STEP 5  Manuel porta report a Perplexity
STEP 6  Perplexity analizza, prepara query NotebookLM se necessario
        Manuel interroga NotebookLM e porta risposta
STEP 7  Perplexity prepara Brief Fix completo
STEP 8  Manuel passa Brief Fix ad Antigravity
STEP 9  Antigravity implementa fix:
        - In caso di corruzione sistematica: TABULA RASA + rigenerazione totale
        - Corregge descrizioni errate
        - Crea JSON per voci mancanti
        - NESSUNA compilazione DB durante il fix
        - Produce audit-fix-[pack].md
STEP 10 Manuel valida in Foundry
        OK  → commit + release GitHub + prossimo pack
        KO  → segnala anomalie → torna a STEP 7
```

⚠️ **REGOLA CRITICA:** La compilazione DB si esegue **UNA SOLA VOLTA** alla fine, dopo che TUTTI i src-packs sono bonificati.

---

## 7. BUILD E DEPLOY

### 7.1 Compilatore ufficiale
```powershell
node _tools/scripts/compile-packs-v11.mjs
```
- Basato su classic-level v3.0.0 (Rust/NAPI-RS)
- Pulisce i DB LevelDB prima di scrivere
- Compila tutti i JSON di src-packs nei DB in `witcher-compendium/packs/`
- Tempo: < 5 secondi per ~700 entries
- NON usare `compile_packs.py` (NeDB obsoleto)
- NON usare `rebuild_leveldb.js` (sostituito)

### 7.2 Check pre-compilazione OBBLIGATORI
1. **Grep globale `_stats`**: `TheWitcherItaNewSystem` presente in tutti i JSON, zero `systemVersion`
2. **`coreVersion` intero**: nessuna stringa `"14"` residua
3. **UUID univocità**: nessun duplicato tra pack diversi
4. **module.json aggiornato**: tutti i nuovi pack registrati correttamente

### 7.3 Bump versione — OBBLIGATORIO prima di ogni deploy
```json
"version": "14.1.XX"
```
REGOLA ASSOLUTA: versione sempre CRESCENTE.
Ultima versione nota: **v14.1.25** (9 Aprile sera) — verificare prima del bump.

### 7.4 Deploy con manifest remoto (metodo Manuel)
```
1. git add .
2. git commit -m "fix: [descrizione] - v14.1.XX"
3. git push origin main
4. Crea ZIP di witcher-compendium/
5. Pubblica release GitHub: tag v14.1.XX + ZIP allegato
6. Verifica: module.json "download" punta al nuovo ZIP
7. Foundry → Gestione Moduli → Controlla aggiornamenti
```

### 7.5 Deploy alternativo per test rapido locale
```
Copia: [repo]\witcher-compendium\
  → AppData\Local\FoundryVTT\Data\modules\witcher-compendium\
Riavvia Foundry (server, non solo browser)
```

---

## 8. VALIDAZIONE IN FOUNDRY

Dopo ogni deploy, Manuel verifica a campione:
- 1 arma da mischia + 1 a distanza: descrizione narrativa leggibile (NO tabelle OCR)
- 1 armatura: descrizione corretta
- 1 munizione: appare nel pack, isAmmo presente, costo corretto
- 1 schema: cost 0, weight 0, componenti leggibili
- 1 ingrediente alchemico: substanceType corretto, icona giusta
- 1 mostro Base + 1 mostro Chaos: stats corrette vs manuale
- 1 NPC: descrizione narrativa presente, stats a 0
- 1 trofeo: descrizione TC corretta, folder caos
- 1 trasporto: costo/peso corretti, descrizione MB
- Console F12: ZERO errori bloccanti

---

## 9. STATO PACK — 10 APRILE 2026 ORE 11:30

| Pack | Entries | Stato | Note |
|---|---|---|---|
| witcher-weapons | 44 | ✅ COMPLETO | |
| witcher-armor | 35 | ✅ COMPLETO | |
| witcher-equipment | 100 | ✅ COMPLETO | |
| witcher-special | 37 | ✅ COMPLETO | |
| witcher-special-chaos | 19 | ✅ COMPLETO | |
| witcher-components | 52 | ✅ COMPLETO | |
| witcher-schematics | 109 | ✅ COMPLETO | |
| witcher-alchemy | 96 | ✅ COMPLETO | |
| witcher-monsters | 19 | ✅ COMPLETO | |
| witcher-monsters-chaos | 7 | ✅ COMPLETO | |
| witcher-npc | 24 | ✅ COMPLETO | |
| witcher-trophies | 35 | ✅ COMPLETO | |
| witcher-transports | 18 | ✅ COMPLETO | |
| witcher-signs | 10 | ✅ COMPLETO | MB 114-115 |
| witcher-signs-chaos | 2 | ✅ COMPLETO | TC 101 |
| witcher-hexes | 6 | ✅ COMPLETO | TC 105-106 |
| witcher-hexes-base | 6 | ✅ COMPLETO | NUOVO — MB 122-124 |
| witcher-invocations | 33 | ✅ COMPLETO | MB+TC |
| witcher-mutations | 14 | ✅ COMPLETO | |
| witcher-gifts | 14 | ✅ COMPLETO | |
| witcher-goetia | 5 | ✅ COMPLETO | |
| witcher-runes | 32 | ✅ COMPLETO | |
| witcher-spells | 65 | ✅ COMPLETO | era 103, rimossi duplicati |
| witcher-spells-chaos | 52 | ✅ COMPLETO | era 85, rimossi duplicati |
| witcher-rituals | 15 | ✅ COMPLETO | era 10, +5 aggiunti MB |
| witcher-rituals-chaos | 10 | ✅ COMPLETO | bonifica + tabula rasa |
| witcher-races | 4 | ✅ COMPLETO | solo razze giocabili MB |
| witcher-professions | 10 | ✅ COMPLETO | +Druido TC, Prete upgrade TC |
| witcher-skills | ~60 | ✅ COMPLETO | +20 nuove abilità TC |
| witcher-critical-wounds | 14 | ✅ COMPLETO | MB 159-161 |
| witcher-curses | 5 | ✅ COMPLETO | MB 230-232 |
| witcher-lore | 39 | ✅ COMPLETO | MB 179-182, 207-211 |

**Versione modulo corrente: v14.1.25** — verificare prima del bump

---

## 10. LEZIONI APPRESE — ERRORI DA NON RIPETERE

| Errore | Causa | Regola |
|---|---|---|
| Modifiche non visibili in Foundry | Manifest remoto, non copia locale | Fare SEMPRE release GitHub dopo build |
| Campo weaponType inesistente | Sistema usa system.type con booleani | Verificare struttura JSON PRIMA di creare campi |
| Versione retrocessa | Perplexity non sapeva versione corrente | Chiedere SEMPRE versione corrente prima del bump |
| Build in path sbagliato | Script scriveva in /packs/ non in sottocartelle | Verificare path destinazione build |
| Crash sessione Antigravity | Tool instabile su sessioni lunghe | Tenere brief di ripristino pronto |
| Descrizioni OCR corrotte | Parsing grezzo senza pulizia | Scartare tabelle e watermark, solo testo narrativo |
| Apostrofi rompono il matching | TXT usa U+2019, JSON usa standard | Normalizzare sempre prima del confronto |
| Voci speciali in pagine diverse | Munizioni speciali a Pag 256 non Pag 074 | Interrogare NotebookLM per voci in pagine non ovvie |
| Gambesone descriveva chiese | Testo OCR da pagina sbagliata | Verificare sempre che il testo corrisponda alla voce |
| systemVersion nel campo _stats | Campo inesistente in v14 | Usare SOLO systemId + coreVersion, mai systemVersion |
| coreVersion come stringa "14" | Errore di tipo nel JSON | coreVersion è numero intero 14, MAI stringa |
| Compilazione dopo ogni pack | Workflow non ottimale | Compilare UNA SOLA VOLTA alla fine |
| Costo schemi ereditato dall'oggetto | Schema ≠ oggetto fisico | Schemi: cost 0 e weight 0 sempre |
| Icone alchemy tutte uguali | Default non differenziato | 2 livelli: vegetali/mostruosi/pozioni |
| Stats bestiari errate per "ereditarietà" | Copia/incolla tra voci simili | Verificare SEMPRE ogni voce vs TXT, mai assumere similarità |

---

## 11. TEMPLATE BRIEF — COPIA E INCOLLA

### TEMPLATE AUDIT + FIX (metodo consolidato)
```
BRIEF ANTIGRAVITY — Audit + Fix Pack [NOME]
Data: [DATA]

PROGETTO: witcher-compendium — Foundry VTT v14 — TheWitcherItaNewSystem
Versione modulo corrente: v14.1.25
⚠️ REGOLA ASSOLUTA: NESSUNA compilazione DB in questa fase.

Step 1 — Trova i TXT sorgente:
Get-ChildItem "[Tomo]\Testi" | Where-Object {$_.Name -match "[keyword]"}

Step 2 — Lista voci attuali:
Get-ChildItem "_tools\src-packs\**\[NOME-PACK]\*.json" -Recurse | Select-Object Name

Step 3 — Audit completo:
- Lista voci TXT: OK / MANCANTE / ERRATA
- Per ERRATA: prima riga descrizione attuale + cosa correggere
- Per MANCANTE: nome + pagina

Step 4 — Fix diretto:
- Correggi descrizioni errate (<p>, no OCR)
- Crea JSON mancanti (UUID 16 char, flat)
- sourcebook: "MB [pag]" o "TC [pag]"

_stats OBBLIGATORIO su ogni file:
"_stats": { "systemId": "TheWitcherItaNewSystem", "coreVersion": 14 }

Output: audit-fix-[pack].md — NESSUNA compilazione DB
```

### TEMPLATE NUOVO PACK
```
BRIEF ANTIGRAVITY — Nuovo Pack [NOME]
Data: [DATA]

PROGETTO: witcher-compendium — Foundry VTT v14 — TheWitcherItaNewSystem
⚠️ NESSUNA compilazione DB.

Fonte: [TXT sorgente + pagine manuale]
Tipo entries: [Item / Actor]
Percorso src-packs: _tools/src-packs/[CATEGORIA]/[base|caos]/[witcher-nomepack]/

Step 1 — Leggi TXT sorgente
Step 2 — Estrai lista completa voci
Step 3 — Crea JSON per ogni voce:
  - UUID: 16 char hex, univoco in tutto il compendio
  - description: <p>...</p>, NO tabelle, NO OCR
  - sourcebook: "MB [pag]" o "TC [pag]"
  - _stats: { "systemId": "TheWitcherItaNewSystem", "coreVersion": 14 }
Step 4 — Registra pack in module.json
Step 5 — Aggiorna setup-folders.js

Output: audit-fix-[pack].md con lista voci create + flag DESCRIZIONE MANCANTE
```

### TEMPLATE RIPRISTINO CRASH
```
RIPRISTINO SESSIONE — [DATA ORA]

Progetto: witcher-compendium — Foundry VTT v14 — TheWitcherItaNewSystem
Versione corrente modulo: v14.1.25
Documento di riferimento: witcher-protocollo-operativo-v2.1.md

Task in corso al crash: [DESCRIZIONE PRECISA]
Punto di interruzione: [DOVE ERA ARRIVATO]

Task completati nella sessione: [lista]
Prossima azione richiesta: [cosa fare per riprendere]
```

---

## 12. REPORT DI AUDIT GENERATI OGGI (10/04/2026)

Documentazione dettagliata dei processi di creazione e verifica:
- **audit-fix-witcher-signs.md**: 10 Segni Base (MB)
- **audit-fix-witcher-signs-chaos.md**: 2 Segni Avanzati (TC)
- **audit-fix-witcher-hexes.md**: 6 Fatture (TC)
- **audit-fix-witcher-invocations.md**: 33 Invocazioni (MB+TC)
- **audit-fix-witcher-mutations.md**: 14 Mutageni (MB+TC)
- **audit-fix-witcher-gifts.md**: 14 Doni Magici (TC)
- **audit-fix-witcher-goetia.md**: 5 Rituali Goetici (TC)
- **audit-fix-witcher-runes.md**: 32 Rune, Glifi e Reliquie (MB)

---

## 13. PROSSIMI STEP

1. ⏳ IDENTIFICARE src-packs rimanenti da sistemare
2. 🔴 BUILD + DEPLOY — Compilare tutti i pack e testare in Foundry VTT
3. 🔴 IMMAGINI — Assegnare immagini specifiche alle voci con Placeholder.webp
4. 🔴 RELIQUIE — Valutare type dedicato dopo la build
5. 🟡 NOBILE + ESPLORATORE — Sprint futuro quando disponibili TXT sorgente

---

*Documento aggiornato da Antigravity — 10 Aprile 2026 — v2.4*
*Precedente versione: v2.3 del 10 Aprile 2026 ore 16:15*
*Modifiche v2.4: aggiunti pack witcher-critical-wounds (severity/desc), witcher-curses (GM curses) e witcher-lore (note).*
