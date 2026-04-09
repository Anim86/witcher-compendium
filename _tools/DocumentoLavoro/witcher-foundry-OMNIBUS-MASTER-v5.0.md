# THE WITCHER RPG — FOUNDRY VTT COMPENDIO
## Documento Master Omnibus v5.0 — Storico Completo

**Versione:** v5.0  
**Data:** 7 Aprile 2026  
**Stato:** DOCUMENTO STORICO UNIFICATO — Contiene TUTTO il lavoro svolto dalla v2.1 alla v4.0 / v14.1.2  
**Compilato da:** Perplexity (Strategist) su incarico di Manuel (Team Manager)

---

## 1. VISIONE E OBIETTIVI DEL PROGETTO

Creazione di un **modulo compendio completo** e di un **sistema di supporto** per The Witcher TRPG su Foundry VTT, localizzato in italiano e basato sui manuali **Tomo Base** e **Tomo del Caos**.

L'obiettivo finale è una creazione del personaggio **fluida, automatizzata e visivamente premium**, con un wizard a 7 step che guida il giocatore dalla scelta della razza fino alla generazione dell'Actor nel mondo.

### Team di Lavoro

| Membro | Ruolo | Responsabilità |
|---|---|---|
| **Manuel** | Team Manager | Approvazione, Validazione, Deploy Finale |
| **Perplexity** | Strategist / Prompt Designer | Analisi log, documentazione unificata |
| **Antigravity** | Builder / Integratore | Sviluppo Wizard, Scripting, Fix Tecnici |

---

## 2. CRONOLOGIA EVOLUTIVA COMPLETA — LOG STORICO INTEGRALE

### FASE 0 — Pre-progetto: Contesto e Setup Iniziale

Il progetto nasce dall'esigenza di portare The Witcher TRPG su Foundry VTT in modo completo e in italiano, partendo dai raw JSON dei manuali originali. Il sistema base di riferimento è **TheWitcherTRPG** (poi fork italiano **TheWitcherIta**). Il modulo compendio viene battezzato **`witcher-compendium`**.

---

### FASE 1 — Estrazione e Conversione Tomo Base (v1.0)
**Data:** 1 Aprile 2026

**Attività svolte:**
- Parsing di oltre **500 record** dai raw JSON del Tomo Base
- Creazione dei **primi 10 pack**: Armi, Armature, Oggetti, Magia, Rituali, Componenti, Schemi, Alchimia, Oggetti Witcher, Bestiario Base
- Implementazione degli **UUID univoci a 16 caratteri** per ogni entry
- Associazione immagini al **93.8%** delle entries del Tomo Base
- Formato file: **NeDB `.db`** (Foundry VTT v13)

**Risultato:**
- 516 entries dal Tomo Base, 93.8% con immagini
- 10 pack NeDB creati e funzionanti

---

### FASE 2 — Tomo del Caos, Refinement e Release v1.0.0 (v2.0 → v2.2)
**Data:** 1 Aprile 2026 (pomeriggio) → 1 Aprile 2026 (sera/notte)

**Attività svolte:**
- Integrazione di **158 voci** dal Tomo del Caos (nuovi 4 pack: Incantesimi Chaos, Rituali Chaos, Oggetti Chaos, Bestiario Chaos)
- **Refinement A:** Elaborazione di **151 descrizioni Fluff** con testo narrativo e HTML professionale (`<p>`, `<blockquote>`, tabelle). Testo recuperato da sorgenti TXT, watermark OCR rimosso, pulizia completa. Output: `report-chaos-descriptions.md`
- **Refinement B:** Revisione **Bestiario completo — 26 mostri** (Base + Chaos). Attributi tradotti IT→EN (`rif/ref`, `fis/body`, `man/cra`). Calcolo statistiche derivate: `health`, `stamina`, `vigor`, `recovery`, `resolve`. Capacità speciali degli Actor completate. Fix manuale su Katakan (INT 5, RIF 10, DES 10). Output: `report-bestiary-fix.md`
- **Audit Finale (v2.2):**
  - ID Validati: **100% univoci e conformi (16 caratteri)**
  - Integrità Dati: **0 errori bloccanti**, JSON compatibili con Foundry VTT v13
  - Copertura Asset: **76.6%** complessiva, percorsi verificati
  - Bestiario: **100%** dei mostri con attributi in inglese e statistiche derivate attive
