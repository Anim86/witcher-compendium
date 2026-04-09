# WITCHER COMPENDIUM — PROTOCOLLO OPERATIVO COMPLETO
## Documento di riferimento per LLM / AI Builder
### Versione: 2.0 — Data: 10 Aprile 2026
### Autore: Perplexity (Strategist) per il team Manuel + Antigravity

---

## 0. CONTESTO DEL PROGETTO

Stiamo costruendo un modulo compendio completo per **The Witcher TTRPG** su **Foundry VTT v14**.
Il modulo si chiama `witcher-compendium` e gira sul sistema `TheWitcherItaNewSystem`.
Tutto il contenuto e' in italiano e si basa su due manuali fisici:
- **Tomo Base (MB)** — manuale principale
- **Tomo del Caos (TC)** — espansione

Il compendio contiene ~700 entries divise in 17 pack LevelDB.
L'obiettivo attuale e' portare ogni pack al **100% di completezza e accuratezza**.

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
I testi del manuale sono stati estratti dal PDF in file TXT, uno per sezione.

Tomo Base:    Tomo Base/Testi/PagXXX_NomeSezione.txt
Tomo del Caos: Tomo del Caos/Testi/PagXXX_NomeSezione.txt

### 2.2 File TXT rilevanti (VERIFICATI il 9-10 Apr 2026)

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

### 2.3 File TXT per sprint futuri
| File TXT | Contenuto | Sprint |
|---|---|---|
| Pag093_Trasporti.txt | Cavalcature, carri, imbarcazioni | FUTURO — nuovo pack witcher-transports |

---

## 3. STRUTTURA JSON — FORMATO REALE VERIFICATO

### 3.1 Dove vivono i JSON sorgente
```
_tools/src-packs/[CATEGORIA]/[sottocartella]/[NomeVoce].json
```
Esempio:
```
_tools/src-packs/EQUIPAGGIAMENTO/base/witcher-weapons/Spada Lunga.json
_tools/src-packs/EQUIPAGGIAMENTO/base/witcher-armor/Gambesone.json
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
    "coreVersion": "14"
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
    "coreVersion": "14"
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
    "coreVersion": "14"
  }
}
```

### 3.5 Regole CRITICHE sui campi
- **`_id`**: UUID a esattamente 16 caratteri esadecimali, UNIVOCO in tutto il compendio
- **`description`**: testo in `<p>...</p>`, MAI testo grezzo, MAI tabelle OCR
- **`sourcebook`**: formato "MB [pagina]" per Tomo Base, "TC [pagina]" per Tomo del Caos
- **`cost`**: numero intero in Corone — NON stringa, NON oggetto con .value
- **`system.type`**: usa booleani (piercing/bludgeoning/elemental: true)
- **NON ESISTE** il campo `weaponType` come stringa
- **NON USARE** struttura `system.cost.value` — e' il vecchio formato v13

### 3.6 Campo _stats — OBBLIGATORIO su TUTTI i file (v14)
```json
"_stats": {
  "systemId": "TheWitcherItaNewSystem",
  "coreVersion": "14"
}
```
⚠️ `systemVersion` e' stato rimosso definitivamente. NON va incluso.
⚠️ Questo campo va aggiunto su OGNI file creato o modificato, senza eccezioni.

### 3.7 Regole specifiche per pack

