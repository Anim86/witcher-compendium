# THE WITCHER RPG — FOUNDRY VTT COMPENDIO
## Documento di Aggiornamento Sprint — 9 Aprile 2026
### Da integrare in: witcher-foundry-OMNIBUS-MASTER-v7.0.md

---

## SPRINT: COMPLETAMENTO E AUDIT COMPENDIO EQUIPAGGIAMENTO
**Data inizio:** 9 Aprile 2026
**Stato:** 🟡 IN CORSO
**Responsabile strategia:** Perplexity
**Builder:** Antigravity
**Manager:** Manuel

---

## 1. CONTESTO E OBIETTIVO

### Situazione di partenza
Al termine dello sprint Cartelle (v14.1.22 — 8-9 Aprile 2026), il compendio conta:
- 17 pack assegnati, struttura cartelle funzionante su mondo nuovo
- ~700 entries totali, copertura immagini ~95%
- Stato qualità contenuti: NON ancora verificato al 100%
  - Tomo Base: 93.8% immagini, descrizioni parzialmente verificate
  - Tomo del Caos: 100% immagini, descrizioni fluff OK (sprint Refinement A)

### Obiettivo sprint
Portare il compendio al **100% di completezza e accuratezza** per tutta la sezione
oggettistica ed equipaggiamento. Razze e Professioni in standby.

### Scope confermato — Pack coinvolti
| Pack | Label | Entries attuali | Priorità |
|---|---|---|---|
| witcher-weapons | Armi | 35 | 🔴 PRIMA |
| witcher-armor | Armature | 33 | 🔴 PRIMA |
| witcher-equipment | Oggetti Vari | 36 | 🔴 ALTA |
| witcher-special | Oggetti Witcher | 20 | 🔴 ALTA |
| witcher-special-chaos | Oggetti Chaos | 53 | 🟠 MEDIA |
| witcher-components | Componenti | 46 | 🟠 MEDIA |
| witcher-schematics | Schemi | 120 | 🟡 BASSA |
| witcher-alchemy | Alchimia | 90 | 🟡 BASSA |

### Out of scope (sprint dedicato futuro)
- Razze, Professioni, Abilità
- Pack Trasporti (nuovo compendio dedicato — da creare dopo questo sprint)
- Magia, Rituali, Bestiario

---

## 2. SORGENTI DATI — MAPPATURA CONFERMATA

### Metodologia di lavoro
- **Fonte primaria:** file TXT estratti dal PDF del manuale
- **Fonte secondaria:** NotebookLM (interrogato per pagine, liste complete, dati numerici)
- **Antigravity:** riceve brief precisi, produce audit e fix
- **Perplexity:** coordina, analizza output, prepara brief successivi
- **Manuel:** supervisione, validazione, tramite fisico tra i tool

### Struttura cartelle confermata (output comando PowerShell 9 Apr)
```
Tomo Base/Testi/
Tomo del Caos/Testi/
```
(Nota: il percorso _tools/src-raw/Testi/ non esiste — cartelle trovate tramite ricerca ricorsiva)

### Mappatura TXT → Pack (Tomo Base) — VERIFICATA
| Pack Foundry | File TXT sorgente | Pagine manuale | Stato |
|---|---|---|---|
| witcher-weapons | Pag074_Armi.txt | 72–77 | ✅ Confermato |
| witcher-armor | Pag080_Armature.txt | 78–82 | ✅ Confermato |
| witcher-equipment | Pag073_Equipaggiamento.txt + Pag094_Utensili.txt + Pag095_Oggetti Vari.txt | 71, 93–97 | ✅ Confermato |
| witcher-special | Pag248_Equipaggiamento da Witcher.txt | 246–250 | ✅ Confermato |

### File TXT identificati ma NON ancora mappati
| File TXT | Contenuto probabile | Azione |
|---|---|---|
| Pag093_Trasporti.txt | Cavalcature, carri, imbarcazioni | 🔵 Sprint futuro — nuovo pack witcher-transports |

### Mappatura TXT → Pack (Tomo del Caos) — PARZIALE
| Pack Foundry | File TXT sorgente | Pagine manuale | Stato |
|---|---|---|---|
| witcher-special-chaos | Pag119_Oggetti Magici.txt + Pag125_Acquistare Oggetti Magici.txt | 119–128 | 🟡 Da verificare |
| witcher-components (chaos) | Pag212_Componenti e Mutageni.txt | 212+ | 🟡 Da verificare |

