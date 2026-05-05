const fs = require('fs');

const prompts41 = [
  "Digital painting, character portrait of Iorveth, a fierce elven Scoia'tael commander, scarred face partially covered by a red bandana, wearing woodland guerrilla armor, holding a finely crafted elven bow, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Lady Fortuna of the Katakan society, a wealthy human noblewoman with light brown skin and green eyes, wearing a black silk katakan mask, long black hair adorned with silver pins, an elegant tight black dress, white silk gloves, and a black metal necklace with a white diamond, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Layton Hermann, a rugged Northern merchant-warrior, wearing a thick fur-lined travel cloak over sturdy brigandine armor, holding a heavy crossbow, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of the Witch of Lynx Crag, a sinister and mysterious old hag draped in tattered dark forest robes, adorned with animal bones and fetishes, eyes glowing with eerie chaotic magic, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of The Sorceress of the Katakan society, an elegant and mysterious noble mage wearing an ornate dark velvet dress and a theatrical katakan mask, hands glowing with subtle arcane energy, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Leblanc de Surmann, a wealthy and arrogant Nilfgaardian nobleman, wearing a flawless black and gold doublet with a high ruffled collar, holding a silver goblet of wine with a condescending smirk, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Louise van Adelaide, the strong-willed founder of the Sorceresses of the High Mount, an elegant and extroverted mage wearing fine arcane robes, holding a glowing magical focus, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of The Jarl of the Katakan society, a tall man with dark smooth skin and grey eyes, wearing a katakan mask and a tight crimson tunic with silver Skellige runes, right arm amputated above the elbow, wearing a grey wolf pelt mantle fastened with a silver chain, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a powerful Northern Mage, wearing elaborate flowing robes adorned with glowing arcane runes, levitating a swirling sphere of elemental magic in their hands, intense gaze, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Margarita Laux-Antille, a flawlessly beautiful and ambitious sorceress and former rectress of Aretuza, wearing a stunningly elegant dress, exuding authority and magical power, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Mikaela of the Iron Maidens, a fierce Skellige shieldmaiden of Clan An Craite, wearing sturdy chainmail and thick furs, face painted with traditional clan tattoos, holding a heavy battle axe, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Pardus of Korath, a deadly and weathered desert warrior from the Korathi desert, wearing practical sun-bleached robes over leather armor, carrying curved exotic blades, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Prinny Prin-Prin of the Katakan society, a bubbly young woman wearing a pink katakan mask, long golden blonde hair tied with pink and white ribbons, large blue eyes, wearing a voluminous and frilly pink silk dress adorned with lace and flowers, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Dandelion the famous bard, wearing a flamboyant plum-colored doublet and a tilted hat with an egregiously large heron feather, holding his lute with a dramatic and exaggerated heroic pose, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Rhundin of the Mahakaman Artisans, a sturdy dwarf with light green eyes, short salt-and-pepper curly hair, thick grey mustache and a waist-length beard, tanned skin, wearing high-quality merchant clothes and gold-rimmed glasses, writing on a parchment, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Rodolf Kazmer, a grizzled dwarven merchant and veteran, covered in practical travel gear and mail, thick beard, carrying a heavy crossbow and a ledger, smoking a pipe, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Skuld, leader of the Iron Maidens, light blue eyes, bright red hair in a braid, pale skin with a scar from bottom lip to chin, wearing leather and mail armor decorated with bear fur and blue Skellige runes, tall and muscular, iron sword on her back, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Thora of the Iron Maidens, a resilient Skellige shieldmaiden of Clan An Craite, wearing battle-worn chainmail and bear fur, gripping a wooden round shield and a broadsword, fierce expression, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Varin of the Claremont Quintet, an elven warrior and former Nilfgaardian soldier, wearing practical dark armor blending elven craftsmanship with Nilfgaardian military discipline, sharp vigilant eyes, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of Vernon Roche, the stern human commander of the Temerian Blue Stripes special forces, wearing a practical chaperon hat and a blue and silver tunic over chainmail, gripping a Temerian steel sword, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus."
];

function updateHtmlFile(filePath, newPrompts) {
  let content = require('fs').readFileSync(filePath, 'utf8');
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
  
  require('fs').writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

updateHtmlFile('scratch/prompts_batch_41.html', prompts41);