**witcher-schematics:**
- `cost: 0` e `weight: 0` su tutti gli schemi (lo schema e' conoscenza, non oggetto fisico)
- Il costo dell'oggetto finito appartiene al JSON dell'oggetto nel pack relativo
- Nella `description`: lista componenti, CD Manifattura, tempo di lavorazione

**witcher-alchemy — sistema icone a 2 livelli:**
- 🌿 Ingredienti vegetali → icona pianta (es. Pag145_Sostanze Alchemiche_02.webp)
- 🦴 Ingredienti mostruosi → icona parte di mostro (es. Pag145_Sostanze Alchemiche_01.webp)
- 🧪 Pozioni, Elisir, Oli → icona ampolla (es. Pag089_..._08.webp)
- Se gli asset differenziati NON esistono → icona generica per tutti (no blocchi al workflow)
- `substanceType` obbligatorio su tutti gli ingredienti (Vetriolo, Rebis, Etere, ecc.)
- Nella `description`: sostanza base, effetti, durata, tossicita'

---

## 4. COME TROVARE I TESTI NEI FILE TXT

### 4.1 Struttura tipica di un file TXT
```
[TITOLO SEZIONE]

[Testo introduttivo della sezione]

[NOME OGGETTO]
[Testo narrativo — es. citazione di Rodolf Kazmer per equipaggiamento]
[Tabella statistiche — DA IGNORARE per la description]

[NOME OGGETTO 2]
[Testo narrativo...]
...
```

### 4.2 Come estrarre la descrizione corretta
1. Cerca il nome esatto della voce nel TXT
2. Prendi il TESTO NARRATIVO subito sotto il titolo
3. SCARTA le tabelle: righe con numeri, trattini, pipes | sono stats
4. SCARTA watermark OCR: righe ripetitive o prive di senso
5. Wrappa il testo estratto in <p>...</p>

### 4.3 Gestione apostrofi nel matching nomi
I TXT usano apostrofo tipografico ' (U+2019), i nomi JSON usano ' standard.
Normalizzare prima del confronto:
```javascript
const normalizza = (s) => s.replace(/[\u2018\u2019]/g, "'").toLowerCase().trim();
```

### 4.4 Quando il testo non si trova nel TXT principale
1. Controlla TXT delle pagine adiacenti
2. Interroga NotebookLM (vedi sezione 5)
3. Se ancora non trovato: lascia campo vuoto con flag nel log: "DESCRIZIONE MANCANTE"
   ESEMPIO REALE: munizioni speciali erano a Pag 256, non a Pag 074 dove ci si aspettava

---

## 5. COME USARE NOTEBOOKLM

### 5.1 Ruolo di NotebookLM
NotebookLM ha accesso ai PDF completi di Tomo Base e Tomo del Caos.
E' il consulente per: pagine esatte, liste complete, dati numerici, descrizioni mancanti nei TXT.
Manuel interroga NotebookLM direttamente e porta le risposte a Perplexity.

### 5.2 Template query per NotebookLM

**Lista completa di una sezione:**
"Nel [Tomo Base / Tomo del Caos], quali [oggetti/armi/armature] sono presenti
nel capitolo [nome] (pagine X-Y)? Lista completa con nome, costo in Corone,
peso, effetti speciali e pagina di riferimento."

**Descrizione di una voce specifica:**
"Nel [Tomo Base] a pagina X, qual e' il testo descrittivo (narrativo, non le
statistiche) per [nome voce]? Includi citazioni o testo in corsivo."

**Pagine di una sezione:**
"In quale range di pagine si trova la sezione [nome] nel [Tomo Base]?
Pagina inizio e fine, specificando se tabelle e descrizioni sono su pagine diverse."

**Verifica dati:**
"Nel Tomo Base a pagina X, quali sono le statistiche esatte di [nome voce]?
Verifica: costo Y Corone, effetto Z. E' corretto?"

### 5.3 Quando interrogare NotebookLM
- PRIMA di ogni nuovo pack: chiedere lista completa voci + pagine di riferimento
- Quando il TXT ha dati corrotti o mancanti
- Per verificare stats che sembrano incongruenti
- Per trovare voci in pagine non ovvie

---

## 6. WORKFLOW COMPLETO — 10 STEP

