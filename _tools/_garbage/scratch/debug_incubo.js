const fs = require('fs');
const path = require('path');
const file = 'E:/AntigravitiProgetti/CompendioTheWitcher/Manuali/Witcher-v1.3_Estrazione/Testi/Pag120_L120_Fatture.txt';

let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\r\n/g, ' ').replace(/\n/g, ' ');

const nameRegex = /L'Incubo/gi;
let match;
while ((match = nameRegex.exec(content)) !== null) {
    console.log("Match:", match[0], "at index", match.index);
    const searchArea = content.substring(match.index + match[0].length, match.index + match[0].length + 100);
    console.log("Search Area:", searchArea);
    
    const costRegex = /Costo(?:[\s]+in)?[\s]*(?:RES|STA|Vigore|Resistenza)[\s]*:[\s]*(\d+|Var|Variabile)/i;
    const costMatch = searchArea.match(costRegex);
    if (costMatch) {
        console.log("Found cost:", costMatch[1]);
    } else {
        console.log("No cost match in search area");
    }
}