- **Deploy v1.0.0** in Foundry VTT v13: modulo presente, sezioni popolate, import operativo

**Asset finali generati:**
- `module.json` definitivo con 14 pack NeDB registrati
- `audit-finale.md` con statistiche complete di produzione
- `deploy-instructions.md` per installazione manuale
- `final-check.js` incluso nel modulo per verifiche future

**Totale compendio al 1 Aprile sera:** 674 entries, ~95% con immagini reali, 14 pack NeDB `.db`

---

### FASE 3 — Issue Post-Deploy, Razze/Professioni e Crisi della Scheda (v2.3 → v2.4)
**Data:** 2 Aprile 2026

#### Issue emerse nel collaudo manuale post-deploy v1.0.0:

**1. Descrizioni mancanti (PRIORITÀ IMMEDIATA)**
Durante il test in Foundry è emerso che alcune descrizioni risultano ancora mancanti, in particolare nelle voci del Tomo del Caos (incantesimi, item, rituali). Decisione operativa: eseguire un controllo completo di **tutto** il compendio per verificare:
- Presenza del campo descrizione
- Corretta renderizzazione HTML
- Consistenza tra sorgente e voce importata in Foundry

**2. Revisione naming tomi (PRIORITÀ IMMEDIATA)**
Aggiornare la nomenclatura dei pack e delle label utente:
- "Manuale Base" al posto di "Tomo Base" (lato interfaccia)
- "Tomo del Caos" al posto di "Chaos"
Obiettivo: uniformare i nomi mostrati all'utente finale nel compendio.

**3. Warning console su Application V1 (PRIORITÀ ALTA)**
Alla apertura di una voce dal compendio compare in console:
```
The V1 Application framework is deprecated
```
Origine stack: `WitcherActorSheetV1.js`, `WitcherMonsterSheet.js`
- **Non blocca** l'import né la consultazione
- Deprecazione del sistema TheWitcherTRPG — sheet actor legacy ancora basata su `Application/FormApplication V1`
- **Rischio futuro:** compatibilità potenzialmente critica da Foundry V16 in poi

#### Sprint RazzeClassi (URGENTE):

**Crisi della Scheda PG:**
Un aggiornamento della scheda PG aveva causato la rottura dell'interfaccia. Fix critico: ripristino della scheda originale e implementazione del **solo Drag & Drop** (no override della sheet).

**Fix Critici Razze/Professioni eseguiti:**
- Rimozione razze non giocabili: **Vran, Bobolak** — rimangono solo: **Umano, Elfo, Nano, Witcher, Gnomo, Halfling**
- Registrazione di `witcher-races` e `witcher-professions` in `module.json`
- Allineamento naming al pattern **`witcher-*`**
- Ordine pack: **Razze e Professioni PRIME** nell'ordine compendio
- Aggiunta di 26 entries (razze + professioni): totale compendio sale a **700 entries**

**Stato al 2 Aprile 2026 (v2.4):**
- 700 entries totali, 95% copertura immagini, **16 pack NeDB**
- Sprint RazzeClassi: REVISIONE CRITICA PENDING → Fix assegnato ad Antigravity

---

### FASE 4 — Migrazione Foundry v14 e Character Wizard (v3.0 → v14.0.6)
**Data:** 6–7 Aprile 2026

#### Migrazione a Foundry VTT v14:
- Aggiornamento `system.json` e `module.json` per compatibilità v14
- Conversione database: **NeDB `.db` → ClassicLevel** (formato richiesto da Foundry v14)
- Aggiornamento delle ApplicationV2 (Foundry v14 richiede gestione precisa dei `parts` e dei selettori per lo scroll)
- Encoding: UTF-8 obbligatorio e forzato ovunque
- Manifest: il numero di versione nel manifest deve essere incrementato per forzare l'aggiornamento di Foundry (il pull locale non basta se il sistema è installato via URL)

#### Sviluppo Character Creation Wizard v1.x → v14.0.6:

**Architettura a 7 Step:**

