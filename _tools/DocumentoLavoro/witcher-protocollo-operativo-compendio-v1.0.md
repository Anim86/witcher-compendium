# WITCHER COMPENDIUM — PROTOCOLLO OPERATIVO COMPLETO
## Documento di riferimento per LLM / AI Builder
### Versione: 1.0 — Data: 9 Aprile 2026
### Autore: Perplexity (Strategist) per il team Manuel + Antigravity

---

## 0. CONTESTO DEL PROGETTO

Stiamo costruendo un modulo compendio completo per **The Witcher TTRPG** su **Foundry VTT v14**.
Il modulo si chiama `witcher-compendium` e gira sul sistema `TheWitcherItaNewSystem`.
Tutto il contenuto e' in italiano e si basa su due manuali fisici:
- **Tomo Base (TB)** — manuale principale
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

Tomo Base:   Tomo Base/Testi/PagXXX_NomeSezione.txt
Tomo del Caos: Tomo del Caos/Testi/PagXXX_NomeSezione.txt

### 2.2 File TXT rilevanti per l'equipaggiamento (VERIFICATI il 9 Apr 2026)

| Pack Foundry | File TXT sorgente | Pagine manuale |
|---|---|---|
| witcher-weapons | Pag074_Armi.txt | 72-77 |
| witcher-armor | Pag080_Armature.txt | 78-82 |
| witcher-equipment | Pag073_Equipaggiamento.txt + Pag094_Utensili.txt + Pag095_Oggetti Vari.txt | 71, 93-97 |
| witcher-special | Pag248_Equipaggiamento da Witcher.txt | 246-250 |
| witcher-special-chaos | Pag119_Oggetti Magici.txt + Pag125_Acquistare Oggetti Magici.txt | 119-128 |
| witcher-components (chaos) | Pag212_Componenti e Mutageni.txt | 212+ |

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
  }
}
```

### 3.3 Struttura JSON esempio — MUNIZIONE
```json
{
  "_id": "UUID16CARATTERI",
  "name": "Munizioni Normali",
  "type": "weapon",
  "img": "icons/weapons/ammunition/arrows-quiver-simple-brown.webp",
  "system": {
    "description": "<p>Testo narrativo...</p>",
    "weight": 0.1,
    "cost": 10,
    "quantity": 10,
    "isAmmo": true,
    "type": { "text": "Munizione", "piercing": true },
    "sourcebook": "MB 74"
  }
}
```

### 3.4 Struttura JSON esempio — OGGETTO GENERICO
```json
{
  "_id": "UUID16CARATTERI",
  "name": "Nome Oggetto",
  "type": "item",
  "img": "percorso/immagine.webp",
  "system": {
    "description": "<p>Testo narrativo...</p>",
    "weight": 1,
    "cost": 50,
    "sourcebook": "MB 95"
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
1. Controlla TXT delle pagine adiacenti (es. desc dell'arma puo' essere a Pag 75-76 non Pag 74)
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
- Per trovare voci in pagine non ovvie (es. munizioni speciali a Pag 256 invece di Pag 074)

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
        - Corregge descrizioni errate
        - Crea JSON per voci mancanti
        - Esegue: node _tools/scripts/compile-packs-v11.mjs
        - Produce log-fix-[pack]-[data].md
STEP 10 Manuel valida in Foundry
        OK  → commit + release GitHub + prossimo pack
        KO  → segnala anomalie → torna a STEP 7
```

---

## 7. BUILD E DEPLOY

### 7.1 Compilatore ufficiale (Fase 7 — 9 Aprile 2026)
```powershell
node _tools/scripts/compile-packs-v11.mjs
```
- Basato su classic-level v3.0.0 (Rust/NAPI-RS)
- Pulisce i DB LevelDB prima di scrivere
- Compila tutti i JSON di src-packs nei DB in witcher-compendium/packs/
- Tempo: < 5 secondi per ~700 entries
- NON usare compile_packs.py (NeDB obsoleto)
- NON usare rebuild_leveldb.js (sostituito)

### 7.2 Bump versione — OBBLIGATORIO prima di ogni deploy
```json
In module.json: "version": "14.1.XX"
```
REGOLA ASSOLUTA: la versione va sempre AUMENTATA, mai diminuita.
Versione al 9 Aprile sera: v14.1.25 — verificare sempre prima del bump.

### 7.3 Deploy con manifest remoto (metodo Manuel)
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

### 7.4 Deploy alternativo per test rapido locale
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
- Console F12: ZERO errori bloccanti

---

## 9. STATO PACK — 9 APRILE 2026 ORE 22:59

| Pack | Entries | Stato |
|---|---|---|
| witcher-weapons | 44 (35+9 munizioni) | Fix applicati, in attesa test Foundry |
| witcher-armor | 35 | Fix applicati, in attesa test Foundry |
| witcher-equipment | 36 | Audit in corso (Brief inviato) |
| witcher-special | 20 | In coda — prossimo dopo equipment |
| witcher-special-chaos | 53 | In coda |
| witcher-components | 46 | In coda |
| witcher-schematics | 120 | In coda |
| witcher-alchemy | 90 | In coda |

Versione modulo corrente: v14.1.25

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

---

## 11. TEMPLATE BRIEF — COPIA E INCOLLA

### TEMPLATE AUDIT
```
BRIEF ANTIGRAVITY — Audit Pack [NOME]
Data: [DATA]

File TXT sorgente:
- Tomo Base\Testi\[file1.txt]
- Tomo Base\Testi\[file2.txt]  (se necessario)

Step 1 — Lista voci attuali nel pack:
Get-ChildItem "_tools\src-packs\[PERCORSO]\*.json" | Select-Object Name

Step 2 — Leggi i TXT e produci report:
- Lista voci TXT con stato: OK / MANCANTE / ERRATA
- Per ERRATA: mostra prima riga descrizione attuale
- Per MANCANTE: nome + pagina manuale

Output: audit-[pack]-[data].md
Nessuna modifica ancora, solo analisi.
```

### TEMPLATE FIX
```
BRIEF ANTIGRAVITY — Fix Pack [NOME]
Data: [DATA]

Azioni richieste:

1. Correggi descrizioni ERRATE per: [lista voci]
   Fonte: [file TXT]
   - Estrai testo narrativo, scarta tabelle e OCR
   - Wrappa in <p>...</p>
   - Preserva intatti: _id, img, tutte le stats

2. Crea JSON per voci MANCANTI: [lista voci]
   Struttura flat (vedi sezione 3 di questo documento)
   UUID a 16 caratteri univoci
   sourcebook: "MB [pagina]"

3. Build:
   node _tools/scripts/compile-packs-v11.mjs

4. Output: log-fix-[pack]-[data].md
   Nessun commit ancora, revisione Manuel prima.
```

### TEMPLATE RIPRISTINO CRASH
```
RIPRISTINO SESSIONE — [DATA ORA]

Progetto: witcher-compendium per Foundry VTT v14 (TheWitcherItaNewSystem)
Versione corrente modulo: v14.1.25
Documento di riferimento: witcher-protocollo-operativo-v1.0.md

Task in corso al crash: [DESCRIZIONE PRECISA]
Punto di interruzione: [DOVE ERA ARRIVATO]

Task completati nella sessione:
- [lista]

Prossima azione richiesta:
- [cosa fare per riprendere]
```

---

*Documento creato da Perplexity — 9 Aprile 2026*
*Aggiornare ad ogni nuova lezione appresa o cambio di workflow*