### Pagine manuale di riferimento (fonte: NotebookLM, 9 Apr 2026)
| Sezione | Pagine |
|---|---|
| Armi | 72–77 (tabelle 72–74, descrizioni 74–77) |
| Armature | 78–82 (tabelle 78–80, effetti 81–82) |
| Oggetti Vari / Equipaggiamento | 71, 93–97 |
| Equipaggiamento da Witcher | 246–250 (capitolo Witcher inizia p.237) |
| Trasporti | 93 (Tomo Base) |

---

## 3. WORKFLOW OPERATIVO

### Ciclo di lavoro per ogni pack
1. **Perplexity** prepara Brief Audit → consegnato a Manuel
2. **Manuel** passa brief ad Antigravity
3. **Antigravity** esegue audit (confronto TXT sorgente vs pack attuale)
4. **Antigravity** produce report: voci presenti ✅ / mancanti ❌ / errate ⚠️
5. **Manuel** consegna report a Perplexity
6. **Perplexity** analizza, interroga NotebookLM se necessario, prepara Brief Fix
7. **Manuel** passa Brief Fix ad Antigravity
8. **Antigravity** implementa fix, produce JSON aggiornato
9. **Manuel** valida in Foundry, conferma o segnala anomalie
10. Loop fino a ✅ 100%

### Formato output Antigravity atteso
Per ogni audit: `audit-[packname]-[data].md`
Per ogni fix: commit su repo + bump versione modulo

---

## 4. SPRINT LOG — 9 APRILE 2026

### 10:19 — Sessione aperta
- Caricati file: OMNIBUS v6.0, Report Cartelle 8apr2026
- Recap stato: v14.1.22, struttura cartelle completata, prossime priorità = audit contenuti

### 10:23 — Scope definito
- Obiettivo: compendio 100% completo e accurato
- Metodo: TXT sorgente + NotebookLM + Antigravity
- Ruoli del team definiti (Manuel manager, Perplexity strategist, Antigravity builder)

### 10:27 — Scope equipaggiamento confermato
- Razze e Professioni: standby
- Focus: tutta l'oggettistica ed equipaggiamento (8 pack)
- Antigravity gestito da Perplexity come tramite

### 10:28 — File sorgente acquisiti
- Ricevuti: Report_EstrazioneTomoBase.txt (150.233 char) e Report_EstrazioneTomoCaos-2.txt (23.456 char)
- Analisi: sono indici di estrazione PDF con lista immagini + lista TXT per sezione

### 10:30 — Pagine manuale ottenute da NotebookLM
- Query: range pagine per Armi, Armature, Oggetti Vari, Equipaggiamento Witcher
- Risposta ricevuta e documentata (vedi sezione 2)

### 10:33 — Nomi file TXT verificati da Antigravity
- Comando PowerShell eseguito su cartella di progetto
- Risultato: 9 file TXT rilevanti identificati (vedi mappatura sezione 2)
- Scoperto: Pag093_Trasporti.txt → decisione: sprint dedicato futuro

### 10:35 — Decisione Trasporti
- I Trasporti saranno un nuovo pack witcher-transports da creare in sprint separato
- Prima si completa e verifica tutto l'equipaggiamento esistente

### 10:35 — Brief #1 inviato ad Antigravity
**Obiettivo:** Audit pack witcher-weapons + witcher-armor
**Comandi richiesti:**
  - Lista voci src-packs witcher-weapons e witcher-armor
  - Lettura Pag074_Armi.txt e Pag080_Armature.txt
**Output atteso:** audit-weapons-armor-9apr2026.md
**Stato:** 🟡 IN ATTESA RISPOSTA ANTIGRAVITY

---

## 5. DECISIONI ARCHITETTURALI PRESE

| Decisione | Motivazione | Data |
|---|---|---|
| Trasporti → sprint separato | Non interrompere il flusso dell'equipaggiamento esistente | 9 Apr 2026 |
| Razze/Professioni in standby | Focus su oggettistica prima | 9 Apr 2026 |
| TXT come fonte primaria | Dati originali dal PDF, massima accuratezza | 9 Apr 2026 |
| NotebookLM come consulente pagine | Velocità nel trovare range pagine senza sfogliare manuale | 9 Apr 2026 |