| Step | Contenuto | Logica |
|---|---|---|
| 1. Razza | Selezione razza giocabile | Applicazione automatica di modificatori e perk |
| 2. Background | Origine, Famiglia, Eventi della Vita | Roll automatici con tabelle |
| 3. Professione | Selezione classe | Pre-caricamento abilità professionali predefinite |
| 4. Statistiche | Distribuzione pool di 60 punti | Anteprima derivate: HP, STA, REC, STUN, RUN, LEAP, ENC |
| 5. Abilità | Allocazione punti | Pool Professionale (44 fisso) + Pick-up (INT+REF); abilità Difficili costano 2 punti per rango |
| 6. Equipaggiamento | Dotazione Professionale automatica + acquisto | Selezione da pack compendio, impostazione Corone iniziali |
| 7. Finalizzazione | Nome, avatar, riepilogo acquisti | Creazione Actor nel mondo |

**Logica Step 5 — Abilità (dettaglio):**
- **Pool Professionale:** 44 punti fissi, obbligatori per le abilità di classe
- **Pool Pick-up:** calcolato da INT + REF del personaggio
- **Costi Abilità Difficili:** consumano **2 punti per rango** (invece di 1)
- Separazione netta tra i due pool visualizzata nell'interfaccia

---

### FASE 5 — Polishing, Fix Contrasto e Versione Finale (v14.0.6 → v14.1.2)
**Data:** 7 Aprile 2026

#### Ristrutturazione Wizard 7 Step (v14.0.6 → v14.0.9):
- Eliminato lo step "Riepilogo Avanzato" per ridurre la ridondanza
- Step 6 Equipaggiamento: integrata la **Dotazione Professionale automatica** della classe
- Step 7 Finalizzazione: spostato qui il riepilogo degli acquisti finali
- Localizzazione completa Step 7 in `lang/it.json`
- **Money System:** aggiunto campo editabile per Corone Iniziali nello Step 6

#### Raffinamenti Estetici (Aesthetic & Contrast):
- **Fix Contrasto CSS:** risolto il conflitto di selettori CSS — i punti rimanenti (Step 4) e le capsule statistiche (Step 7) sono ora **BIANCHI su fondo rosso**
- Etichette Step 2 e Step 4 impostate su `#444` per contrasto premium
- **Sfondo Premium:** integrato l'asset `Pag021_La Vita di un Mago_02.png` dal Tomo del Caos
- Opacità `.wizard-content` aumentata a **0.98** per garantire leggibilità assoluta del testo nero su background pergamena
- **Glassmorphism:** effetto sfocatura (`backdrop-filter: blur`) sui riquadri per massima leggibilità su sfondi complessi

#### Bug Fix Critici:
- **Scroll Persistence:** risolto il bug che resettava lo scroll al top dopo ogni click. La posizione dello scroll viene ora preservata tra un render e l'altro
- **Template not found (Step 7):** risolto tramite pre-caricamento del partial in `handlebars.js`
- Pulizia degli errori 404 in console relativi ad asset mancanti

#### Refactoring Strutturale (v14.1.x):
- Aggiornamento selettori CSS per compatibilità con ApplicationV2 di Foundry v14
- Fix asset path e struttura cartelle
- Localizzazione `lang/it.json` con supporto completo a Step 7 e Money System

**Stato finale al 7 Aprile 2026 (v14.1.2):**
- Sistema TheWitcherIta: **v14.1.2** — PRONTO PER DEPLOY FINALE
- Wizard 7 step: **funzionante**, UI premium, localizzato
- Modulo compendio: compatibile v14, asset 100% Tomo del Caos

---

## 3. STATO COMPONENTI ATTUALI (7 Aprile 2026)

| Componente | Versione | Stato | Note |
|---|---|---|---|
| Foundry VTT | v14.x | Compatibile | Migrazione v14 completata |
| Sistema Base | TheWitcherIta v14.1.2 | ✅ PRONTO | Fix contrasto e selettori CSS |
| Modulo Compendio | witcher-compendium v14.1.2 | ✅ Asset 100% | Tomo del Caos completo |
| Character Wizard | v14.1.2 | ✅ Funzionante | 7 Step, Dotazione Professionale |
| Database | ClassicLevel (.db) | ✅ Migrato | Da NeDB per v14 |

---

