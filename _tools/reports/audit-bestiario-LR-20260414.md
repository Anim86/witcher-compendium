# Audit Report Bestiario: Libro dei Racconti (LR)
**Data:** 2026-04-14
**Stato:** COMPLETATO

## Riepilogo Operazioni
È stato eseguito un audit completo delle voci del bestiario (mostri e PNG) provenienti dal manuale "Libro dei Racconti" (LR). Tutte le voci ufficiali sono state aggiornate allo schema v2 e conformate alle formule statistiche derivate obbligatorie (v14).

## 1. Voci Ufficiali Remediate (17)
Le seguenti voci sono state aggiornate con dati reali estratti dai testi sorgente (.txt):

| Nome | Sourcebook | Pagina | Stato |
| :--- | :--- | :--- | :--- |
| Bestia del Lago Tankred | LR 16 | 16 | [REMEDIATED] Formule v14 applicate |
| Louise van Adelaide | LR 18 | 18 | [REMEDIATED] Profilo Mago (MB 273) |
| Catrin Preece | LR 18 | 18 | [REMEDIATED] Bonus +5 Accortezza/Eludere/Furtività |
| Clarisse de Claudine | LR 19 | 19 | [REMEDIATED] Bonus +8 Alchimia |
| Oberhasil (Silvano) | LR 34 | 34 | [REMEDIATED] Statistiche complete |
| Pardus di Korath | LR 36 | 36 | [NEW] Creazione voce mancante (Witcher Gatto) |
| Cooper Mawik | LR 64 | 64 | [REMEDIATED] Statistiche complete |
| Scagnozzi di Mawik | LR 65 | 65 | [REMEDIATED] Statistiche complete |
| Enid Harkus | LR 66 | 66 | [DEPRECATED] Solo descrizione nel manuale |
| Brodgar Farrag | LR 66 | 66 | [DEPRECATED] Profilo Bandito (MB 270) |
| Layton Hermann | LR 83 | 83 | [REMEDIATED] Capocultista (Magie/Rituali) |
| Cultista (Coram Agh Tera) | LR 84 | 84 | [REMEDIATED] Statistiche complete |
| Annegina di Maribor | LR 85 | 85 | [REMEDIATED] Anatomista (Sanguinamento 100%) |
| Oritteropo | LR 111 | 111 | [REMEDIATED] Statistiche complete |
| Gigascorpione | LR 112 | 112 | [REMEDIATED] Statistiche complete |
| Leblanc de Surmann | LR 146 | 146 | [REMEDIATED] Cavaliere Errante |
| Francine Marchand | LR 147 | 147 | [REMEDIATED] Statistiche complete |

## 2. Segnalazione Placeholder (24)
Le seguenti voci sono state identificate come placeholder (riferimenti generici a mostri del Manuale Base presenti nelle avventure LR) e rinominate con il prefisso `[PLACEHOLDER]` per evitare confusione:

- `[PLACEHOLDER] Alghoul`
- `[PLACEHOLDER] Archespore`
- `[PLACEHOLDER] Arpie`
- ... (24 voci totali in `BESTIARIO/MOSTRI/` con tag `_LR_`)

## 3. Conformità Tecnica
- **Formule Derivate:** HP = FIS*5, STA = FIS*5, REC = floor(FIS/5) min 1, STUN = FIS, RUN = VEL*3, LEAP = floor(RUN/5), ENC = FIS*2.
- **Schema v2:** Campo `unmodifiedMax` aggiunto a tutte le statistiche vitali.
- **System ID:** Tutte le voci marcate con `TheWitcherItaNewSystem`.

## Conclusioni
L'audit LR è concluso. Il compendio è ora pronto per la compilazione e il test in Foundry VTT.
