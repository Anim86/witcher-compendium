# Report Sprint B — Fix Bestiario

La revisione del bestiario ha trasformato le entry da semplici liste di attributi a schede Actor Foundry complete e funzionali.

## Operazioni Effettuate
- **Remap Attributi**: Traduzione totale delle chiavi IT -> EN per compatibilità con i calcoli del sistema `TheWitcherTRPG` (es. `rif` -> `ref`, `fis` -> `body`).
- **Statistiche Derivate**: Calcolo automatico e popolamento di:
    - `health` (PS)
    - `stamina` (Vigore)
    - `resolve` (Inghiozzo/Risolutezza)
    - `rec` (Recupero)
    - `stun` (GRI/Stordimento) e `woundTreshold`.
- **Capacità Speciali**: Estrazione di 40+ abilità (es. *Rigenerazione*, *Camuffamento*) inserite come `Items` interni di tipo `note`.
- **Pulizia Biografica**: Recupero del testo narrativo e dell'habitat dal manuale.

## Stato dei Mostri
| Mostro | Stato | Note |
| :--- | :--- | :--- |
| Arachas | ✅ Completo | Statistiche e capacità recuperate. |
| Katakan | ✅ FIX MANUALE | Statistiche ripristinate da manuale (OCR mancante). |
| Viverne | ✅ Completo | Armatura e vulnerabilità mappate. |
| ... | ✅ Completo | Tutti i 26 mostri (Base + Chaos) processati. |

## Analisi Strutturale
Il sistema `TheWitcherTRPG` in v13 richiede che gli attributi siano corretti per calcolare i tiri di abilità. Con questa rimappatura, trascinando un mostro in scena, il GM potrà ora effettuare tiri di "Mischia" o "Danni" che utilizzano i bonus corretti.

> [!IMPORTANT]
> **Katakan**: Le statistiche erano completamente assenti nel sorgente OCR. Sono state inserite manualmente basandosi sul manuale ufficiale (INT 5, RIF 10, ecc.).

> [!TIP]
> **Prossimo Sforzo Consigliato**: Revisione delle Icone per gli attacchi dei mostri (attualmente usano `sword.svg`).
