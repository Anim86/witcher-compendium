const fs = require('fs');

const prompts60 = [
  "Digital painting, character portrait of an Entertainer, a charismatic performer wearing a colorful theatrical outfit, holding juggling balls and flashing a bright dramatic smile, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Laborer, a robust and hardworking commoner covered in sweat and dirt, wearing coarse woven clothes and a heavy leather apron, resting a large wooden crate on their shoulder, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Thief, a stealthy and agile rogue hiding in the shadows, face partially obscured by a dark hood, wearing dark leather armor and holding a set of intricate lockpicks, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Sailor, a weather-beaten and rugged seafarer with a thick beard and salt-stained skin, wearing a woolen cap and a striped tunic, holding a thick mooring rope, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Doctor, a focused and practical healer wearing a blood-stained leather apron over a clean tunic, holding a sharp surgical scalpel and a glass vial of sterilized fluid, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Mercenary, a battle-hardened sellsword covered in minor scars, wearing pragmatic mismatched armor pieced together from various campaigns, resting a heavy broadsword on their shoulder, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Noble, a wealthy and arrogant aristocrat wearing an opulent silk doublet with fine gold embroidery, fingers adorned with heavy signet rings, looking down with a condescending glare, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Politician, a shrewd and calculating diplomat wearing rich but understated courtly robes, holding a rolled parchment with an official wax seal, flashing a deceptive diplomatic smile, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Preacher, a zealous and fanatical holy man wearing tattered grey religious robes and a large bronze holy symbol, arms raised in fervent prayer, eyes burning with devotion, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Prostitute, an alluring and observant courtesan wearing an elegant revealing silk dress and a delicate lace choker, holding a cup of wine with a knowing, seductive gaze, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Priestess of Melitele, a calm and practical holy woman wearing white robes with a grey wimple and a high bronze tiara, carrying a leather satchel of medical supplies, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Sage, a wise and elderly scholar wearing heavy layered robes and spectacles, holding a glowing ancient tome filled with forgotten elven history, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Hustler, a cunning and street-smart fixer wearing practical dark urban clothing, flipping a shiny gold coin with a sly confident smirk, leaning against a brick wall, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Slave, a weary and destitute captive with dirt-smudged skin and a heavy iron collar around their neck, wearing ragged coarse tunic, looking up with a glimmer of unbroken resilience, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Soldier, a disciplined and stern infantryman wearing standard military chainmail and a practical gambeson, holding a sturdy spear and a shield bearing a faint kingdom crest, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Spy, an enigmatic and unnoticeable informant blending into the background, wearing a dark hooded cloak over nondescript clothing, slipping a sealed letter into a hidden pocket, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of an Academy Student, an ambitious young magical apprentice wearing formal Aretuza school robes, carrying a heavy stack of thick arcane tomes, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Thug, a hulking and brutal street enforcer with a broken nose and thick muscles, wearing heavy studded leather armor and gripping a menacing wooden club with iron nails, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Con Artist, a smooth-talking swindler wearing flashy but slightly worn velvet clothes, holding up a clearly fake magical amulet with a persuasive and trustworthy grin, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
  "Digital painting, character portrait of a Vagabond, a rugged and travel-weary drifter wearing a thick patched cloak and a wide-brimmed hat, carrying a heavy travel pack and a sturdy walking staff, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus."
];

function updateHtmlFile(filePath, newPrompts) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
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
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

updateHtmlFile('scratch/prompts_batch_60.html', prompts60);
