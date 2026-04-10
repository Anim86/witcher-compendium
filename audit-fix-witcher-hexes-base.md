# Audit Pack: witcher-hexes-base

**Data: 10 Aprile 2026**
**Progetto: witcher-compendium**
**Stato: 6/6 Voci Complete — NUOVO PACK CREATO**

Creato il pack `witcher-hexes-base` per ospitare le fatture del Tomo Base, precedentemente mescolate ai rituali o mancanti. Tutte le voci sono state allineate allo standard v14.

## ════════════════════════════════════════
## FATTURE TOMO BASE (6 VOCI)
## ════════════════════════════════════════
Le fatture includono la pericolosità, l'occorrente per toglierle e descrizioni high-fidelity.

| Nome Fattura | Pericolosità | Fonte | UUID | Stato |
| :--- | :--- | :--- | :--- | :--- |
| **Il Bacio della Pesta** | Alta | MB 123 | `d911837f923f484a` | ✅ SPOSTATO |
| **Il Prurito Perenne** | Bassa | MB 123 | `09c75899bb7c48ad` | ✅ SPOSTATO |
| **La Fattura della Bestia** | Alta | MB 123 | `179fcc56053e458e` | ✅ SPOSTATO |
| **La Fattura delle Ombre** | Bassa | MB 123 | `83fab892a4f74e67` | ✅ SPOSTATO |
| **La Fortuna del Diavolo** | Media | MB 123 | `10f5bb435e1543ac` | ✅ SPOSTATO |
| **L'Incubo** | Media | MB 123 | `4f9c21e2f1ca4a48` | ✅ [NUOVO] |

## ════════════════════════════════════════
## CONFIGURAZIONE SISTEMA
## ════════════════════════════════════════
- **Registrazione**: Pack registrato correttamente in `module.json`.
- **Organizzazione**: Mappato nella cartella `MAGIA > Tomo Base` tramite `setup-folders.js`.
- **v14 Standard**:
  - `coreVersion: 14` (intero).
  - Statistiche di pericolosità e rimozione inserite nei campi corretti.
  - Testi narrativi in tag `<p>` estratti da `Pag122_Fatture.txt`.