```
STEP 1  Perplexity prepara Brief Audit
STEP 2  Manuel passa brief ad Antigravity
STEP 3  Antigravity esegue audit (confronto TXT vs JSON pack)
STEP 4  Antigravity produce audit-[pack]-[data].md con:
        - voci presenti: OK
        - voci mancanti: MANCANTE
        - descrizioni errate: ERRATA + prima riga del testo attuale
STEP 5  Manuel porta report a Perplexity
STEP 6  Perplexity analizza, prepara query NotebookLM se necessario
        Manuel interroga NotebookLM e porta risposta
STEP 7  Perplexity prepara Brief Fix completo
STEP 8  Manuel passa Brief Fix ad Antigravity
STEP 9  Antigravity implementa fix:
        - In caso di corruzione sistematica: TABULA RASA + rigenerazione totale
        - Corregge descrizioni errate
        - Crea JSON per voci mancanti
        - NESSUNA compilazione DB durante il fix (solo src-packs)
        - Produce audit-fix-[pack]-[data].md
STEP 10 Manuel valida in Foundry
        OK  → commit + release GitHub + prossimo pack
        KO  → segnala anomalie → torna a STEP 7
```

⚠️ **NOTA IMPORTANTE (appresa il 10 Apr 2026):**
La compilazione DB (node compile-packs-v11.mjs) si esegue UNA SOLA VOLTA alla fine,
dopo che TUTTI i src-packs sono stati bonificati. NON compilare dopo ogni singolo pack.

---

## 7. BUILD E DEPLOY

### 7.1 Compilatore ufficiale
```powershell
node _tools/scripts/compile-packs-v11.mjs
```
- Basato su classic-level v3.0.0 (Rust/NAPI-RS)
- Pulisce i DB LevelDB prima di scrivere
- Compila tutti i JSON di src-packs nei DB in witcher-compendium/packs/
- Tempo: < 5 secondi per ~700 entries
- NON usare compile_packs.py (NeDB obsoleto)
- NON usare rebuild_leveldb.js (sostituito)

### 7.2 Check pre-compilazione OBBLIGATORI
Prima di lanciare il build finale:
1. **Grep globale `_stats`**: verifica che `TheWitcherItaNewSystem` sia in tutti i JSON
   e che non ci siano residui con `systemVersion`
2. **UUID univocita'**: nessun UUID a 16 char duplicato tra pack diversi
3. **Pack non rigenerati** (weapons, armor, special, special-chaos): verificare che abbiano
   gia' i `_stats` aggiornati (sistemati manualmente da Manuel nelle sessioni precedenti)

### 7.3 Bump versione — OBBLIGATORIO prima di ogni deploy
```json
In module.json: "version": "14.1.XX"
```
REGOLA ASSOLUTA: la versione va sempre AUMENTATA, mai diminuita.
Versione al 9 Aprile sera: v14.1.25 — verificare sempre prima del bump.

### 7.4 Deploy con manifest remoto (metodo Manuel)
Manuel usa URL manifest GitHub. Foundry NON legge file locali.
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
- 1 armatura: descrizione corretta (NO testo estraneo come "chiese e preti")
- 1 munizione: appare nel pack, isAmmo presente, costo corretto
- 1 oggetto equipment: descrizione presente, costo corretto
- 1 schema: cost 0, weight 0, componenti leggibili nella description
- 1 ingrediente alchemico: substanceType corretto, icona giusta
- Console F12: ZERO errori bloccanti

---

## 9. STATO PACK — 10 APRILE 2026 ORE 00:21 ✅ COMPLETO

| Pack | Entries | Stato | Note |
|---|---|---|---|
| witcher-weapons | 44 | ✅ COMPLETO | 35 armi + 9 munizioni |
| witcher-armor | 35 | ✅ COMPLETO | |
| witcher-equipment | 100 | ✅ COMPLETO | Rigenerazione totale |
| witcher-special | 37 | ✅ COMPLETO | |
| witcher-special-chaos | 19 | ✅ COMPLETO | |
| witcher-components | 52 | ✅ COMPLETO | |
| witcher-schematics | 109 | ✅ COMPLETO | Rigenerazione totale, cost/weight 0 |
| witcher-alchemy | 96 | ✅ COMPLETO | Rigenerazione totale, icone 2 livelli |
| **TOTALE** | **~492** | **🏁 PRONTI PER BUILD** | |

**Prossimo step:** grep globale verifica → compilazione DB finale → release GitHub

Versione modulo corrente: v14.1.25 (verificare prima del bump)

