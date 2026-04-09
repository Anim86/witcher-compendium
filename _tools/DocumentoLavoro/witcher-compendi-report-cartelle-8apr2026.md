# Witcher Compendi - Report Sprint Cartelle
Data: 8-9 Aprile 2026
Autore: Perplexity Strategist

---

## 1. OBIETTIVO
Organizzare i 16 pack di witcher-compendium in cartelle logiche e intuitive
visibili nell'interfaccia Compendi di Foundry VTT v14.

---

## 2. STRUTTURA FINALE APPROVATA

```
The Witcher Compendio ITA (cartella root)
├── CORE
│   ├── witcher-races (Razze)
│   ├── witcher-professions (Professioni)
│   └── witcher-skills (Abilità)
├── EQUIPAGGIAMENTO
│   ├── Tomo Base
│   │   ├── witcher-weapons (Armi)
│   │   ├── witcher-armor (Armature)
│   │   ├── witcher-equipment (Oggetti Vari)
│   │   └── witcher-special (Oggetti Witcher)
│   └── Tomo del Caos
│       └── witcher-special-chaos (Oggetti Chaos)
├── MAGIA
│   ├── Tomo Base
│   │   ├── witcher-spells (Incantesimi Base)
│   │   └── witcher-rituals (Rituali Base)
│   └── Tomo del Caos
│       ├── witcher-spells-chaos (Incantesimi Chaos)
│       └── witcher-rituals-chaos (Rituali Chaos)
├── CREAZIONE
│   └── Tomo Base
│       ├── witcher-components (Componenti)
│       ├── witcher-schematics (Schemi)
│       └── witcher-alchemy (Alchimia)
└── BESTIARIO / PNG
    ├── Tomo Base
    │   └── witcher-monsters (Bestiario Base)
    └── Tomo del Caos
        └── witcher-monsters-chaos (Bestiario Chaos)
```

---

## 3. PROBLEMATICHE AFFRONTATE

### 3.1 packFolders con type: folder (RISOLTO)
- Problema: primo tentativo usava "type":"folder" dentro packs[]
- Causa: valore non valido per Foundry v14
- Errore: "Recursive type: folder is not a valid choice"
- Soluzione: usare la chiave packFolders separata nel module.json

### 3.2 Refuso URL manifest (RISOLTO)
- Problema: Foundry non rilevava gli aggiornamenti
- Causa: URL manifest puntava a "witcher-compendio" invece di "witcher-compendium"
- Soluzione: corretto URL in module.json, bump a v14.1.14

### 3.3 ZIP release non aggiornato (RISOLTO)
- Problema: module.json corretto nel repo ma ZIP della release conteneva versione vecchia
- Causa: ZIP generato prima del commit con packFolders
- Soluzione: rigenerazione manuale ZIP e nuova release v14.1.15

### 3.4 packFolders non crea cartella root (BUG FOUNDRY)
- Problema: struttura nidificata con cartella root "The Witcher Compendio ITA" non appariva
- Causa: bug documentato Foundry v14 (issue #11800, #11473)
  - packFolders crea le cartelle solo al primo caricamento mondo
  - se una cartella viene eliminata manualmente, Foundry la marca come "deleted"
    nel DB del mondo e non la ricrea mai più
- Soluzione adottata: script setup-folders.js che crea le cartelle
  programmaticamente via Hooks.once("ready") con Folder.create()

### 3.5 Pack fuori dalle cartelle dopo creazione (RISOLTO)
- Problema: lo script creava le cartelle ma i pack restavano fuori
- Causa: mancava il secondo step di assegnazione pack alle cartelle
- Soluzione: aggiunto blocco di assegnazione con p.setFolder(folder.id)
  per tutti i 17 pack

### 3.6 Script non funziona su mondi esistenti (COMPORTAMENTO NOTO FOUNDRY)
- Problema: su mondi già esistenti dove erano state fatte modifiche manuali
  alle cartelle, lo script non riusciva a spostare i pack correttamente
- Causa: Foundry salva lo stato delle cartelle nel DB del mondo (LevelDB binario)
  e non sovrascrive le assegnazioni esistenti
- Soluzione finale: la struttura funziona perfettamente su installazione pulita
  (mondo nuovo). Comportamento accettato e documentato.

---

## 4. APPROCCI TENTATI E SCARTATI

| Approccio | Motivo scartato |
|---|---|
| type: folder dentro packs[] | Non valido in Foundry v14 |
| Nomi pack prefixati (CORE-witcher-races) | Funzionale ma brutto, non era quello richiesto |
| packFolders nidificato con root | Bug Foundry, non ricrea dopo prima volta |
| Flat hierarchy con folder: "Parent" | Sintassi non supportata da Foundry |
| Modifica DB LevelDB direttamente | Rischio corruzione, scartato |

---

## 5. SOLUZIONE FINALE IMPLEMENTATA

### module.json
- packFolders rimosso (non affidabile su mondi esistenti)
- packs[] con percorsi aggiornati alle nuove sottocartelle fisiche
- Struttura fisica cartelle mantenuta per organizzazione del repo

### scripts/setup-folders.js
- Eseguito una volta sola a Hooks.once("ready")
- Flag world-setting "foldersCreated" per evitare duplicati
- Crea root "The Witcher Compendio ITA"
- Crea 5 categorie principali con colori
- Crea sottocartelle Tomo Base / Tomo del Caos
- Assegna tutti i 17 pack alle cartelle corrette via setFolder()

### Versione finale: v14.1.22
### Funzionante su: installazione pulita (mondo nuovo)

---

## 6. LEZIONI APPRESE

| Problema | Causa | Soluzione |
|---|---|---|
| packFolders non affidabile | Bug Foundry issue #11800 | Usare script JS con Folder.create() |
| ZIP release non aggiornato | GitHub Actions non incluse nel commit | Rigenerare ZIP manualmente dopo ogni modifica |
| Foundry non aggiorna modulo | URL manifest errato | Verificare SEMPRE manifest URL prima del deploy |
| Pack fuori dalle cartelle | setFolder() va chiamato esplicitamente | Aggiungere loop di assegnazione dopo Folder.create() |
| Mondi esistenti non aggiornabili | LevelDB stato fisso per cartelle già toccate | Documentare: funziona solo su mondo nuovo |

---

## 7. STATO FINALE
- Struttura cartelle: COMPLETATA e FUNZIONANTE su mondo nuovo
- Versione modulo: v14.1.22
- Pack assegnati: 17/17
- Comportamento mondi esistenti: non modificabile (limitazione Foundry)
- Prossime priorità: Audit descrizioni mancanti, Revisione naming UI
