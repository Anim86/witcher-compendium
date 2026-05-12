# 🔍 Audit Approfondito Asset Mancanti
**Data**: 10 Maggio 2026

Ho effettuato un'indagine incrociando i file generati presenti nella cartella `assets/` e i report del tool `asset_guard.mjs`. Dei **376 asset** segnalati come mancanti da Foundry, la situazione si divide in due categorie specifiche che spiegano l'accaduto.

## 1. Asset Generati ma "Disallineati" (180 Elementi)
Queste immagini **sono state generate** da te e sono presenti fisicamente in `assets/`, ma Foundry non le trova perché:
- **Differenza di Cartella / Nomenclatura**: Ad esempio, per gli Schemi di Fabbricazione come `Schema: Accetta`, il JSON si aspetta di trovare il file dentro `witcher-schematics/Accetta.webp`, ma l'immagine è stata inserita (correttamente dal punto di vista semantico) in `witcher-weapons/accetta.webp`.
- **Tassonomia dei Trofei**: I trofei (es. `Trofeo: Arachas`) si aspettano immagini specifiche in `witcher-trophies/Trofeo_Arachas.webp`, ma l'asset si trova in `witcher-monsters/arachas.webp`.
- **Maiuscole/Minuscole (Case Sensitivity)**: Alcuni file salvati a mano sono tutti in minuscolo (es. `accetta.webp`), ma gli script JSON si aspettano la prima lettera maiuscola (`Accetta.webp`), causando errori di caricamento.

## 2. Asset Mai Generati (196 Elementi)
L'altra metà degli asset risulta **completamente assente**. Facendo una ricerca nei vecchi file `prompts_batch_*.html` (i file che hai usato per generare con Gemini), ho scoperto che **questi elementi non sono mai stati inseriti nelle liste di prompt da disegnare**. 
Questo spiega perché sei sicuro di aver generato tutto ciò che ti era stato chiesto: hai completato tutti i batch forniti, ma all'origine i batch stessi *avevano omesso* alcune categorie intere!

Qualche esempio di categorie mai inviate ai batch AI:
- **Magie e Incantesimi**: `Acquazzone`, `Adenydd`, `Dissipazione`, `Dividere le Acque`... (non sono mai finiti in nessun batch).
- **Razze e Skill Base**: `Elfi`, `Nani`, `Umani`, e la maggior parte delle Abilità (`Atletica`, `Carisma`, `Lanciare Incantesimi`).
- **Ferite Critiche**: `Braccio Fratturato`, `Costole Incrinate`, ecc.

---

### 🛠️ Come procediamo?
1. **Per i 180 "Disallineati"**: Posso scrivere uno script custom che vada a rinominare/spostare automaticamente le immagini esistenti, oppure che forzi i file JSON a puntare alle immagini esistenti che ho già individuato.
2. **Per i 196 "Mai Generati"**: Posso generare per te i **Batch 64, 65, 66...** in modo che tu possa produrre finalmente le immagini che non ti erano mai state chieste! 

Cosa preferisci affrontare per primo? Iniziamo a correggere i 180 esistenti o prepariamo i batch per quelli mai generati?
