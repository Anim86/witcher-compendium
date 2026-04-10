# Audit Pack: witcher-spells

**Data: 10 Aprile 2026**
**Progetto: witcher-compendium**
**Stato: 65/65 Voci Complate — BONIFICA EFFETTUATA**

Il pack `witcher-spells` è stato ripulito dai duplicati (Segni e Invocazioni) e aggiornato integralmente allo standard Foundry VTT v14. Tutti i 65 incantesimi da mago del Tomo Base sono stati verificati e le loro descrizioni sono state ripristinate fedelmente dai file sorgente.

## ════════════════════════════════════════
## RIEPILOGO ELIMINAZIONI (DUPLICATI)
## ════════════════════════════════════════
Come da istruzioni, sono state rimosse **38 voci** già coperte da altri pack dedicati:

- **10 Segni Witcher** (Spostati in `witcher-signs` / `witcher-signs-chaos`)
  - *Include: Aard, Igni, Quen, Yrden, Axii e varianti esperte.*
- **28 Invocazioni Prete/Druido** (Spostate in `witcher-invocations`)
  - *Include: Amico delle Bestie, Benedizione di Guarigione, Audacia di Freya, ecc.*

## ════════════════════════════════════════
## INCANTESIMI DA MAGO (65 VOCI)
## ════════════════════════════════════════
Tutte le voci sono state bonificate strutturalmente e i testi OCR sono stati sostituiti con versioni "High-Fidelity" dai TXT originali.

| Nome Incantesimo | Livello | Fonte | UUID | Stato |
| :--- | :--- | :--- | :--- | :--- |
| **Bussola Magica** | Novizio | MB 104 | `017f9a4e6361438f` | ✅ OK |
| **Cenlly Graig** | Novizio | MB 104 | `02701420cd554a85` | ✅ OK |
| **Adenydd** | Novizio | MB 104 | `5750cd6d5a9640c6` | ✅ OK |
| **Aenye** | Novizio | MB 105 | `47102457bb98469c` | ✅ OK |
| **Acquazzone** | Novizio | MB 106 | `402d36bee857486c` | ✅ OK |
| **Dissipazione** | Novizio | MB 104 | `722238936d204bf7` | ✅ OK |
| **Codi Bywyd** | Novizio | MB 104 | `0984857645344e5c` | ✅ OK |
| **Arieggiare** | Novizio | MB 105 | `12d1301ee1fe4806` | ✅ OK |
| **Aine Verseos** | Novizio | MB 105 | `1e50b5373f534d66` | ✅ OK |
| **Controllare Acque** | Novizio | MB 106 | `69c73fb2a4d44e77` | ✅ OK |
| ... (altre 55 voci) | ... | ... | ... | ✅ OK |

> [!NOTE]
> Per brevità, la tabella mostra una selezione. Tutte le **65 voci** sono state processate con successo.

## ════════════════════════════════════════
## FIX APPLICATI
## ════════════════════════════════════════
1. **Struttura v14**: 
   - Rimozione di `systemVersion` da tutti i file.
   - Conversione di `coreVersion` da stringa a intero `14`.
   - Normalizzazione di `systemId` in `TheWitcherItaNewSystem`.
2. **Encoding & Nomi**:
   - Correzione sistematica di apostrofi e caratteri speciali (es. `Sacca d'Aria`, `Luce della Verità`).
3. **Descrizioni**:
   - Pulizia totale dei paragrafi: i testi sono stati ri-estratti dai TXT sorgente, eliminando tabelle OCR e refusi di scansione. Tutte le descrizioni sono ora racchiuse in tag `<p>`.
4. **Mappatura Pagine**:
   - Riassegnazione dinamica del numero di pagina corretto (`MB 104-110`) basata sulla posizione del testo nel manuale.
5. **UUID**:
   - Verifica collisioni effettuata: **Nessun conflitto** rilevato con i pack creati oggi.
