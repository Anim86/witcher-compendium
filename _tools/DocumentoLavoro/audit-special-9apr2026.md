# 📋 AUDIT REPORT — witcher-special
**Data:** 9 Aprile 2026
**Pack:** `EQUIPAGGIAMENTO/base/witcher-special`
**Sorgente:** `Pag248_Equipaggiamento da Witcher.txt` (MB 246–250)

## Stato Attuale (Analisi Critica)
Delle 20 voci esistenti, **tutte** presentano corruzione nei dati (campi `system.effect` o `system.description` con testo di incantesimi o lore di spade incongruente). Mancano inoltre tutti i Decotti e l'equipaggiamento iconico (Spade e Medaglioni).

## Tabella Comparativa

| Voce TXT | Stato | Problema Rilevato |
| :--- | :---: | :--- |
| **POZIONI** | | |
| Bufera di Neve | ❌ | Mancante |
| Filtro di Petri | ❌ | Mancante |
| Foresta di Maribor | ❌ | Mancante |
| Gatto | ⚠️ | Descrizione OK, Effetto Corrotto (Aura di Paura) |
| Gufo Fulvo | ⚠️ | Descrizione OK, Effetto Corrotto (Aura di Paura) |
| Luna Piena | ⚠️ | Nome file corto ("Luna"), Effetto Corrotto |
| Miele Bianco | ⚠️ | Effetto Corrotto |
| Orca Assassina | ❌ | Mancante |
| Rigogolo Dorato | ⚠️ | Effetto Corrotto (Bussola Magica) |
| Rondine | ⚠️ | Effetto Corrotto |
| Sangue Nero | ⚠️ | Effetto Corrotto |
| Tuono | ❌ | Mancante |
| **UNGUENTI** | | |
| Anti-Ancestrali | ⚠️ | Effetto Corrotto (Lore di Ulster Hood) |
| Anti-Bestie | ⚠️ | Effetto Corrotto |
| Anti-Costrutti | ⚠️ | Effetto Corrotto |
| Anti-Dragonidi | ⚠️ | Effetto Corrotto |
| Anti-Ibridi | ⚠️ | Effetto Corrotto |
| Anti-Insettoidi | ⚠️ | Effetto Corrotto |
| Anti-Maledetti | ⚠️ | Effetto Corrotto |
| Anti-Necrofagi | ⚠️ | Effetto Corrotto |
| Anti-Orchi | ⚠️ | Effetto Corrotto |
| Anti-Spettri | ⚠️ | Effetto Corrotto |
| Anti-Vampiri | ⚠️ | Effetto Corrotto |
| Veleno dell'Impiccato | ⚠️ | Effetto Corrotto |
| **DECOTTI** | | |
| Arachas | ❌ | Mancante |
| Demonio | ❌ | Mancante |
| Grifone | ❌ | Mancante |
| Katakan | ❌ | Mancante |
| Lupo Mannaro | ❌ | Mancante |
| Nekker | ❌ | Mancante |
| Strega dei Sepolcri | ❌ | Mancante |
| Troll | ❌ | Mancante |
| Viverna | ❌ | Mancante |
| Wraith Diurno | ❌ | Mancante |
| **EQUIPAGGIAMENTO** | | |
| Medaglione da Witcher| ❌ | Mancante |
| Spada Acciaio | ❌ | Mancante |
| Spada Argento | ❌ | Mancante |

## Conteggio Finale Atteso
- **Attuali:** 20 (tutti da ricostruire/cancellare)
- **Target:** 37 voci pulite basate sul manuale.

## Note Rarity (Da inserire in descrizione)
*“Tutto l’equipaggiamento presentato in questo capitolo è più che raro. Questi oggetti e formule dovrebbero essere le ricompense per missioni importanti o quando un personaggio li cerca appositamente.”* — MB 246