## 4. STRUTTURA COMPLETA DEL COMPENDIO — 16 PACK

### Tabella Pack Definitivi

| Pack | Label | Type | Entries | Img% | Note |
|---|---|---|---|---|---|
| `witcher-races` | Razze | Actor | 6 | 93–100% | Prima nell'ordine |
| `witcher-professions` | Professioni | Item | 11 | 93–100% | Seconda nell'ordine |
| `witcher-weapons` | Armi | Item | 35 | 93.8% | Tomo Base |
| `witcher-armor` | Armature | Item | 33 | 93.8% | Tomo Base |
| `witcher-equipment` | Oggetti Vari | Item | 36 | 93.8% | Tomo Base |
| `witcher-spells` | Incantesimi Base | Item | 101 | 93.8% | Tomo Base |
| `witcher-rituals` | Rituali Base | Item | 15 | 93.8% | Tomo Base |
| `witcher-components` | Componenti | Item | 46 | 93.8% | Tomo Base |
| `witcher-schematics` | Schemi | Item | 120 | 93.8% | Tomo Base |
| `witcher-alchemy` | Alchimia | Item | 90 | 93.8% | Tomo Base |
| `witcher-special` | Oggetti Witcher | Item | 20 | 93.8% | Tomo Base |
| `witcher-monsters` | Bestiario Base | Actor | 19 | 93.8% | REFINE OK |
| `witcher-spells-chaos` | Incantesimi Chaos | Item | 82 | 100% | FLUFF OK |
| `witcher-rituals-chaos` | Rituali Chaos | Item | 16 | 100% | FLUFF OK |
| `witcher-special-chaos` | Oggetti Chaos | Item | 53 | 100% | FLUFF OK |
| `witcher-monsters-chaos` | Bestiario Chaos | Actor | 7 | 100% | REFINE OK |

**Totale entries:** ~700 | **Pack totali:** 16 | **Copertura immagini media:** ~95%

### Razze Giocabili (6 canoniche)

`Umano` · `Elfo` · `Nano` · `Witcher` · `Gnomo` · `Halfling`

*(Escluse: Vran, Bobolak — non giocabili nel canone)*

### Professioni (11 classi)

Tutte e 11 le classi del Manuale Base sono registrate nel pack `witcher-professions`.

---

## 5. SPECIFICHE TECNICHE E CONVENZIONI

### Struttura Modulo `witcher-compendium`

```
witcher-compendium/
├── module.json            ← Manifest con 16 pack registrati
├── packs/                 ← Database ClassicLevel (.db) per v14
├── assets/
│   ├── wizard/
│   │   └── bg/mago.png   ← Sfondo premium wizard
│   └── [immagini pack]
├── lang/
│   └── it.json           ← Localizzazione completa IT (incl. Step 7 + Money)
├── scripts/
│   └── handlebars.js     ← Pre-caricamento partial wizard
└── templates/
    └── wizard/           ← Template HBS per 7 step
```

### Mappatura Campi Critici (Raw JSON → Foundry)

| Campo Raw | Destinazione Foundry | Nota |
|---|---|---|
| `stoppingPower` | `system.stoppingPower` | Solo armature |
| `reliability` | `system.reliability` | Armi + Armature |
| `cost` | `system.cost.value` | In Corone |
| `effect` | `system.description.value` | HTML pulito |

### Convenzioni UUID

- Lunghezza: **16 caratteri** esatti
- Univocità: **100%** verificata da `validate-ids.js`
- Nessun duplicato su 700+ entries

### Encoding

- **UTF-8 obbligatorio** e forzato su tutti i parser
- Vitale per i caratteri speciali italiani (à, è, ì, ò, ù)

### Naming Pattern

Tutti i pack devono seguire il pattern **`witcher-[tipo]`** (es. `witcher-weapons`, `witcher-spells-chaos`)

### Database

| Versione Foundry | Formato DB |
|---|---|
| v13 | NeDB `.db` |
| v14 | ClassicLevel (compatibile con ClassicLevel API) |

---

## 6. SCRIPT DI MANUTENZIONE

Tutti generati da Antigravity, inclusi nel modulo:

