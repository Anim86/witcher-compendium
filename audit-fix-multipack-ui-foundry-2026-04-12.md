# Audit + Fix Report — Multipack UI/Contenuti
**Data:** 12 Aprile 2026
**Progetto:** witcher-compendium
**Stato:** Bonifica completata (Sorgenti JSON e Registrazione)

## 1. Pack Controllati e Stato Finale

| Pack | Stato | Azioni Eseguite |
| :--- | :--- | :--- |
| **witcher-skills** | ✅ OK | Corretto label "Abilit" in "Abilità" in `module.json`. |
| **witcher-transports** | ✅ OK | Corretti 18 JSON. Tipo impostato su `mount` o `valuable`. Fix schema v14. |
| **witcher-trophies** | ✅ OK | Corretti 33 JSON. Tipo impostato su `valuable`. Rimosso subfolder errato. |
| **witcher-gifts** | ✅ OK | Ripopolate 14 voci da *Tomo del Caos* (TC 74-75). Tipo `note`. |
| **witcher-alchemy** | ✅ OK | Deduplicazione completata. 184 file processati e consolidati. |
| **witcher-lore** | ✅ OK | Corretti 36 JSON. Fix ID (16 hex), coreVersion (int) e rimozione systemVersion. |
| **witcher-components** | ✅ OK | Corretti 52 JSON. Tipo impostato su `component`. Fix schema v14. |

## 2. Dettagli Fix UI

### witcher-skills
- **Refuso:** Il campo `label` in `module.json` riportava "Abilit".
- **Correzione:** Aggiornato a "Abilità". Uniformato il naming per la corretta visualizzazione nel tab Compendi di Foundry.

### witcher-trophies (Gerarchia Folder)
- **Modifica:** In `setup-folders.js`, è stata rimossa la creazione della cartella intermedia "Trofei".
- **Risultato:** Il pack è ora assegnato direttamente a `EQUIPAGGIAMENTO / Tomo del Caos`, eliminando la cartella autonoma fuori gerarchia.

## 3. Doni Magici (witcher-gifts)
Il pack è stato completamente ripristinato. Elenco voci reinserite:
- **Minori:** Minuscola Illusione, Aura di Paura, Piedi Rapidi, Calmare Animali, Pigmento, Pollice Verde.
- **Maggiori:** Aerocinesi, Migliorare Arma, Criocinesi, Percepire Veleno, Fortificare, Pirocinesi, Vedere Aura, Geocinesi.

## 4. Alchimia (witcher-alchemy) — Deduplicazione
Sono stati rimossi i duplicati reali (file con prefisso nome identico ma ID diverso). 
- **Esempio:** `Aconito_52dae8c18c5ae10f.json` mantenuto, `Aconito_b22895f03c8540ae.json` rimosso.
- È stata mantenuta la versione con il blocco `system` più completo.

## 5. Cause Fix "Non si apre"
I problemi di apertura delle schede sono stati risolti intervenendo su:
- **Type:** Rimossi tipi generici `item` non supportati; mappati su `mount`, `valuable`, `component`, `alchemical` o `note`.
- **_stats:** Inserito `coreVersion: 14` come intero.
- **_id:** Generati nuovi UUID esadecimali di 16 caratteri dove non conformi.
- **systemVersion:** Rimossa per evitare conflitti con la versione del modulo.

## 6. File Modificati
- `witcher-compendium/module.json`
- `witcher-compendium/scripts/setup-folders.js`
- Tutti i file JSON nelle cartelle sorgente dei pack indicati.

---
> [!IMPORTANT]
> **CONFERMA FINALE:** NESSUNA compilazione dei database (.db) è stata eseguita. I fix sono applicati esclusivamente ai file sorgente JSON.
