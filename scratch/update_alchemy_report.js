const fs = require('fs');
const path = require('path');

const reportPath = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\TO DO\\report_alchimia_e_artigianato.md';

if (!fs.existsSync(reportPath)) {
  console.error("Report file not found!");
  process.exit(1);
}

let content = fs.readFileSync(reportPath, 'utf8');

console.log("Original content length:", content.length);

// 1. Correzione Prodotti Alchemici (Da component a valuable)
const alchItemsToValuable = [
  "Allucinogeno", "Amico dell'Avvelenatore", "Cloroformio", "Colla Alchemica",
  "Erbe Anestetiche", "Fisstech", "Fluido Sterilizzante", "Inchiostro Invisibile",
  "Lacrime di Talgar", "Polvere Basica", "Polvere Coagulante",
  "Pozione di Lacrime di Mogli", "Pozione Profumo", "Respiro di Succube",
  "Sali da Fiuto", "Soluzione Acida", "Veleno Nero"
];

let alchCount = 0;
alchItemsToValuable.forEach(item => {
  const target = `| **${item}** | Alchimia | Ingrediente Alchemico (component) |`;
  const replacement = `| **${item}** | Alchimia | Pozione / Olio / Elisir (valuable) |`;
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log(`Updated Alchimia item: ${item} -> valuable`);
    alchCount++;
  } else {
    console.warn(`WARNING: Could not find Alchimia target for: "${item}"`);
  }
});

// 2. Correzione Schemi e Formule (Da valuable a diagrams)
// Let's use regex to find "| **Schema: Schema ...** | Schemi | Schema di Artigianato (valuable) |"
const schemaRegex = /(\|\s+\*\*Schema:\s+Schema\s+[^*]+\*\*\s+\|\s+Schemi\s+\|\s+Schema di Artigianato\s+\()valuable(\)\s+\|)/g;

let schemaCount = 0;
content = content.replace(schemaRegex, (match, p1, p2) => {
  schemaCount++;
  console.log(`Updated Schema: ${match.split('|')[1].trim()} -> diagrams`);
  return p1 + "diagrams" + p2;
});

// 3. Correzione Ingredienti Organici (Da valuable a component)
const organicItems = [
  { name: "Denti di Gatto Mannaro", from: "Componente di Origine Animale / Mostro (valuable)", to: "Componente di Origine Animale / Mostro (component)" },
  { name: "Saliva di Alp", from: "Componente di Origine Animale / Mostro (valuable)", to: "Componente di Origine Animale / Mostro (component)" },
  { name: "Stomaco di Glustyworp", from: "Componente di Origine Animale / Mostro (valuable)", to: "Componente di Origine Animale / Mostro (component)" }
];

let organicCount = 0;
organicItems.forEach(item => {
  const target = `| **${item.name}** | Componenti | ${item.from} |`;
  const replacement = `| **${item.name}** | Componenti | ${item.to} |`;
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log(`Updated Organic ingredient: ${item.name} -> component`);
    organicCount++;
  } else {
    console.warn(`WARNING: Could not find Organic target for: "${item.name}"`);
  }
});

fs.writeFileSync(reportPath, content, 'utf8');
console.log(`\nReplacement complete!`);
console.log(`- Alchimia (component -> valuable): ${alchCount} updated`);
console.log(`- Schemi (valuable -> diagrams): ${schemaCount} updated`);
console.log(`- Organic (valuable -> component): ${organicCount} updated`);
console.log("New content length:", content.length);