| Script | Funzione |
|---|---|
| `audit.js` | Controllo duplicati e anomalie su tutte le entries |
| `final-check.js` | Verifica pre-build completa |
| `validate-ids.js` | Controllo UUID — tutti 16 caratteri, tutti univoci |
| `map-images.js` | Associazione automatica immagini alle entries |

---

## 7. PROTOCOLLO DI DEPLOY E AGGIORNAMENTO

### Procedura Standard (Foundry v14)

```bash
# 1. SINCRONIZZAZIONE REPOSITORY
git pull  # aggiorna il repository locale

# 2. VERIFICA system.json / module.json
# Controllare: versione corrente, compatibilità v14, 16 pack registrati

# 3. DEPLOY MODULO
cp -r witcher-compendium /Data/modules/witcher-compendium

# 4. AVVIO FOUNDRY
# - CHIUDI Foundry completamente
# - Verifica module.json: 16 pack, ordine corretto (races + professions PRIME)
# - RIAVVIA Foundry VTT
# - Setup → Systems → Check for Update su "The Witcher TRPG"
# - In alternativa: Setup → Check for Update per forzare download via Manifest URL
# - Crea Nuovo Mondo TheWitcherTRPG system
# - Manage Modules → Abilita witcher-compendium
```

### Test Obbligatori Post-Deploy

1. Importa 1 Arma da `witcher-weapons` → verifica campi
2. Importa 1 Mostro Chaos da `witcher-monsters-chaos` → verifica stats
3. Importa 1 Incantesimo Chaos da `witcher-spells-chaos` → verifica descrizione HTML
4. Drag Razza (Actor) → verifica bonus/perk applicati al PG
5. Drag Professione (Item) → verifica skills caricate correttamente
6. Console F12 → **ZERO errori bloccanti**
7. Source Book visibile dove previsto

### Manifest vs. Pull — Regola Critica

> Se il sistema è installato tramite URL manifest, cambiare i file locali **non basta**. È obbligatorio incrementare il numero di versione nel `system.json` per forzare l'aggiornamento di Foundry.

---

## 8. LEZIONI APPRESE E GOTCHA

### Gotcha Tecnici Documentati

| Problema | Causa | Soluzione |
|---|---|---|
| Scroll che resetta al top | Render ApplicationV2 che non preserva lo stato | `scroll memory` — salvare e ripristinare `scrollTop` tra i render |
| Template not found (Step 7) | Partial handlebars non pre-caricato | Pre-caricare tutti i partial in `handlebars.js` all'init |
| Caractteri speciali IT corrotti | Parser senza encoding esplicito | Forzare sempre `UTF-8` in tutti i parser |
| Foundry non aggiorna il modulo | Cambio file locale senza bump versione | Incrementare `version` in `module.json` / `system.json` |
| Conflitto selettori CSS contrasto | Più regole CSS con specificità simile | Aumentare specificità del selettore o usare `!important` mirati |
| Scheda PG rotta | Override troppo invasivo della sheet | Tornare alla sheet originale, usare solo Drag & Drop |
| Razze non canoniche | Dati grezzi includevano razze non giocabili | Filtrare a monte: solo Umano, Elfo, Nano, Witcher, Gnomo, Halfling |
| Warning ApplicationV1 | Sistema TheWitcherTRPG legacy su `Application/FormApplication` | Non bloccante ora; da monitorare verso Foundry v16 |
| Pack non visibili in Foundry | Pack non registrati in `module.json` | Registrare ogni pack nel manifest prima del deploy |

### Compatibilità e Rischi Futuri

- **Foundry v14:** Richiede gestione precisa dei `parts` e dei selettori per lo scroll con ApplicationV2.
- **Foundry v16 (futuro):** Il sistema TheWitcherTRPG con sheet legacy `ApplicationV1` potrebbe perdere compatibilità. Da monitorare.
- **ClassicLevel:** Il formato DB per v14 è stabile ma richiede migrazione esplicita da NeDB.

---

## 9. ISSUE APERTE E ROADMAP (al 7 Aprile 2026)

### Task Aperti per Priorità

