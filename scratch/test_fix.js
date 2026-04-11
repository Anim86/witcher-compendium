const fs = require('fs');

const filePath = `c:\\Users\\apaci\\Desktop\\Script\\witcher-compendium-main\\_tools\\src-packs\\MAGIA\\base\\witcher-spells\\Acquazzone_402d36bee857486c.json`;
let content = fs.readFileSync(filePath, 'utf8');

// The pattern is basically (à)(.)
// We want to keep the (.) and discard the (à)
// We use a regex that matches à and the next character
let fixed = content.replace(/à(.)/g, '$1');

// Special case for real accented characters that were double-encoded
// e.g. Ãà  which should be à
// Actually, if we remove the à in the middle of Ãà  we get Ã 
// And Ã  is the UTF-8 sequence for à (C3 A0)
fixed = fixed.replace(/Ã /g, 'à');
fixed = fixed.replace(/Ã¹/g, 'ù');
fixed = fixed.replace(/Ã²/g, 'ò');
fixed = fixed.replace(/Ã¬/g, 'ì');
fixed = fixed.replace(/Ã¨/g, 'è');
fixed = fixed.replace(/Ã©/g, 'é');

console.log(fixed.substring(0, 500));
