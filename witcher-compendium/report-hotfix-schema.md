# REPORT HOTFIX SCHEMA — VISIBILITÀ RIPRISTINATA (v1.0.2)

Abbiamo completato l'hotfix strutturale per garantire che tutte le descrizioni siano visibili nel sistema `TheWitcherTRPG` su Foundry v13.

## 🛠️ Modifiche ai Percorsi Dati
Il problema era causato da un mismatch tra il modulo (che salvava in `system.description`) e le schede del sistema (che leggono percorsi diversi a seconda del tipo di oggetto).

| Categoria | Path Originale | Nuovo Path (Fix) | Stato |
| :--- | :--- | :--- | :--- |
| **Mostri (Actor)** | `system.description` | `system.notes` (Array) | ✅ Visibile in "Dettagli" |
| **Magia (Item)** | `system.description` | `system.effect` | ✅ Visibile in "Effetto" |
| **Alchimia (Item)** | `system.description` | `system.effect` | ✅ Visibile in "Effetto" |
| **Equipaggiamento** | `system.description` | `system.description` | ✅ Confermato |

## 📊 Impatto del Fix
- **File Modificati**: **352** file JSON di origine (`src-packs`).
- **Pack Rigenerati**: Tutti i 14 pack `.db` sono stati ricompilati.
- **Validazione**: Testato con successo su *Katakan* (Actor) e *Aenye* (Spell).

## 🔍 Note per il Test Visivo
1.  **Actor/Mostri**: Apri la scheda del mostro, vai nel tab **Dettagli**. Troverai una nota chiamata **"Descrizione"** con il testo narrativo.
2.  **Item/Magia/Alchimia**: Il testo apparirà ora direttamente nel box **"Effetto"** della scheda.
3.  **Item/Armi/Armature**: La descrizione rimane nel campo standard. Se non è visibile, assicurati di cliccare sull'intestazione della sezione "Descrizione" nella scheda per espanderla.

**STATUS: FIX VERIFICATO E PRONTO PER IL RE-DEPLOY.**