---

## 10. LEZIONI APPRESE — ERRORI DA NON RIPETERE

| Errore | Causa | Regola |
|---|---|---|
| Modifiche non visibili in Foundry | Manifest remoto, non copia locale | Fare SEMPRE release GitHub dopo build |
| Campo weaponType inesistente | Sistema usa system.type con booleani | Verificare struttura JSON esistente PRIMA di creare campi |
| Versione retrocessa | Perplexity non sapeva versione corrente | Chiedere SEMPRE versione corrente prima del bump |
| Build in path sbagliato | Script scriveva in /packs/ non in sottocartelle | Verificare path destinazione build |
| Crash sessione Antigravity | Tool instabile su sessioni lunghe | Tenere brief di ripristino pronto |
| Descrizioni OCR corrotte | Parsing grezzo senza pulizia | Scartare tabelle e watermark, solo testo narrativo |
| Apostrofi rompono il matching | TXT usa apostrofo tipografico, JSON usa standard | Normalizzare sempre prima del confronto |
| Voci speciali in pagine diverse | Munizioni speciali a Pag 256 non Pag 074 | Interrogare NotebookLM per voci in pagine non ovvie |
| Gambesone descriveva chiese | Testo OCR estratto dalla pagina sbagliata | Verificare sempre che il testo corrisponda alla voce |
| systemVersion nel campo _stats | Campo inesistente in v14 | Usare SOLO systemId + coreVersion, mai systemVersion |
| Compilazione dopo ogni pack | Workflow non ottimale | Compilare UNA SOLA VOLTA alla fine, dopo tutti i fix |
| Costo schemi ereditato dall'oggetto | Schema != oggetto fisico | Schemi: cost 0 e weight 0 sempre |
| Icone alchemy tutte uguali | Default non differenziato | 2 livelli: vegetali/mostruosi/pozioni se asset disponibili |

---

## 11. TEMPLATE BRIEF — COPIA E INCOLLA

### TEMPLATE AUDIT + FIX (metodo consolidato 10 Apr 2026)
```
BRIEF ANTIGRAVITY — Audit + Fix Pack [NOME]
Obiettivo: audit e fix JSON in src-packs. NESSUNA compilazione DB.

Step 1 — Trova i TXT sorgente:
Get-ChildItem "[Tomo]\Testi" | Where-Object {$_.Name -match "[keyword]"}

Step 2 — Lista voci attuali:
Get-ChildItem "_tools\src-packs\**\[NOME-PACK]\*.json" -Recurse | Select-Object Name

Step 3 — Audit completo:
- Lista voci TXT: OK / MANCANTE / ERRATA
- Per ERRATA: prima riga descrizione attuale
- Per MANCANTE: nome + pagina

Step 4 — Fix diretto:
- Correggi descrizioni errate (<p>, no OCR)
- Crea JSON mancanti (flat, UUID 16 char)
- sourcebook: "MB [pag]" o "TC [pag]" secondo origine

Campo _stats OBBLIGATORIO su tutti i file creati o modificati:
"_stats": {
  "systemId": "TheWitcherItaNewSystem",
  "coreVersion": "14"
}

Output: audit-fix-[pack]-[data].md
NESSUNA compilazione DB
```

### TEMPLATE RIPRISTINO CRASH
```
RIPRISTINO SESSIONE — [DATA ORA]

Progetto: witcher-compendium per Foundry VTT v14 (TheWitcherItaNewSystem)
Versione corrente modulo: v14.1.25
Documento di riferimento: witcher-protocollo-operativo-v2.0.md

Task in corso al crash: [DESCRIZIONE PRECISA]
Punto di interruzione: [DOVE ERA ARRIVATO]

Task completati nella sessione:
- [lista]

Prossima azione richiesta:
- [cosa fare per riprendere]
```

---

*Documento aggiornato da Perplexity — 10 Aprile 2026 — v2.0*
*Precedente versione: v1.0 del 9 Aprile 2026*
*Aggiornare ad ogni nuova lezione appresa o cambio di workflow*
