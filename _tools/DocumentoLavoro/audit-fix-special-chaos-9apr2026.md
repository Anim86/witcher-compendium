# 📋 AUDIT & FIX REPORT — witcher-special-chaos (v2)
**Data:** 9 Aprile 2026
**Pack:** `EQUIPAGGIAMENTO/caos/witcher-special-chaos`
**Sorgente:** `TC 119–128` (Tomo del Caos)

## Azioni Eseguite

### 1. Relocazione Trofei
- **Spostati 35 file `Trofeo_*.json`** in `_tools/src-packs/_DA_RICOLLOCARE/trofei/`.
- **Log Nota:** `TROFEI — spostati, richiedono pack dedicato o collocazione in witcher-monsters-chaos`. Sprint dedicato pianificato.

### 2. Tabula Rasa (Cleanup)
- **Rimossi tutti i residui corrotti** e le pozioni fuori ambito. La cartella ora contiene esclusivamente gli Oggetti Magici del Tomo del Caos.

### 3. Ricostruzione con Logica Pesi (Refined)
Ho generato **19 nuovi file JSON** applicando la categorizzazione pesi richiesta:

| Categoria | Peso | Oggetti Inclusi |
| :--- | :---: | :--- |
| **Piccoli** | 0.1 | Amuleti (1-4), Legame di Coppia, Pietre Guardiane (3), Quadrifoglio, Formule (3) |
| **Medi** | 0.5 | Corda Magica, Specchio dei Desideri, Occhio di Nehaleni, Utensili da Incisore |
| **Grandi** | 1.0 | Megascopio, Teschio di Cristallo |
| **Strutture**| 0.0 | Portale Fisso |

- **Nota in descrizione:** In ogni voce con peso non esplicito nel manuale è stata aggiunta la dicitura: *“peso stimato — non indicato nel manuale (TC 119-128)”*.

### 4. Costi (TC 125)
- **Costi applicati:** Prezzi di mercato completi da TC 125 (es. Megascopio 3500, Amuleti 550-1150).
- **Portale Fisso:** `cost: 0` (non vendibile).

## Standard Applicati
- **Struttura:** Flat per Foundry v12/v14.
- **ID:** UUID 16 caratteri univoci.
- **Sourcebook:** Riferimento `TC [pagina]` per ogni oggetto.

## Stato Finale
- **File nel pack:** 19 (puliti e validati).
- **File spostati:** 35 (Trofei).
- **Compilazione DB:** Nessuna.
