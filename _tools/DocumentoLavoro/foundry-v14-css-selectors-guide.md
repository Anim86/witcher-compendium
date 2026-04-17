# Guida: CSS Selectors per Schede ApplicationV2 in Foundry V14

## Problema Affrontato
Durante il restyling della scheda personaggio (`WitcherCharacterSheet`), tutti i selettori CSS con `.character-v2` venivano ignorati dal browser nonostante i file fossero aggiornati correttamente.

---

## Causa Radice: Concatenazione degli Array di Classi

Foundry V14 (`ApplicationV2`) **NON sostituisce** gli array `classes` lungo la catena ereditaria — li **concatena** e poi deduplicita via `Set`.

### Codice Foundry responsabile (`foundry.mjs` ~riga 30087):
```javascript
static #mergeApplicationOptions(options, opts) {
    for ( const [k, v] of Object.entries(opts) ) {
        const v0 = options[k];
        if ( Array.isArray(v0) ) options[k].push(...v1);  // ← CONCATENA, non sostituisce
        else if ( foundry.utils.isPlainObject(v0) ) { ... }
        else options[k] = v1;
    }
}
```

### Come si forma la classe CSS finale

Per `WitcherCharacterSheet` la catena è:
```
ApplicationV2         → classes: []
ActorSheetV2          → classes: ['sheet']
WitcherActorSheet     → classes: ['witcher', 'sheet', 'actor']
WitcherCharacterSheet → classes: ['witcher', 'sheet', 'actor', 'character-v2']
```

Dopo concatenazione + deduplicazione + aggiunta di `application`:
```
✗ Atteso:   application witcher sheet actor character-v2
✓ Reale:    application sheet witcher actor monster monster-v2
```

> **Nota**: `monster` e `monster-v2` compaiono perché i mixin e le classi parent della catena contribuiscono ulteriori classi. La classe `character-v2` viene sovrascritta o non emerge come atteso.

---

## Come Verificare le Classi Reali

**Metodo 1 – DevTools Browser (F12 → Elements):**
Aprire la scheda in Foundry, ispezionare l'elemento radice `<form id="WitcherCharacterSheet-...">` e leggere l'attributo `class`.

**Metodo 2 – Console Browser:**
```javascript
document.querySelector('[id^="WitcherCharacterSheet"]')?.className
```

**Metodo 3 – Leggere il codice Foundry:**
In `foundry.mjs` cercare `#mergeApplicationOptions` e tracciare manualmente la catena ereditaria della sheet.

---

## Soluzione Applicata

Sostituire il selettore CSS con la **classe reale** presente nel DOM:

```css
/* ✗ SBAGLIATO — usa la classe dichiarata nel codice JS, NON quella reale */
.application.sheet.witcher.actor.character-v2 .window-content { ... }

/* ✓ CORRETTO — usa la classe reale verificata con DevTools */
.application.sheet.witcher.actor.monster-v2 .window-content { ... }
```

---

## Struttura DOM di ApplicationV2 (Foundry V14)

```
<form class="application sheet witcher actor monster monster-v2">
  <header class="window-header">...</header>
  <section class="window-content">
    <!-- Ogni PART ha data-application-part sul suo elemento radice -->
    <div class="char-sidebar" data-application-part="sidebar">...</div>
    <div class="char-main-wrapper">   ← wrapper aggiunto via _onFirstRender()
      <div data-application-part="header">...</div>
      <nav data-application-part="tabs">...</nav>
      <section data-application-part="stats">...</section>
    </div>
  </section>
  <div class="window-resize-handle"></div>
</form>
```

### Selettori affidabili per i PARTS:
```css
/* ✓ Selettore per parte specifica */
[data-application-part="sidebar"] { ... }
[data-application-part="header"]  { ... }
[data-application-part="tabs"]    { ... }
[data-application-part="stats"]   { ... }
```

> **Attenzione**: `data-application-part` viene impostato sul **primo elemento figlio** del template HBS, non su un wrapper aggiunto da Foundry.

---

## Layout a Due Colonne: Soluzione Robusta

Il CSS Grid su `.window-content` non funziona in modo affidabile perché Foundry sovrascrive `display` con `flex`. La soluzione adottata usa:

