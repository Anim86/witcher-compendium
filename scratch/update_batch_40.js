const fs = require('fs');

const prompts40 = [
  "Digital painting viewed from directly above, top-down perspective, an ancient parchment crafting schematic detailing the construction of a Peasant's Mallet, featuring ink blueprints of an iron and wax-reinforced heavy wooden maul, lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting viewed from directly above, top-down perspective, an ancient parchment crafting schematic detailing the construction of a Knight's Hammer, featuring precise ink diagrams of a spiked black steel hammer head and a hardened wood handle, lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting viewed from directly above, top-down perspective, an ancient parchment crafting schematic detailing the construction of a Partisan polearm, featuring detailed ink drawings of a broad black steel spearhead with lateral parrying blades, lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting viewed from directly above, top-down perspective, an ancient parchment crafting schematic detailing the forging of a Ducal Sword, featuring elegant ink blueprints of a finely crafted black steel blade and a gold-adorned ornate hilt, lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Aenarinn of the Claremont Quintet, a fierce female elven warrior with yellow-green eyes and dark brown hair shaved on the sides into a mohawk, light brown skin, wearing leather armor with a gold sun engraved on the pauldrons, a complex wyvern tattoo on her left arm, holding twin hand axes, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Annegina of Maribor, an elegant and wealthy Northern merchant woman wearing a luxurious velvet dress with rich embroidery, shrewd expression, holding a leather-bound ledger and a purse of coins, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Scoia'tael Archer, a fierce elven guerrilla fighter wearing practical green and brown woodland camouflage, face painted with jagged war markings, wearing a squirrel tail on a worn cap, drawing a finely crafted elven bow, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Arkam, a sturdy Mahakaman dwarven artisan, thick braided beard covered in forge soot, wearing heavy leather blacksmith aprons and iron-reinforced gauntlets, holding a glowing forging hammer, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Asdis of the Iron Maidens, a fierce Skellige shieldmaiden, long braided hair, wearing chainmail and heavy furs, traditional Skellige tattoos on her face and arms, holding a heavy battle axe and a wooden round shield, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Brodgar Farrag, a grizzled veteran warrior, scarred face with a piercing gaze, wearing heavily dented brigandine armor and a dark heavy travel cloak, resting his hand on the pommel of a massive broadsword, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Catrin Preece, a highly intelligent and focused sorceress, wearing elegant but practical arcane robes, hands glowing with complex mixed-element magic runes, surrounded by floating magical tomes, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Clarisse de Claudine, a master alchemist and sorceress, wearing ornate dark robes, holding a glowing vial of alchemical liquid, surrounded by esoteric transmutation circles and distillation equipment, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Cooper Mawik, a proud Mahakaman dwarven warrior from a noble clan, wearing pristine dwarven plate armor with geometric engravings, thick fiery red beard, holding a heavy Mahakaman warhammer, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of \"Crogiolo\" Kowal, a hulking and brutal fighter-smith, thick muscles scarred from forge burns and tavern brawls, wearing a heavy studded leather vest, wielding a deadly Esboda sword and a hand crossbow, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Cultist of Coram Agh Tera, wearing sinister dark crimson and black hooded robes, a bronze mask resembling a terrifying lionheaded spider, holding a wicked sacrificial dagger dripping with blood, eerie green magic aura, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Cuor Nero, a mysterious and arrogant noble from the Katakan society, wearing lavish decadent dark velvet clothing, face hidden behind an ornate theatrical mask depicting a weeping black heart, looking down with condescension, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Dandelion acting as the 'Scourge of Dragons', wearing an extravagantly flamboyant plum-colored doublet and a tilted hat with an egregiously large heron feather, holding his lute like a weapon with a dramatic exaggerated heroic pose, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Enid Harkus, a formidable female Mahakaman dwarf, robust and proud, wearing finely tailored dwarven merchant clothes over a subtle chainmail shirt, intricate braids in her hair, holding a heavy ledger and an authoritative gaze, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Est Est, an eccentric and wealthy masked noble from the Katakan society, wearing opulent silks in gold and burgundy, face concealed by a beautifully disturbing golden masquerade mask, holding an exquisite wine goblet, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Francine Marchand, an elegant and cunning noblewoman from Toussaint, wearing a vibrant and flawlessly tailored court dress with fine lace and jewels, holding a delicate painted fan to hide a sly smile, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus."
];

function updateHtmlFile(filePath, newPrompts) {
  let content = fs.readFileSync(filePath, 'utf8');
  let promptIndex = 0;
  
  content = content.replace(/<div class="prompt-box"[^>]*>([\s\S]*?)<\/div>\s*<button onclick="copyToClipboard\('(.*?)', this\)">Copia Prompt<\/button>/g, (match, oldDivContent, oldBtnContent) => {
    if (promptIndex < newPrompts.length) {
      const newPrompt = newPrompts[promptIndex];
      const escapedPrompt = newPrompt.replace(/'/g, "\\'");
      const newMatch = match
        .replace(oldDivContent, newPrompt)
        .replace(oldBtnContent, escapedPrompt);
      promptIndex++;
      return newMatch;
    }
    promptIndex++;
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

updateHtmlFile('scratch/prompts_batch_40.html', prompts40);
