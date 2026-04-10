# Audit Pack: witcher-rituals

**Data: 10 Aprile 2026**
**Progetto: witcher-compendium**
**Stato: 15/15 Voci Complete — BONIFICA & COMPLETAMENTO**

Il pack `witcher-rituals` è stato ristrutturato (scorporando le fatture) e completato con le voci mancanti del Tomo Base. Le descrizioni sono state ripristinate integralmente dal file sorgente `Pag118_Rituali.txt`.

## ════════════════════════════════════════
## RITUALI DA MAGO / DRUIDO (15 VOCI)
## ════════════════════════════════════════
Tutti i rituali ora includono statistiche v14, componenti consumabili e descrizioni pulite.

| Nome Rituale | Livello | Fonte | UUID | Stato |
| :--- | :--- | :--- | :--- | :--- |
| **Idromanzia** | Novizio | MB 119 | `0e058f4469d14c2f` | ✅ OK |
| **Rituale della Magia** | Novizio | MB 119 | `739a887b1c98409e` | ✅ [NUOVO] |
| **Messaggio Magico** | Novizio | MB 119 | `166789dd069a4ea2` | ✅ OK |
| **Rituale Purificatore** | Novizio | MB 119 | `0c756bc90cd84b1a` | ✅ OK |
| **Piromanzia** | Novizio | MB 119 | `40dbcd89a1d6480b` | ✅ OK |
| **Rituale della Vita** | Novizio | MB 120 | `2d2006b866ec446a` | ✅ [NUOVO] |
| **Telecomunicazione** | Novizio | MB 120 | `78b3dac93ae141f6` | ✅ OK |
| **Seduta Spiritica** | Novizio | MB 120 | `66b53304ae614932` | ✅ OK |
| **Vaso d'Incantesimi** | Novizio | MB 120 | `3c3c8468231f4ed0` | ✅ [NUOVO] |
| **Barriera Magica** | Esperto | MB 120 | `6f95a8d8ab5e496b` | ✅ OK |
| **Consacrare** | Esperto | MB 120 | `d9cee7de73c443c5` | ✅ OK |
| **Oniromanzia** | Esperto | MB 120 | `3f837cb1be7b4b06` | ✅ OK |
| **Compressione in Manufatto** | Maestro | MB 121 | `8e916dc607844cab` | ✅ [NUOVO] |
| **Costruire Golem** | Maestro | MB 121 | `0d6f29d041714da9` | ✅ [NUOVO] |
| **Illusione Interattiva** | Maestro | MB 121 | `4daa77141ce74625` | ✅ OK |

## ════════════════════════════════════════
## RIEPILOGO AZIONI
## ════════════════════════════════════════
1. **Scorporo Fatture**: 5 voci (`Il Bacio della Pesta`, ecc.) sono state spostate nel nuovo pack `witcher-hexes-base`.
2. **Standard v14**: 
   - Rimozione `systemVersion`.
   - `coreVersion: 14` (intero).
   - `systemId` impostato correttamente.
3. **High-Fidelity Desc**: Tutte le descrizioni sono state ri-estratte dai TXT originali per garantire la massima fedeltà al manuale.
4. **Completamento**: Creati da zero i 5 rituali che mancavano nel pack originale.
