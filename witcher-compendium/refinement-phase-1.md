# REFINEMENT PHASE 1 — COMPLETATA

La prima fase di correzione e pulizia del compendio The Witcher RPG è terminata. Il modulo è ora di qualità "Production-ready", con descrizioni narrative per gli oggetti del Chaos e schede mostruose pienamente funzionali in Foundry v13.

## 1. Chaos Descriptions Fixed
Abbiamo analizzato 151 voci dei pack `-chaos` recuperando il testo narrativo ("Fluff") precedentemente assente.
- **Formato**: HTML strutturato con `<p>` e `<blockquote>`.
- **Esempio**: Lo *Specchio dei Desideri* e gli *Amuleti Incantati* ora presentano il contesto narrativo completo, inclusi i rischi meccanici descritti nel manuale.
- **Report Completo**: [report-chaos-descriptions.md](file:///e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/report-chaos-descriptions.md)

## 2. Bestiary Fixed
I 26 mostri (Base + Chaos) sono stati revisionati per conformità allo schema `TheWitcherTRPG` di Foundry.
- **Attributi**: Rimappati da IT (`rif`, `fis`) a EN (`ref`, `body`) per calcoli automatici.
- **Derived Stats**: Popolati health, stamina, vigor, recovery e resolve.
- **Capacità Speciali**: Estratte e inserite come note interne (es. Rigenerazione, Fragilità).
- **Katakan (Base)**: Ripristinato manualmente con statistiche ufficiali (INT 5, RIF 10, ecc.).
- **Report Completo**: [report-bestiary-fix.md](file:///e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/report-bestiary-fix.md)

## 3. Remaining Issues
- **Icone Attacchi**: Gli attacchi dei mostri (es. Artigli) usano ancora l'icona generica `sword.svg`.
- **Effetti Attivi**: Le capacità speciali sono solo testuali; non applicano automaticamente malus (es. Veleno o Sanguinamento) al bersaglio.
- **Tokens Mostri**: Le immagini dei token mostro sono placeholder basati sulle illustrazioni del manuale, ma non sono ancora state testate per trasparenza o cropping.

## 4. Recommended Next Sprint
- **Sprint C — Automazione Combattimento**: Inserimento degli effetti (Sostanze Alchemiche, Veleni) come Active Effects trascinabili.
- **Sprint D — Token Audit**: Revisione grafica delle icone degli attacchi e verifica dei path dei token.

REFINEMENT PHASE 1 COMPLETATA