---

## 6. PROSSIME AZIONI (coda prioritizzata)

| # | Azione | Responsabile | Dipendenza | Stato |
|---|---|---|---|---|
| 1 | Ricevere audit-weapons-armor da Antigravity | Manuel | Brief #1 inviato | 🟡 ATTESA |
| 2 | Analisi audit e Brief Fix #1 (Armi+Armature) | Perplexity | Output step 1 | ⏳ |
| 3 | Fix pack witcher-weapons + witcher-armor | Antigravity | Brief Fix #1 | ⏳ |
| 4 | Audit pack witcher-equipment | Antigravity | Brief #2 da preparare | ⏳ |
| 5 | Audit pack witcher-special | Antigravity | Brief #3 da preparare | ⏳ |
| 6 | Audit pack witcher-special-chaos | Antigravity | Brief #4 da preparare | ⏳ |
| 7 | Audit componenti/schemi/alchimia | Antigravity | Brief #5 da preparare | ⏳ |
| 8 | Sprint Trasporti — nuovo pack | Team | Tutto l'equipaggiamento ✅ | 🔵 FUTURO |
| 9 | Bump versione e release finale | Manuel | Tutti i fix ✅ | 🔵 FUTURO |

---

## 7. METRICHE TARGET

| Metrica | Valore attuale | Target |
|---|---|---|
| Completezza entries equipaggiamento | Sconosciuta | 100% |
| Descrizioni presenti | ~93.8% (stimato) | 100% |
| Voci errate/incongruenti | Sconosciute | 0 |
| Pack equipaggiamento verificati | 0/8 | 8/8 |
| Versione modulo al termine sprint | v14.1.22 | v14.2.x |

---

*Documento generato da Perplexity il 9 Aprile 2026 — da allegare all'Omnibus Master v7.0*
*Aggiornare questo documento a ogni iterazione del ciclo di lavoro.*


---
## AGGIORNAMENTO LOG — 11:54

### 11:54 — TASK 1 e TASK 2 completati da Antigravity

#### TASK 1 — Correzione descrizioni weapons + armor ✅
- Script eseguito: fix-descriptions-weapons-armor.js
- 35 armi aggiornate con testi Rodolf Kazmer in <p>...</p>
- 35 armature aggiornate con testi Rodolf Kazmer in <p>...</p>
- Tutte le descrizioni corrotte (OCR errato, testi estranei come "chiese e preti" nel Gambesone) sostituite

#### TASK 2 — 9 JSON munizioni create ✅
File creati in _tools/src-packs/witcher-weapons/:
- Munizioni Normali (10c, piercing, MB 74)
- Munizioni Smussate (5c, bludgeoning, MB 74)
- Munizioni Punta Larga (10c, piercing, MB 74)
- Munizioni Bodkin (15c, piercing, MB 74)
- Munizioni Multiple (54c, piercing, MB 256)
- Munizioni Traccianti (22c, piercing, MB 256)
- Munizioni Esplosive (108c, elemental, MB 256)
- Sventratrici Elfiche (50c, piercing, MB 86)
- Impatto Naniche (50c, piercing, MB 86)

Struttura JSON usata (flat, coerente col sistema):
{
  "type": "weapon",
  "system": {
    "description": "<p>...</p>",
    "weight": 0.1,
    "cost": [valore],
    "quantity": 10,
    "isAmmo": true,
    "type": { "text": "Munizione", "[tipo]": true },
    "sourcebook": "MB [pagina]"
  }
}

Stato: PRONTO — nessun commit ancora, in attesa revisione Manuel

---

### Metriche aggiornate pack weapons/armor
| Pack | Entries | Descrizioni | Stato |
|---|---|---|---|
| witcher-weapons | 44 (35+9 munizioni) | 100% | 🟡 IN REVISIONE |
| witcher-armor | 35 | 100% | 🟡 IN REVISIONE |

---

