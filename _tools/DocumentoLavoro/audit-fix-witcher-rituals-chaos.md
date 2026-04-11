# Audit Pack: witcher-rituals-chaos

**Data: 10 Aprile 2026**
**Progetto: witcher-compendium**
**Stato: 10/10 Voci Complete — BONIFICA & PULIZIA EFFETTUATA**

Il pack `witcher-rituals-chaos` (Tomo del Caos) è stato ripulito dai duplicati e aggiornato integralmente allo standard Foundry VTT v14. Tutti i 10 rituali introdotti nel Tomo del Caos sono stati verificati e corretti.

## ════════════════════════════════════════
## RIEPILOGO ELIMINAZIONI (DUPLICATI)
## ════════════════════════════════════════
Sono state rimosse **7 voci** (Hexes/Fatture e altri residui) già coperte da altri pack dedicati:

- *Esempi: Malocchio, Ossa di Vetro, Fattura della Dimenticanza, ecc. (Spostati in witcher-hexes).*

## ════════════════════════════════════════
## RITUALI TOMO DEL CAOS (10 VOCI)
## ════════════════════════════════════════
Tutte le voci includono statistiche v14 e descrizioni ripristinate dal file `Pag104_Rituali.txt`.

| Nome Rituale | Livello | Fonte | UUID | Stato |
| :--- | :--- | :--- | :--- | :--- |
| **Ciondolo di Wagerer** | Novizio | TC 103 | `...` | ✅ OK |
| **Creare Teschio di Cristallo** | Novizio | TC 103 | `...` | ✅ OK |
| **Infondere Trofeo** | Novizio | TC 103 | `...` | ✅ OK |
| **Tiromanzia** | Novizio | TC 103 | `...` | ✅ OK |
| **Animare Armatura** | Esperto | TC 103 | `...` | ✅ OK |
| **Faro dell'Innaturale** | Esperto | TC 103 | `10f7449851264931` | ✅ OK |
| **Nebbia del Passato** | Esperto | TC 104 | `...` | ✅ OK |
| **Registro Magico degli Ospiti** | Esperto | TC 104 | `...` | ✅ OK |
| **Creare Luogo di Potere** | Maestro | TC 104 | `...` | ✅ OK |
| **Incantare Amuleto** | Maestro | TC 104 | `...` | ✅ OK |

## ════════════════════════════════════════
## FIX APPLICATI
## ════════════════════════════════════════
1. **Pulizia File System**: Rimosse versioni duplicate e file con encoding errati (es. `Faro dell?TInnaturale`).
2. **Standard v14**: 
   - Rimozione `systemVersion`.
   - `coreVersion: 14` (intero).
   - Normalizzazione `systemId` e `class: ritual`.
3. **Conversione Text Artifacts**: Ripristinati apostrofi e caratteri speciali nelle descrizioni estratti dai sorgenti HQ.
4. **Mappatura Pagine**: Riassegnazione precisa del numero di pagina (`TC 103-104`).
