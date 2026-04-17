const fs = require('fs');
const filepath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TheWitcherItaNewSystem/styles/wizard.css';
let css = fs.readFileSync(filepath, 'utf8');

// 1. Fix bgmago.png
css = css.replace('bgmago.png', 'bgmago.webp');

// 2. Fix cards size
const cardTarget = `.witcher-wizard .race-card,\r\n.witcher-wizard .profession-card {\r\n    background: rgba(255, 255, 255, 0.4);\r\n    border: 2px solid var(--wizard-border);\r\n    border-radius: 8px;\r\n    padding: 15px;\r\n    text-align: center;\r\n    cursor: pointer;\r\n    transition: all 0.3s ease;\r\n    display: flex;\r\n    flex-direction: column;\r\n    align-items: center;\r\n    gap: 10px;\r\n    box-shadow: 0 4px 6px var(--wizard-shadow);\r\n    min-height: 450px;\r\n    height: 100%;\r\n    overflow: visible;\r\n}`;
const cardTargetLF = cardTarget.replace(/\r\n/g, '\n');

const cardReplace = `.witcher-wizard .race-card,
.witcher-wizard .profession-card {
    background: rgba(255, 255, 255, 0.4);
    border: 2px solid var(--wizard-border);
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 6px var(--wizard-shadow);
    height: fit-content;
    width: fit-content;
    overflow: visible;
}`;

if (css.includes(cardTarget)) {
    css = css.replace(cardTarget, cardReplace.replace(/\n/g, '\r\n'));
} else if (css.includes(cardTargetLF)) {
    css = css.replace(cardTargetLF, cardReplace);
} else {
    console.warn("Card target not found");
}

// 3. Fix text shadow
const shadowTargetLF = `/* Fix contrast per label punti */\n.witcher-wizard .points-label {\n    text-shadow: 0 1px 3px rgba(0,0,0,0.8);\n}`;
const shadowTargetCRLF = shadowTargetLF.replace(/\n/g, '\r\n');
const shadowReplaceLF = `/* Fix contrast per label punti */\n.witcher-wizard .points-label {\n    text-shadow: none !important;\n}`;

if (css.includes(shadowTargetLF)) {
    css = css.replace(shadowTargetLF, shadowReplaceLF);
} else if (css.includes(shadowTargetCRLF)) {
    css = css.replace(shadowTargetCRLF, shadowReplaceLF.replace(/\n/g, '\r\n'));
} else {
    console.warn("Shadow target not found. Did it match? ", css.includes('text-shadow: 0 1px 3px rgba(0,0,0,0.8);'));
}

fs.writeFileSync(filepath, css);
console.log('Done css fix');
