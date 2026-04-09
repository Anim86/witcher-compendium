# 🔧 FIX REPORT — witcher-special
**Data:** 9 Aprile 2026
**Pack:** `EQUIPAGGIAMENTO/base/witcher-special`
**Obiettivo:** Ricostruzione completa e pulizia del pack (37 voci).

## Azioni Eseguite

### 1. Tabula Rasa (Cleanup)
- **Eliminate 20 voci corrotte:** Tutte le voci pre-esistenti sono state rimosse per eliminare i frammenti OCR incoerenti (descrizioni di spade/incantesimi errate).

### 2. Ricostruzione (Generation)
Ho generato **37 nuovi file JSON** seguendo rigorosamente il manuale (MB 246–250):

- **Pozioni (12):**
  - Bufera di Neve, Filtro di Petri, Foresta di Maribor, Gatto, Gufo Fulvo, Luna Piena, Miele Bianco, Orca Assassina, Rigogolo Dorato, Rondine, Sangue Nero, Tuono.
- **Unguenti (12):**
  - Anti-Ancestrali, Anti-Bestie, Anti-Costrutti, Anti-Dragonidi, Anti-Ibridi, Anti-Insettoidi, Anti-Maledetti, Anti-Necrofagi, Anti-Orchi, Anti-Spettri, Anti-Vampiri, Veleno dell'Impiccato.
- **Decotti (10):**
  - Arachas, Demonio, Grifone, Katakan, Lupo Mannaro, Nekker, Strega dei Sepolcri, Troll, Viverna, Wraith Diurno.
- **Equipaggiamento Speciale (3):**
  - Medaglione da Witcher, Spada d'acciaio da witcher, Spada d'argento da witcher.

## Standard Applicati
- **Struttura:** Flat optimized per Foundry v12/v14.
- **Descrizione:** Inclusa nota narrativa Rodolf/Manuale sulla rarità in ogni voce.
- **Peso:** Standardizzato a `0.5` per i consumabili.
- **Costo:** Impostato a `0` (non vendibile/acquistabile da regole manuale MB 246-250).
- **ID:** UUID 16 caratteri univoci.
- **Sourcebook:** Riferimento `MB [pagina]` per ogni oggetto.

## Verifica
Il pack `src-packs` è ora pronto per la compilazione DB (da eseguire in uno sprint successivo). Nessun database è stato compilato durante questo fix.
