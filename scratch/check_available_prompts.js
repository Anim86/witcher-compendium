const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-lore';

function cleanDescription(html) {
    if (!html) return '';
    // Strip HTML
    let text = html.replace(/<[^>]*>/g, '').trim();
    // Fix hyphenated words from OCR (e.g. "omo- nima" -> "omonima")
    text = text.replace(/(\b\w+)-\s*\n?\s*(\w+)/g, '$1$2');
    // Replace multiple spaces/newlines with a single space
    text = text.replace(/\s+/g, ' ');
    return text;
}

// Test with Accademia di Ban Ard
const banArdFile = path.join(srcDir, 'accademia_di_ban_ard_feb8d88305ecf65d.json');
const banArd = JSON.parse(fs.readFileSync(banArdFile, 'utf8'));
const rawText = banArd.system.description;
const cleanedText = cleanDescription(rawText);

console.log("=== CLEANED JSON BAN ARD ===");
console.log(cleanedText);
console.log("============================");