### 11:54 — Prossima azione
- Manuel: revisione campione in Foundry (Spada Lunga, Arco Lungo, Gambesone, 1 munizione)
- Se OK: commit + Brief Audit #2 witcher-equipment
- Query NotebookLM preparata per witcher-equipment:
  "Quali oggetti vari e utensili sono elencati nelle pagine 71, 93-97 del Tomo Base? Lista completa con nome, costo, categoria."

---
## AGGIORNAMENTO LOG — 12:12 → 14:41

### 12:12 — Problema test Foundry: nessuna modifica visibile
- Causa identificata: Manuel usa manifest remoto (URL GitHub), non copia fisica locale
- Foundry scarica il ZIP dalla release GitHub — la build locale non è sufficiente
- Serve nuova release GitHub con ZIP aggiornato per rendere visibili le modifiche

### 13:39 — Build LevelDB eseguita da Antigravity (confermata)
- rebuild_leveldb.js eseguito DOPO tutte le modifiche JSON
- witcher-weapons: timestamp build 13:39:10 ✅
- witcher-armor: timestamp build 13:39:07 ✅
- module.json aggiornato a v14.1.25: timestamp 13:41:05 ✅

### 14:18 — Diagnosi deploy chiarita
Flusso corretto con manifest remoto:
  src-packs (locale) → build LevelDB → ZIP release GitHub → Foundry scarica e installa
Antigravity aveva completato build e bump versione ma mancava la release GitHub.

### 14:21 — Brief release GitHub inviato ad Antigravity
Step richiesti:
  1. git add . + git commit -m "fix: descrizioni weapons/armor, 9 munizioni - v14.1.25" + git push
  2. Crea ZIP witcher-compendium-v14.1.25.zip
  3. Pubblica release GitHub con tag v14.1.25 e ZIP allegato
  4. Verifica campo "download" in module.json punta al nuovo ZIP

### 14:22 — Manuel ha avviato commit e push su Antigravity
- Stato: 🟡 IN ATTESA conferma push + release GitHub

### 14:41 — Stato attuale
- Build: ✅ Completata (13:39)
- Versione module.json: ✅ v14.1.25
- Commit/Push: 🟡 In corso
- Release GitHub v14.1.25: 🟡 In attesa
- Test Foundry: ⏳ Dopo release
- Alternativa disponibile: copia manuale cartella witcher-compendium in Data/modules/ per test immediato senza GitHub

---

## METRICHE AGGIORNATE — 9 Aprile 2026 ore 14:41

| Pack | Entries | Descrizioni | Stato |
|---|---|---|---|
| witcher-weapons | 44 (35 armi + 9 munizioni) | 100% ✅ | 🟡 IN DEPLOY |
| witcher-armor | 35 | 100% ✅ | 🟡 IN DEPLOY |
| witcher-equipment | 36 | Da verificare | ⏳ Audit #2 pending |
| witcher-special | 20 | Da verificare | ⏳ Audit #3 pending |
| witcher-special-chaos | 53 | Da verificare | ⏳ Audit #4 pending |
| witcher-components | 46 | Da verificare | ⏳ Audit #5 pending |
| witcher-schematics | 120 | Da verificare | ⏳ Audit #5 pending |
| witcher-alchemy | 90 | Da verificare | ⏳ Audit #5 pending |

Pack verificati al 100%: 0/8 (in attesa conferma test Foundry)
Pack con fix applicati e in deploy: 2/8

---

## LEZIONI APPRESE — sessione 9 Aprile

| Problema | Causa | Soluzione |
|---|---|---|
| Modifiche non visibili in Foundry | Manifest remoto punta a release GitHub, non a file locali | Creare sempre nuova release GitHub dopo build |
| weaponType non esiste nel sistema | Il sistema usa system.type con booleani, non stringa weaponType | Verificare SEMPRE struttura JSON esistente prima di creare nuovi campi |
| Crash Antigravity mid-session | Tool instabile su sessioni lunghe | Tenere sempre brief di ripristino aggiornato e pronto |
| Versione module.json retrocessa nel brief | Perplexity non aveva tracking preciso della versione corrente | Chiedere SEMPRE ad Antigravity la versione corrente prima di fare bump |
| Build output in path sbagliato | rebuild_leveldb.js scrive in root /packs/, module.json si aspetta sottocartelle | Verificare path destinazione build prima di eseguire |
