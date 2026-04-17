const fs = require('fs');
const filepath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TheWitcherItaNewSystem/styles/wizard.css';
let css = fs.readFileSync(filepath, 'utf8');

const newStyles = `
/* ── Step 6: Professional Gear Sections ────────────────── */
.witcher-wizard .profession-dotazione {
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid var(--wizard-border);
    border-left: 5px solid var(--wizard-accent);
    padding: 15px;
    margin-bottom: 20px;
    height: auto !important;
    width: 100%;
}

.witcher-wizard .choose-hint {
    font-size: 0.9rem;
    color: var(--wizard-text-muted);
    font-style: italic;
    margin-left: 10px;
}

.witcher-wizard .profession-gear-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.witcher-wizard .gear-item-mini {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 4px 10px;
    border: 1px solid var(--wizard-border);
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    position: relative;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.witcher-wizard .gear-item-mini:hover {
    background: rgba(139, 0, 0, 0.05);
    border-color: var(--wizard-accent);
}

.witcher-wizard .gear-item-mini.selected {
    background: var(--wizard-accent);
    color: white !important;
    border-color: var(--wizard-accent);
}

.witcher-wizard .gear-item-mini.selected .name {
    color: white !important;
}

.witcher-wizard .gear-item-mini img {
     width: 24px;
     height: 24px;
     object-fit: contain;
}

.witcher-wizard .gear-item-mini.missing {
    opacity: 0.6;
    border-style: dashed;
}

.witcher-wizard .badge-fixed {
    font-size: 0.65rem;
    text-transform: uppercase;
    background: #444;
    color: white;
    padding: 1px 4px;
    border-radius: 3px;
}

.witcher-wizard [data-action="toggleProfessionGear"] {
    cursor: cell;
}
`;

// Append or insert before some specific section
css += "\n" + newStyles;

fs.writeFileSync(filepath, css);
console.log('Done CSS');
