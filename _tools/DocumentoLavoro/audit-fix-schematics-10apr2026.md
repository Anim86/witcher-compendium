# 📋 AUDIT & FIX REPORT — witcher-schematics
**Data:** 10 Aprile 2026
**Pack:** `CREAZIONE/base/witcher-schematics`
**SorgentePrincipale:** `MB 132–141` (Manuale Base)

## Situazione Iniziale
L'audit ha confermato che il pack era in uno stato di corruzione avanzata:
- **119 file esistenti:** Tutti classificati come **ERRATA**. Le descrizioni contenevano frammenti di tabelle di statistiche (Danni, Affidabilità, ecc.) degli oggetti finiti, invece che informazioni sullo schema.
- **Componenti:** I campi `system.components` contenevano intere stringhe della riga originale del TXT, inclusi costi di investimento e CD.
- **Metadati:** I campi CD e Tempo erano spesso popolati con dati troncati.

## Azioni Eseguite

### 1. Cleanup Totale
- **Eliminati tutti i file corrotti.** Per garantire la totale integrità del compendio, è stata eseguita una rigenerazione completa dai testi sorgente.

### 2. Ricostruzione Totale (v14.1.36)
Ho rigenerato **109 schemi di manifattura** puliti e strutturati. I file sono stati organizzati per categorie logiche del manuale:

- **Schemi Ingredienti (14):** Acciaio Mahakaman, Cuoio di Dragonide, Dimeritium, ecc.
- **Schemi Armi (39):** Dalle armi base da Novizio (Pugnale, Arco Corto) a quelle da Maestro (Alabarda Rossa, Torrwr).
- **Schemi Armature e Scudi (36):** Dai Gambesoni Novizi alle Armature a Piastre Nilfgaardiane.
- **Schemi Razze Antiche (15):** Gwyhyr Gnomesca, Messer Elfico, Ascia Nanica, ecc.
- **Schemi Potenziamenti (5):** Cuoio Indurito, Fibra, Armatura Nanica/Elfica.

## Standard Applicati
- **Descrizioni:** Testo narrativo pulito in `<p>`, elenco componenti esplicito, CD Manifattura e Tempo di lavorazione testuale.
- **Metadati:**
  - `cost: 0` e `weight: 0` (lo schema è un documento).
  - `difficulty`: CD corretta estratta dalla tabella.
  - `time`: Durata corretta.
  - `components`: Array di stringhe pulito (es. `["Acciaio (×1)", "Legname (×2)"]`).
- **Sourcebook:** Riferimento preciso alla pagina dello schema (`MB 132-141`).
- **_stats (Obbligatorio):**
  ```json
  "_stats": {
    "systemId": "TheWitcherItaNewSystem",
    "coreVersion": "14"
  }
  ```

## Stato Finale
- **File totali nel pack:** 109 (tutti validati e con metadati v14).
- **Database:** Nessuna compilazione eseguita.

---
**Pack schemi bonificato e pronto per il rilascio.**
