# Witcher TRPG Compendium (Italian Edition) 🐺✨

[![Foundry VTT Version](https://img.shields.io/badge/Foundry-v14-orange)](https://foundryvtt.com/)
[![System Version](https://img.shields.io/badge/System-v14.0.5-blue)](https://github.com/Anim86/witcher-compendium)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Benvenuto nel compendio italiano definitivo per **The Witcher TRPG** su Foundry VTT! Questo repository offre un'esperienza premium, completamente tradotta e ottimizzata per la versione 14 di Foundry.

---

## 🛠️ Architettura del Progetto

Il progetto è strutturato in due componenti sinergiche:

1.  **[TheWitcherItaNewSystem](./TheWitcherItaNewSystem)** ⚔️
    *   Il cuore pulsante del gioco.
    *   Ottimizzato per evitare conflitti con altre versioni del sistema.
    *   Interfaccia pulita e supporto completo alle regole italiane.

2.  **[witcher-compendium](./witcher-compendium)** 📚
    *   Oltre **670 voci** di contenuti tradotti.
    *   Include Razze, Professioni, Armi, Magie e Bestiario.
    *   Integrazioni esclusive dal *Tomo del Caos*.

---

## 📦 Installazione Rapida

Puoi installare tutto direttamente in Foundry VTT utilizzando i seguenti **Manifest URL**:

### 1. Sistema di Gioco (Core)
Vai in **Game Systems** -> **Install System** e usa:
```
https://raw.githubusercontent.com/Anim86/witcher-compendium/main/TheWitcherItaNewSystem/system.json
```

### 2. Modulo Compendio (Contenuti)
Vai in **Add-on Modules** -> **Install Module** e usa:
```
https://raw.githubusercontent.com/Anim86/witcher-compendium/main/witcher-compendium/module.json
```

---

## 🌟 Caratteristiche Premium

*   🇮🇹 **Sempre in Italiano**: Traduzione curata di ogni singola voce e descrizione.
*   📖 **Riferimenti Manuali**: Ogni oggetto o mostro include il riferimento alla pagina del manuale originale (MB/TC).
*   🚀 **Ottimizzato per v14**: Sfrutta le ultime performance di Foundry VTT per caricamenti istantanei.
*   🖼️ **Asset Personalizzati**: Icone e banner ridisegnati per un look moderno e immersivo.

---

## 📂 Per gli Sviluppatori

Se desideri contribuire o personalizzare il sistema, i tool necessari si trovano nella cartella **[_tools](./_tools)**:
*   **`raw-data`**: Dati JSON grezzi estratti dai manuali.
*   **`src-packs`**: Sorgenti dei pacchetti per la ricompilazione.
*   **`scripts`**: Script di utilità per il mining e la formattazione dei dati.

> [!TIP]
> **Asset Naming Standard**: Tutte le immagini devono seguire la logica `slugify` (lowercase, underscores only, no special characters). Usa `_tools/scripts/normalize_asset_filenames.mjs` per mantenere il repository pulito.

---

## 👥 Crediti

*   **Zolt** - Sviluppo Core e Content Curation.
*   **Anim** - Architettura Forge e Packaging.
*   **Antigravity** - Automazione e Integrazione AI.

*Un ringraziamento speciale ai creatori originali Stexinator e einToastbrot su cui questo lavoro si basa.*

---

*Witcher TRPG Compendium - Per una caccia ai mostri più epica!* 🗡️👹