| Priorità | Attività | Responsabile | Stato |
|---|---|---|---|
| 🔴 IMMEDIATA | Audit contenuti completo — descrizioni mancanti nel compendio | Perplexity + Manuel | DA AVVIARE |
| 🔴 IMMEDIATA | Revisione naming: "Manuale Base" / "Tomo del Caos" lato interfaccia | Perplexity | DA AVVIARE |
| 🟠 ALTA | Isolamento warning V1 — capire se dipende dal sistema o da override del modulo | Antigravity + Manuel | DA ANALIZZARE |
| 🟡 MEDIA | Sprint Polish — fix UI/Drag&Drop minori | Antigravity | PENDING |
| 🟢 BASSA | Sprint Docs — Walkthrough manuale utente | Perplexity | FUTURO |
| 🟢 BASSA | Fix compatibilità sheet V2 (ApplicationV2 completo) | Antigravity | FUTURO |

### Roadmap Operativa Suggerita

```
1. Audit descrizioni mancanti → compendio completo (tutte le entries)
2. Revisione naming tomi → interfaccia localizzata e coerente
3. Analisi warning V1 → isolare origine (sistema o modulo)
4. Polish UI → fix minori drag & drop, colori, icone
5. Manuale utente → walkthrough installazione e uso
6. (Futuro) Migrazione sheet V2 → compatibilità Foundry v16+
```

---

## 10. STATO SPRINT STORICO COMPLETO

| Sprint | Contenuto | Priorità | Stato |
|---|---|---|---|
| Sprint 1 | Conversione Tomo Base — 515/516 entries | IMMEDIATO | ✅ COMPLETATO |
| Sprint IMG | Associazione immagini Tomo Base — 93.8% | IMMEDIATO | ✅ COMPLETATO |
| Sprint 2 | Tomo del Caos — 158 entries, 100% img | ALTO | ✅ COMPLETATO |
| Refinement A | Descrizioni Chaos — 151 voci fix + fluff | ALTO | ✅ COMPLETATO |
| Refinement B | Bestiario completo — 26 mostri | ALTO | ✅ COMPLETATO |
| Sprint Audit | Audit finale 16 pack + module.json | IMMEDIATO | ✅ COMPLETATO |
| Sprint Deploy | Test import Foundry — console zero errori | ALTO | ✅ COMPLETATO (v13) |
| Sprint RazzeClassi | Razze 6 giocabili + Professioni 11 | URGENTE | ✅ COMPLETATO |
| Migrazione v14 | NeDB → ClassicLevel, manifest, ApplicationV2 | CRITICO | ✅ COMPLETATO |
| Wizard v1.x | Tool creazione PG 7 step | ALTO | ✅ COMPLETATO |
| Polish Wizard | Fix contrasto, scroll, sfondo, localizzazione | MEDIO | ✅ COMPLETATO |
| Deploy v14.1.2 | Sistema pronto, fix contrasto struttura | IMMEDIATO | ✅ PRONTO |
| Audit Descrizioni | Verifica completa descrizioni compendio | IMMEDIATA | 🔴 DA AVVIARE |
| Revisione Naming | "Manuale Base" / "Tomo del Caos" UI | IMMEDIATA | 🔴 DA AVVIARE |
| Analisi Warning V1 | Isolamento ApplicationV1 deprecata | ALTA | 🟠 DA ANALIZZARE |
| Sprint Polish | Fix minori UI/DragDrop | MEDIA | 🟡 PENDING |
| Sprint Docs | Manuale utente walkthrough | BASSA | 🟢 FUTURO |

---

## 11. METRICHE DI PRODUZIONE FINALI

| Metrica | Valore |
|---|---|
| Entries totali | ~700 |
| Pack totali | 16 |
| Copertura immagini (Tomo Base) | 93.8% |
| Copertura immagini (Tomo del Caos) | 100% |
| Copertura immagini complessiva | ~95% |
| UUID univoci e conformi | 100% |
| Errori bloccanti JSON | 0 |
| Mostri con attributi EN e stats derivate | 100% (26/26) |
| Pack NeDB → ClassicLevel migrati | 16/16 |
| Step Wizard completati e localizzati | 7/7 |

---

*Documento Omnibus v5.0 — Compilato il 7 Aprile 2026 da Perplexity per Manuel.*  
*Contiene l'integrale storico di: v2.1 (1 Apr), v2.2 (1 Apr), v2.4 (2 Apr), v3.1 (7 Apr), v4.0 (7 Apr).*
