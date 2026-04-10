# Audit Pack: witcher-spells-chaos

**Data: 10 Aprile 2026**
**Progetto: witcher-compendium**
**Stato: 52/52 Voci Complete — BONIFICA EFFETTUATA**

Il pack `witcher-spells-chaos` (Tomo del Caos) è stato ripulito dalle ripetizioni e aggiornato integralmente allo standard Foundry VTT v14. Tutti i 52 incantesimi da mago introdotti nel manuale d'espandione sono stati verificati.

## ════════════════════════════════════════
## RIEPILOGO ELIMINAZIONI (DUPLICATI)
## ════════════════════════════════════════
Sono state rimosse **33 voci** (Invocazioni Druidiche/Sacerdotali) già coperte dal pack `witcher-invocations` creato oggi:

- *Esempi: Totem Druidico, Vendetta del Corvo, Venti della Taiga, Voce del Consigliere.*

## ════════════════════════════════════════
## INCANTESIMI DA MAGO (52 VOCI)
## ════════════════════════════════════════
Tutte le voci sono state bonificate strutturalmente e i testi sono stati ri-estratti dai TXT originali.

| Nome Incantesimo | Livello | Fonte | UUID | Stato |
| :--- | :--- | :--- | :--- | :--- |
| **Immobilizzare Lingua** | Novizio | TC 84 | `...` | ✅ OK |
| **Individuare Linee Geomantiche** | Novizio | TC 84 | `...` | ✅ OK |
| **Morte di Fergus** | Novizio | TC 84 | `...` | ✅ OK |
| **Recupero Alchemico** | Novizio | TC 84 | `...` | ✅ OK |
| **Riaprire Portale** | Novizio | TC 84 | `...` | ✅ OK |
| **Schermo Magico** | Novizio | TC 84 | `...` | ✅ OK |
| **Acuire Sensi** | Novizio | TC 85 | `...` | ✅ OK |
| **Arco di Bronwyn** | Novizio | TC 85 | `...` | ✅ OK |
| **Fulmine Globulare** | Esperto | TC 89 | `...` | ✅ OK |
| **Vampata del Korath** | Maestro | TC 92 | `...` | ✅ OK |
| ... (altre 42 voci) | ... | ... | ... | ✅ OK |

## ════════════════════════════════════════
## FIX APPLICATI
## ════════════════════════════════════════
1. **Struttura v14**: 
   - Rimozione di `systemVersion` da tutti i file.
   - Conversione di `coreVersion` a intero `14`.
   - Normalizzazione di `systemId` e `class: Mage`.
2. **Encoding & Nomi**:
   - Correzione di apostrofi (es. `Getto d'Acqua` invece di typo OCR).
3. **Descrizioni HQ**:
   - Pulizia totale dei paragrafi: i testi sono stati ri-estratti da `Pag083_Incantesimi da Mago.txt`.
4. **Mappatura Pagine**:
   - Riassegnazione dinamica del numero di pagina corretto (`TC 84-92`).
5. **UUID**:
   - Verifica collisioni effettuata: **Nessun conflitto** rilevato.
