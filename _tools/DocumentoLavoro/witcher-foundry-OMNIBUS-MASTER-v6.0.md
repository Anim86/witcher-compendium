# THE WITCHER FOUNDRY OMNIBUS MASTER v6.0
> [!IMPORTANT]
> **COMPATIBILITÀ**: [Foundry VTT Stable 14 build 361](https://foundryvtt.com/releases/14.361)

Documento Master Omnibus v6.0 — Storico Completo

Versione: v6.0

Data: 7 Aprile 2026 (pomeriggio)

Stato: DOCUMENTO STORICO UNIFICATO — Contiene TUTTO il lavoro svolto dalla v2.1 alla v14.1.5 / Wizard Polish Sprint

Compilato da: Perplexity (Strategist) su incarico di Manuel (Team Manager)



1\. VISIONE E OBIETTIVI DEL PROGETTO

Creazione di un modulo compendio completo e di un sistema di supporto per The Witcher TRPG su Foundry VTT, localizzato in italiano e basato sui manuali Tomo Base e Tomo del Caos.



L'obiettivo finale è una creazione del personaggio fluida, automatizzata e visivamente premium, con un wizard a 7 step che guida il giocatore dalla scelta della razza fino alla generazione dell'Actor nel mondo.



Team di Lavoro

Membro	Ruolo	Responsabilità

Manuel	Team Manager	Approvazione, Validazione, Deploy Finale

Perplexity	Strategist / Prompt Designer	Analisi log, documentazione unificata

Antigravity	Builder / Integratore	Sviluppo Wizard, Scripting, Fix Tecnici

2\. CRONOLOGIA EVOLUTIVA COMPLETA — LOG STORICO INTEGRALE

FASE 0 — Pre-progetto: Contesto e Setup Iniziale

Il progetto nasce dall'esigenza di portare The Witcher TRPG su Foundry VTT in modo completo e in italiano, partendo dai raw JSON dei manuali originali. Il sistema base di riferimento è TheWitcherTRPG (poi fork italiano TheWitcherIta, poi rinominato TheWitcherItaNewSystem). Il modulo compendio viene battezzato witcher-compendium.



FASE 1 — Estrazione e Conversione Tomo Base (v1.0)

Data: 1 Aprile 2026



Attività svolte:



Parsing di oltre 500 record dai raw JSON del Tomo Base



Creazione dei primi 10 pack: Armi, Armature, Oggetti, Magia, Rituali, Componenti, Schemi, Alchimia, Oggetti Witcher, Bestiario Base



Implementazione degli UUID univoci a 16 caratteri per ogni entry



Associazione immagini al 93.8% delle entries del Tomo Base



Formato file: NeDB .db (Foundry VTT v13)



Risultato:



516 entries dal Tomo Base, 93.8% con immagini



10 pack NeDB creati e funzionanti



FASE 2 — Tomo del Caos, Refinement e Release v1.0.0 (v2.0 → v2.2)

Data: 1 Aprile 2026 (pomeriggio) → 1 Aprile 2026 (sera/notte)



Attività svolte:



Integrazione di 158 voci dal Tomo del Caos (nuovi 4 pack: Incantesimi Chaos, Rituali Chaos, Oggetti Chaos, Bestiario Chaos)



Refinement A: Elaborazione di 151 descrizioni Fluff con testo narrativo e HTML professionale. Testo recuperato da sorgenti TXT, watermark OCR rimosso, pulizia completa. Output: report-chaos-descriptions.md



Refinement B: Revisione Bestiario completo — 26 mostri (Base + Chaos). Attributi tradotti IT→EN (rif/ref, fis/body, man/cra). Calcolo statistiche derivate: health, stamina, vigor, recovery, resolve. Fix manuale su Katakan (INT 5, RIF 10, DES 10). Output: report-bestiary-fix.md



Audit Finale (v2.2): ID 100% univoci, 0 errori bloccanti, Bestiario 100% con attributi EN e stats derivate



Deploy v1.0.0 in Foundry VTT v13: modulo presente, sezioni popolate, import operativo



Asset finali generati: module.json (14 pack), audit-finale.md, deploy-instructions.md, final-check.js



Totale compendio al 1 Aprile sera: 674 entries, \~95% con immagini, 14 pack NeDB .db



FASE 3 — Issue Post-Deploy, Razze/Professioni e Crisi della Scheda (v2.3 → v2.4)

Data: 2 Aprile 2026



Issue emerse:



Descrizioni mancanti nel Tomo del Caos (incantesimi, item, rituali)



Revisione naming: "Manuale Base" / "Tomo del Caos" lato interfaccia



Warning console The V1 Application framework is deprecated — non bloccante ora, rischio da Foundry v16



Crisi della Scheda PG: rottura interfaccia dopo aggiornamento. Fix: ripristino scheda originale, solo Drag \& Drop.



Fix Razze/Professioni:



Rimozione razze non giocabili (Vran, Bobolak) → rimangono: Umano, Elfo, Nano, Witcher, Gnomo, Halfling



Registrazione witcher-races e witcher-professions in module.json



Naming allineato al pattern witcher-\*



Razze e Professioni PRIME nell'ordine compendio



+26 entries → totale 700 entries, 16 pack



FASE 4 — Migrazione Foundry v14 e Character Wizard (v3.0 → v14.0.6)

Data: 6–7 Aprile 2026



Migrazione v14:



system.json e module.json aggiornati per v14



Database: NeDB .db → ClassicLevel



ApplicationV2: gestione precisa parts e selettori scroll



UTF-8 forzato ovunque



Bump versione manifest obbligatorio per forzare aggiornamento Foundry



Architettura Wizard a 7 Step:



Step	Contenuto	Logica

1\. Razza	Selezione razza giocabile	Modificatori e perk automatici

2\. Background	Origine, Famiglia, Eventi della Vita	Roll automatici con tabelle

3\. Professione	Selezione classe	Pre-caricamento abilità professionali

4\. Statistiche	Pool 60 punti	Anteprima derivate: HP, STA, REC, STUN, RUN, LEAP, ENC

5\. Abilità	Allocazione punti	Pool Professionale 44 + Pick-up INT+REF

6\. Equipaggiamento	Dotazione Professionale + acquisto	Pack compendio, Corone iniziali

7\. Finalizzazione	Nome, avatar, riepilogo	Creazione Actor nel mondo

FASE 5 — Polishing, Fix Contrasto e Versione Finale (v14.0.6 → v14.1.2)

Data: 7 Aprile 2026 (mattina)



Eliminato step "Riepilogo Avanzato" — ridondante



Step 6: Dotazione Professionale automatica integrata



Step 7: riepilogo acquisti finali



Localizzazione completa lang/it.json incl. Step 7 e Money System



Fix contrasto CSS: "Punti Rimanenti" e capsule statistiche BIANCHI su fondo rosso



Sfondo Premium: Pag021\_La Vita di un Mago\_02.png (Tomo del Caos)



Opacità .wizard-content: 0.98



Glassmorphism: backdrop-filter: blur sui riquadri



Scroll Persistence risolto



Template not found Step 7 risolto (pre-caricamento partial handlebars.js)



Stato v14.1.2: PRONTO PER DEPLOY FINALE



FASE 6 — Wizard Polish Sprint (v14.1.2 → v14.1.5)

Data: 7 Aprile 2026 (pomeriggio)



Sessione dedicata al polish approfondito del wizard. 10+ problemi identificati via test manuale. Lavoro organizzato in 3 blocchi consegnati ad Antigravity in sequenza.



Struttura Dati Documentata (nuova conoscenza acquisita)

Sistema: TheWitcherItaNewSystem



Struttura Item skill:



json

{

&#x20; "name": "Atletica",

&#x20; "type": "skill",

&#x20; "system": {

&#x20;   "attribute": "dex",

&#x20;   "value": 0,

&#x20;   "isProfession": false,

&#x20;   "isPickup": false,

&#x20;   "isLearned": false

&#x20; }

}

Pack: witcher-compendium.witcher-skills

Percorso sorgente: \_tools/src-packs/witcher-skills/



Struttura Item profession:



json

{

&#x20; "name": "Armigero",

&#x20; "type": "profession",

&#x20; "system": {

&#x20;   "professionSkills": "Scherma, Mischia, Archi, Balestre, Coraggio, Sopravvivenza, Intimidire, Eludere, Atletica, Accortezza",

&#x20;   "definingSkill": { ... },

&#x20;   "skillPath1": { ... },

&#x20;   "skillPath2": { ... },

&#x20;   "skillPath3": { ... }

&#x20; }

}

Campo chiave: system.professionSkills (stringa separata da virgola)

Pack: witcher-compendium.witcher-professions

Percorso sorgente: \_tools/src-packs/witcher-professions/



Abilità Difficili — Mappatura Ufficiale (fonte: NotebookLM + manuale)

Attributo	Abilità Difficili	Costo

INT	Bestiario, Linguaggio, Tattica	2 punti/rango

MAN (cra)	Alchimia, Costruire Trappole, Manifattura	2 punti/rango

VOL (will)	Intessere Fatture, Lanciare Incantesimi, Resistere alla Magia, Officiare Rituali	2 punti/rango

Cap massimo per abilità in creazione: 6

Pool Professionale: 44 punti fissi

Pool Pick-up: INT + REF (Step 4)

I due pool sono separati e indipendenti



Blocco A — Fix UI e CSS

Fix	Stato

Etichette barra: formato "Step 1"…"Step 7"	✅ APPLICATO

Immagine sfondo → ottimizzata in assets/wizard/bgmago.webp	✅ APPLICATO

"Punti Rimanenti:" Step 4 → #ffffff senza text-shadow	✅ APPLICATO

Schede Razza/Professione → fit-content	✅ APPLICATO

"Corone" reinserita accanto al costo Step 6	✅ APPLICATO

Blocco B — Step 5 Abilità: Rework Completo

Problema: le abilità non apparivano — il wizard non leggeva il pack witcher-skills.



Soluzione:



Caricamento tramite game.packs.get("witcher-compendium.witcher-skills").getDocuments()



Sezione 1 — Abilità Professionali: legge system.professionSkills, counter +/− compatti, pool 44 punti



Sezione 2 — Abilità Pick-up: tutte le abilità NON professionali, pool INT+REF, tab "Abilità Opzionali" collegato



Abilità Difficili marcate ×2, cap 6 per tutte



Blocco C — Step 6 Equipaggiamento: Fix Layout e Funzionamento

Problemi: sezione sempre vuota + layout errato (troppo grande, sotto le armi).



Soluzione:



Sezione "Equipaggiamento Professionale" spostata sopra gli oggetti acquistabili, compatta (fit-content)



Fix lettura professione: legge correttamente lo stato wizard dallo Step 3



Oggetti caricati da witcher-professions + witcher-equipment/witcher-weapons



Oggetti trasferiti nella scheda al completamento (Step 7)



3\. STATO COMPONENTI ATTUALI (7 Aprile 2026 — pomeriggio)

Componente	Versione	Stato	Note

Foundry VTT	v14.x	✅ Compatibile	Migrazione v14 completata

Sistema Base	TheWitcherItaNewSystem v14.1.5	🟡 IN TEST	Wizard Polish Sprint in corso

Modulo Compendio	witcher-compendium	✅ Stabile	16 pack, 700 entries

Character Wizard	v14.1.5	🟡 IN TEST	Blocchi A+B+C applicati, da verificare

Database	ClassicLevel (.db)	✅ Migrato	Stabile

Pack witcher-skills	—	✅ Presente	Struttura skill documentata

4\. STRUTTURA COMPLETA DEL COMPENDIO — 16 PACK

Pack	Label	Type	Entries	Img%	Note

witcher-races	Razze	Actor	6	93–100%	Prima nell'ordine

witcher-professions	Professioni	Item	11	93–100%	Seconda nell'ordine

witcher-weapons	Armi	Item	35	93.8%	Tomo Base

witcher-armor	Armature	Item	33	93.8%	Tomo Base

witcher-equipment	Oggetti Vari	Item	36	93.8%	Tomo Base

witcher-spells	Incantesimi Base	Item	101	93.8%	Tomo Base

witcher-rituals	Rituali Base	Item	15	93.8%	Tomo Base

witcher-components	Componenti	Item	46	93.8%	Tomo Base

witcher-schematics	Schemi	Item	120	93.8%	Tomo Base

witcher-alchemy	Alchimia	Item	90	93.8%	Tomo Base

witcher-special	Oggetti Witcher	Item	20	93.8%	Tomo Base

witcher-monsters	Bestiario Base	Actor	19	93.8%	REFINE OK

witcher-spells-chaos	Incantesimi Chaos	Item	82	100%	FLUFF OK

witcher-rituals-chaos	Rituali Chaos	Item	16	100%	FLUFF OK

witcher-special-chaos	Oggetti Chaos	Item	53	100%	FLUFF OK

witcher-monsters-chaos	Bestiario Chaos	Actor	7	100%	REFINE OK

Totale entries: \~700 | Pack totali: 16 | Copertura immagini media: \~95%



Razze Giocabili (6 canoniche)

Umano · Elfo · Nano · Witcher · Gnomo · Halfling

(Escluse: Vran, Bobolak)



Professioni (11 classi)

Tutte e 11 le classi del Manuale Base registrate nel pack witcher-professions.



5\. SPECIFICHE TECNICHE E CONVENZIONI

Struttura Modulo witcher-compendium

text

witcher-compendium/

├── module.json

├── packs/                 ← ClassicLevel (.db) per v14

├── assets/

│   ├── wizard/

│   │   └── bgmago.webp   ← Sfondo wizard ottimizzato

│   └── optimized/        ← Asset .webp

├── lang/

│   └── it.json

├── scripts/

│   └── handlebars.js

└── templates/

&#x20;   └── wizard/

Mappatura Campi Critici

Campo Raw	Destinazione Foundry	Nota

stoppingPower	system.stoppingPower	Solo armature

reliability	system.reliability	Armi + Armature

cost	system.cost.value	In Corone

effect	system.description.value	HTML pulito

professionSkills	system.professionSkills	Stringa separata da virgola

attribute (skill)	system.attribute	Attributo collegato

value (skill)	system.value	Valore corrente

Database

Versione Foundry	Formato DB

v13	NeDB .db

v14	ClassicLevel

6\. SCRIPT DI MANUTENZIONE

Script	Funzione

audit.js	Controllo duplicati e anomalie

final-check.js	Verifica pre-build completa

validate-ids.js	Controllo UUID — 16 caratteri, univoci

map-images.js	Associazione automatica immagini

7\. PROTOCOLLO DI DEPLOY E AGGIORNAMENTO

bash

git pull

\# Verifica system.json / module.json — versione e 16 pack

cp -r witcher-compendium /Data/modules/witcher-compendium

\# Riavvia Foundry → Check for Update → Nuovo Mondo → Abilita modulo

Test obbligatori post-deploy:



Importa 1 Arma → verifica campi



Importa 1 Mostro Chaos → verifica stats



Importa 1 Incantesimo Chaos → verifica HTML



Drag Razza → verifica bonus/perk



Drag Professione → verifica skills



Apri wizard → verifica tutti e 7 gli step



Console F12 → ZERO errori bloccanti



Regola critica manifest: incrementare sempre version in system.json per forzare aggiornamento Foundry.



8\. LEZIONI APPRESE E GOTCHA

Problema	Causa	Soluzione

Scroll che resetta al top	Render ApplicationV2 senza scroll memory	Salvare/ripristinare scrollTop tra i render

Template not found Step 7	Partial non pre-caricato	Pre-caricare in handlebars.js all'init

Caratteri speciali IT corrotti	Parser senza encoding	Forzare UTF-8 ovunque

Foundry non aggiorna	Cambio file senza bump versione	Incrementare version in manifest

Conflitto selettori CSS	Specificità simile tra regole	Aumentare specificità o !important mirati

Scheda PG rotta	Override invasivo della sheet	Solo Drag \& Drop, no override

Razze non canoniche	Dati grezzi con razze non giocabili	Filtrare a monte: 6 razze canoniche

Warning ApplicationV1	Sheet legacy su Application/FormApplication	Non bloccante; monitorare verso v16

Pack non visibili	Pack non registrati in module.json	Registrare ogni pack nel manifest

Abilità non appaiono nel wizard	Wizard non leggeva witcher-skills	Usare game.packs.get(...).getDocuments()

Immagine sfondo non caricata	Path puntava alla cartella sorgente raw	Ottimizzare → assets/wizard/, aggiornare CSS

Equipaggiamento professionale vuoto	Mancata lettura stato Step 3	Correggere lettura stato wizard tra step

Schede razza/professione enormi	Layout senza dimensioni vincolate	fit-content per width e height

9\. ISSUE APERTE E ROADMAP (7 Aprile 2026 — pomeriggio)

Priorità	Attività	Responsabile	Stato

🔴 CRITICA	Verifica post-fix Blocchi A+B+C	Manuel	DA TESTARE

🔴 IMMEDIATA	Audit descrizioni mancanti compendio	Perplexity + Manuel	DA AVVIARE

🔴 IMMEDIATA	Revisione naming "Manuale Base"/"Tomo del Caos" UI	Perplexity	DA AVVIARE

🟠 ALTA	Isolamento warning V1 — sistema o modulo?	Antigravity + Manuel	DA ANALIZZARE

🟡 MEDIA	Sprint Polish — fix UI/Drag\&Drop minori	Antigravity	PENDING

🟢 BASSA	Sprint Docs — walkthrough manuale utente	Perplexity	FUTURO

🟢 BASSA	Fix compatibilità sheet V2	Antigravity	FUTURO

10\. STATO SPRINT STORICO COMPLETO

Sprint	Contenuto	Priorità	Stato

Sprint 1	Conversione Tomo Base — 515/516 entries	IMMEDIATO	✅ COMPLETATO

Sprint IMG	Immagini Tomo Base — 93.8%	IMMEDIATO	✅ COMPLETATO

Sprint 2	Tomo del Caos — 158 entries, 100% img	ALTO	✅ COMPLETATO

Refinement A	Descrizioni Chaos — 151 voci	ALTO	✅ COMPLETATO

Refinement B	Bestiario — 26 mostri	ALTO	✅ COMPLETATO

Sprint Audit	Audit finale 16 pack	IMMEDIATO	✅ COMPLETATO

Sprint Deploy	Test import Foundry v13	ALTO	✅ COMPLETATO

Sprint RazzeClassi	Razze 6 + Professioni 11	URGENTE	✅ COMPLETATO

Migrazione v14	NeDB → ClassicLevel, ApplicationV2	CRITICO	✅ COMPLETATO

Wizard v1.x	7 step base	ALTO	✅ COMPLETATO

Polish Wizard	Fix contrasto, scroll, sfondo	MEDIO	✅ COMPLETATO

Deploy v14.1.2	Sistema pronto	IMMEDIATO	✅ COMPLETATO

Wizard Polish Sprint	Fix UI, Step 5 Abilità, Step 6 Equipaggiamento	ALTO	🟡 IN TEST

Audit Descrizioni	Verifica descrizioni compendio	IMMEDIATA	🔴 DA AVVIARE

Revisione Naming	UI localizzata	IMMEDIATA	🔴 DA AVVIARE

Analisi Warning V1	Isolamento ApplicationV1	ALTA	🟠 DA ANALIZZARE

Sprint Polish	Fix minori UI/DragDrop	MEDIA	🟡 PENDING

Sprint Docs	Manuale utente	BASSA	🟢 FUTURO

Fase 7	Workflow Source-First & Compilatore v11	CRITICO	✅ COMPLETATO

FASE 7 — Workflow Source-First e Compilatore Moderno (v14.1.30+)

Data: 9 Aprile 2026

Attività svolte:

Riorganizzazione Totale Sorgenti: La cartella `_tools/src-packs/` è stata ristrutturata per rispecchiare fedelmente la gerarchia dei pacchetti in `module.json` (es. `CORE/`, `MAGIA/base/`, `BESTIARIO/PNG/caos/`). Questo permette una gestione ordinata dei file JSON senza conflitti di nomi.

Implementazione Compilatore Master: Creato lo script `_tools/scripts/compile-packs-v11.mjs`. Questo strumento automatizza la trasformazione dei file JSON sorgente nei database binari LevelDB richiesti da Foundry v14.

Upgrade Tecnologico: Passaggio alla libreria `classic-level` v3.0.0 (basata su Rust/NAPI-RS). Risultato: compilazione più veloce, eliminazione di dipendenze Python/node-gyp e maggiore stabilità su Windows.

Automazione del Workflow: Il compilatore pulisce i database di destinazione prima di ogni scrittura, garantendo che il compendio in gioco sia sempre lo specchio esatto dei file JSON in `_tools`.

Risultato:
- Struttura `src-packs` sincronizzata al 100% con `module.json`.
- Tempo di compilazione globale: < 5 secondi per ~700 entries.
- Workflow semplificato: Modifica JSON → Esegui Script → Gioca.

11\. METRICHE DI PRODUZIONE FINALI

Metrica	Valore

Entries totali	\~700

Pack totali	16

Copertura immagini Tomo Base	93.8%

Copertura immagini Tomo del Caos	100%

Copertura immagini complessiva	\~95%

UUID univoci e conformi	100%

Errori bloccanti JSON	0

Mostri con attributi EN e stats derivate	100% (26/26)

Pack migrati NeDB → ClassicLevel	16/16

Step Wizard completati e localizzati	7/7

Abilità Difficili mappate	10/10

Documento Omnibus v6.0 — Compilato il 7 Aprile 2026 (pomeriggio) da Perplexity per Manuel.

Storico: v2.1 (1 Apr) → v2.2 (1 Apr) → v2.4 (2 Apr) → v3.1 (7 Apr) → v4.0 (7 Apr) → v5.0 (7 Apr mattina) → v6.0 (7 Apr pomeriggio — Wizard Polish Sprint)