1. **JavaScript (`_onFirstRender`)** — ristruttura il DOM avvolgendo i parts non-sidebar in `.char-main-wrapper`
2. **CSS Flex Row** — `.window-content { flex-direction: row }`, sidebar a larghezza fissa, main wrapper a `flex: 1`

```javascript
// In WitcherCharacterSheet.js
_onFirstRender(context, options) {
    const content = this.element.querySelector('.window-content');
    if (!content || content.querySelector('.char-main-wrapper')) return;
    const sidebar = content.querySelector('[data-application-part="sidebar"]');
    if (!sidebar) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'char-main-wrapper';
    Array.from(content.children).forEach(child => {
        if (child !== sidebar) wrapper.appendChild(child);
    });
    content.appendChild(wrapper);
}
```

```css
/* In sheet.css */
.application.sheet.witcher.actor.monster-v2 .window-content {
    display: flex !important;
    flex-direction: row !important;
}

.application.sheet.witcher.actor.monster-v2 .char-sidebar {
    flex: 0 0 280px !important;
}

/* ✓ SOLUZIONE OTTIMALE PER IL WRAPPER PRINCIPALE: CSS GRID */
.application.sheet.witcher.actor.monster-v2 .char-main-wrapper {
    flex: 1 !important;
    display: grid !important;
    /* Forza header e tabs in alto (auto), contenuto occupa il resto (1fr) */
    grid-template-rows: auto auto 1fr !important; 
    gap: 0 !important;
    overflow: hidden !important;
}

[data-application-part="header"],
[data-application-part="tabs"] {
    margin: 0 !important; /* Previene gap indesiderati */
}
```

---

## Troubleshooting: Gap tra Header e Tabs

Se compare uno spazio vuoto (solitamente nero o del colore del background) tra l'header e la navigazione dei tab:

1.  **Causa**: In `ApplicationV2`, i componenti flex tendono a distribuirsi o espandersi se non vincolati.
2.  **Rilevamento**: Ispezionare se `.char-main-wrapper` ha `height` maggiore della somma dei suoi figli.
3.  **Fix**: Utilizzare `grid-template-rows: auto auto 1fr` invece di `flex-direction: column`. Questo garantisce che i primi due elementi prendano solo l'altezza necessaria.
4.  **Check**: Assicurarsi che nessuna `PART` abbia `flex: 1` se non è la parte del contenuto principale (stats, inventory, etc.).

---

## Mixin e Classi "Monster" (Il Caso Witcher)

In alcuni sistemi (come questo), la scheda personaggio eredita classi da mixin o parent classes che aggiungono `.monster` o `.monster-v2` nel DOM.

**Regola d'oro**: Ispezionare SEMPRE il DOM. Se il browser dice che la classe è `monster-v2`, usare `monster-v2` nel CSS anche se si sta lavorando su un Personaggio. È un comportamento di Foundry V14 legato alla concatenazione degli array `classes`.

---

## Regole per Nuove Schede

| Situazione | Azione |
|---|---|
| Nuova scheda con CSS che non si applica | Verificare le classi reali con DevTools **prima** di scrivere CSS |
| Layout a due colonne | Usare `_onFirstRender` + flex row invece di CSS Grid |
| Selettore scoped alla scheda | Usare la classe reale dal DOM, non quella dichiarata in JS |
| `display: grid !important` non funziona | Foundry sovrascrive display su `.window-content`; usare `flex` o DOM restructuring |

---

## Come Impedire il Problema in Futuro

1. **Prima di scrivere CSS per una nuova scheda**: aprirla in Foundry, copiare le classi dell'elemento radice con DevTools, usare quelle come selettore base.

2. **Non fidarsi di `DEFAULT_OPTIONS.classes`** come selettore CSS — la classe reale dipende dall'intera catena ereditaria.

3. **Template check rapido** (aggiungere alla checklist di sviluppo):
   ```javascript
   // Nella console di Foundry, con la scheda aperta:
   Hooks.on('renderWitcherCharacterSheet', (app) => console.log(app.element.className));
   ```

4. **Documentare la classe reale** nel file CSS come commento:
   ```css
   /* Selector basato su classe reale DOM: application sheet witcher actor monster monster-v2 */
   /* NON usare character-v2 — viene sovrascritto dalla catena ereditaria Foundry V14 */
   .application.sheet.witcher.actor.monster-v2 { ... }
   ```
