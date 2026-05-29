import fs from 'fs';
import path from 'path';

const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_schemi_asset.md';

const nameMapping = {
    // Swords
    "Spada d'Arme": { eng: "Arming Sword", feat: "precise technical sketches of blade geometry, crossguard assembly, and edge bevels", cat: "Spade e Lame" },
    "Spada di Ferro": { eng: "Iron Sword", feat: "precise technical sketches of blade geometry, crossguard assembly, and edge bevels", cat: "Spade e Lame" },
    "Spada da Cavalleria Vrihedd": { eng: "Vrihedd Cavalry Sword", feat: "precise technical sketches of curved blade geometry, crossguard assembly, and edge bevels", cat: "Spade e Lame" },
    "Spada Ducale": { eng: "Toussaint Ducal Sword", feat: "precise technical sketches of ornate hilt assembly and blade geometry", cat: "Spade e Lame" },
    "Spada Meteoritica": { eng: "Meteorite Sword", feat: "precise technical sketches of star-metal forging, crossguard assembly, and edge bevels", cat: "Spade e Lame" },
    "Esboda": { eng: "Esboda", feat: "precise technical sketches of blade geometry and hilt assembly", cat: "Spade e Lame" },
    "Falchion da Cacciatore": { eng: "Hunter's Falchion", feat: "precise technical sketches of a heavy curved blade and grip", cat: "Spade e Lame" },
    "Falcione Elfico": { eng: "Elven Falchion", feat: "precise technical sketches of elegant curved blade geometry and ornate grip", cat: "Spade e Lame" },
    "Flamberga": { eng: "Flamberge", feat: "precise technical sketches of a wavy blade geometry and massive crossguard", cat: "Spade e Lame" },
    "Gleddyf": { eng: "Nilfgaardian Gleddyf", feat: "precise technical sketches of a thin heavy blade and pommel assembly", cat: "Spade e Lame" },
    "Gwyhyr Gnomesca": { eng: "Gnomish Gwyhyr", feat: "precise technical sketches of a masterful razor-sharp blade geometry", cat: "Spade e Lame" },
    "Kord": { eng: "Elven Kord", feat: "precise technical sketches of blade geometry and hilt", cat: "Spade e Lame" },
    "Krigsverd": { eng: "Skellige Krigsverd", feat: "precise technical sketches of a hardened steel blade and lightweight grip", cat: "Spade e Lame" },
    "Lama del Tir Tochair": { eng: "Tir Tochair Blade", feat: "precise technical sketches of dwarven blade geometry and crossguard", cat: "Spade e Lame" },
    "Lama Vicovariana": { eng: "Vicovarian Blade", feat: "precise technical sketches of a heavy hilt and knightly blade geometry", cat: "Spade e Lame" },
    "Lama Viroledana": { eng: "Viroledan Blade", feat: "precise technical sketches of advanced blade geometry and exquisite crossguard", cat: "Spade e Lame" },
    "Messer Elfico": { eng: "Elven Messer", feat: "precise technical sketches of a single-edged blade and grip", cat: "Spade e Lame" },
    "Torrwr": { eng: "Gemmerian Torrwr", feat: "precise technical sketches of a massive brutal blade geometry", cat: "Spade e Lame" },
    "Costoliere": { eng: "Cutlass", feat: "precise technical sketches of a curved blade and hand-guard assembly", cat: "Spade e Lame" },

    // Axes and Polearms
    "Accetta": { eng: "Hand Axe", feat: "precise technical sketches of weight distribution, haft mounting, and striking head design", cat: "Asce, Martelli e Armi in Asta" },
    "Alabarda Rossa": { eng: "Redanian Halberd", feat: "precise technical sketches of the pole assembly, axe head, and rear spike", cat: "Asce, Martelli e Armi in Asta" },
    "Ascia da Battaglia": { eng: "Battle Axe", feat: "precise technical sketches of weight distribution, haft mounting, and heavy striking head design", cat: "Asce, Martelli e Armi in Asta" },
    "Ascia da Berserker": { eng: "Skellige Berserker Axe", feat: "precise technical sketches of a brutal striking head and grip wrappings", cat: "Asce, Martelli e Armi in Asta" },
    "Ascia Nanica": { eng: "Dwarven Axe", feat: "precise technical sketches of thick Mahakaman steel weight distribution and haft mounting", cat: "Asce, Martelli e Armi in Asta" },
    "Ascia Nera Gnomesca": { eng: "Gnomish Black Axe", feat: "precise technical sketches of advanced weight distribution and a dimeritium striking head", cat: "Asce, Martelli e Armi in Asta" },
    "Azza": { eng: "Poleaxe", feat: "precise technical sketches of the axe head, rear hammer, and top spike", cat: "Asce, Martelli e Armi in Asta" },
    "Lancia": { eng: "Spear", feat: "precise technical sketches of haft dimensions and metal tip mounting", cat: "Asce, Martelli e Armi in Asta" },
    "Lancia da Guerra": { eng: "War Spear", feat: "precise technical sketches of a heavy reinforced haft and broad metal tip", cat: "Asce, Martelli e Armi in Asta" },
    "Lancia Smussata": { eng: "Blunt Tourney Spear", feat: "precise technical sketches of haft dimensions and blunt wooden tip mounting", cat: "Asce, Martelli e Armi in Asta" },
    "Partigiana": { eng: "Partisan", feat: "precise technical sketches of the broad spearhead and lateral parrying flanges", cat: "Asce, Martelli e Armi in Asta" },
    "Maglio degli Altipiani": { eng: "Highlander Maul", feat: "precise technical sketches of a massive two-meter haft and iron hammer head", cat: "Asce, Martelli e Armi in Asta" },
    "Maglio del Contadino": { eng: "Peasant Maul", feat: "precise technical sketches of a crude wooden haft and heavy striking head", cat: "Asce, Martelli e Armi in Asta" },
    "Mannaia Nanica": { eng: "Dwarven Cleaver", feat: "precise technical sketches of a broad chopping blade and heavy weight distribution", cat: "Asce, Martelli e Armi in Asta" },
    "Martello d'Armi Mahakaman": { eng: "Mahakaman Warhammer", feat: "precise technical sketches of a dense steel striking head and armor-piercing spike", cat: "Asce, Martelli e Armi in Asta" },
    "Martello da Cavaliere": { eng: "Knight's Hammer", feat: "precise technical sketches of a one-handed haft and fluted striking head", cat: "Asce, Martelli e Armi in Asta" },
    "Mazza": { eng: "Mace", feat: "precise technical sketches of haft mounting and a flanged striking head", cat: "Asce, Martelli e Armi in Asta" },
    "Mazzafrusto Meteoritico": { eng: "Meteorite Flail", feat: "precise technical sketches of chain links and a spiked meteorite striking weight", cat: "Asce, Martelli e Armi in Asta" },
    "Mazzapicchio Nanico": { eng: "Dwarven Polehammer", feat: "precise technical sketches of a long haft and heavy armor-crushing head", cat: "Asce, Martelli e Armi in Asta" },

    // Bows and Crossbows
    "Arco Corto": { eng: "Short Bow", feat: "precise technical sketches of tension mechanisms, stringing, and limb curvature", cat: "Archi, Balestre e Armi a Distanza" },
    "Arco Lungo": { eng: "Longbow", feat: "precise technical sketches of large tension mechanisms, stringing, and long limb curvature", cat: "Archi, Balestre e Armi a Distanza" },
    "Arco da Guerra": { eng: "War Bow", feat: "precise technical sketches of heavy draw-weight tension mechanisms and reinforced stringing", cat: "Archi, Balestre e Armi a Distanza" },
    "Arco da Viaggio Elfico": { eng: "Elven Travel Bow", feat: "precise technical sketches of elegant tension mechanisms, stringing, and recurve limbs", cat: "Archi, Balestre e Armi a Distanza" },
    "Zefhar Elfico": { eng: "Elven Zefhar bow", feat: "precise technical sketches of advanced tension mechanisms and mastercrafted stringing", cat: "Archi, Balestre e Armi a Distanza" },
    "Balestra": { eng: "Crossbow", feat: "precise technical sketches of the trigger mechanism, prod tension, and stock", cat: "Archi, Balestre e Armi a Distanza" },
    "Balestra da Caccia": { eng: "Hunting Crossbow", feat: "precise technical sketches of the trigger mechanism, prod tension, and hunting stock", cat: "Archi, Balestre e Armi a Distanza" },
    "Balestra da Cacciatore di Mostri": { eng: "Monster Hunter Crossbow", feat: "precise technical sketches of a heavy winch mechanism, massive prod tension, and reinforced stock", cat: "Archi, Balestre e Armi a Distanza" },
    "Balestra Pesante Nanica": { eng: "Dwarven Heavy Crossbow", feat: "precise technical sketches of metal stock assembly and extreme prod tension", cat: "Archi, Balestre e Armi a Distanza" },
    "Balestrino": { eng: "Hand Crossbow", feat: "precise technical sketches of a compact trigger mechanism and small prod tension", cat: "Archi, Balestre e Armi a Distanza" },
    "Balestrino Gnomesco": { eng: "Gnomish Hand Crossbow", feat: "precise technical sketches of an advanced compact trigger mechanism", cat: "Archi, Balestre e Armi a Distanza" },
    "Munizioni Normali": { eng: "Standard Ammunition", feat: "precise technical sketches of arrow fletching, shaft measurements, and metal tips", cat: "Archi, Balestre e Armi a Distanza" },
    "Munizioni a Punta Larga": { eng: "Broadhead Ammunition", feat: "precise technical sketches of wide flesh-tearing metal tips and shaft measurements", cat: "Archi, Balestre e Armi a Distanza" },
    "Munizioni Smussate": { eng: "Blunt Ammunition", feat: "precise technical sketches of non-lethal wooden impact heads and shaft measurements", cat: "Archi, Balestre e Armi a Distanza" },
    "Coltelli da Lancio": { eng: "Throwing Knives", feat: "precise technical sketches of aerodynamic balance and blade weight distribution", cat: "Archi, Balestre e Armi a Distanza" },
    "Orione": { eng: "Orion throwing star", feat: "precise technical sketches of aerodynamic balance and sharpened points", cat: "Archi, Balestre e Armi a Distanza" },

    // Armors
    "Armatura a Piastre": { eng: "Plate Armor", feat: "precise technical sketches of metal articulation, riveting, and leather strapping with measurements", cat: "Armature, Elmi e Scudi" },
    "Armatura a Piastre Nilfgaardiana": { eng: "Nilfgaardian Plate Armor", feat: "precise technical sketches of black metal articulation, sun-emblem forging, and leather strapping", cat: "Armature, Elmi e Scudi" },
    "Armatura Pesante di Hindarsfjall": { eng: "Hindarsfjall Heavy Armor", feat: "precise technical sketches of thick Skellige metal plates, furs, and leather strapping", cat: "Armature, Elmi e Scudi" },
    "Bacinetto Temeriano": { eng: "Temerian Bascinet helmet", feat: "precise technical sketches of metal forging, visor mechanics, and head padding", cat: "Armature, Elmi e Scudi" },
    "Brache a Doppia Trama": { eng: "Double Woven Trousers", feat: "precise technical sketches of tailoring, seam reinforcement, and textile layers", cat: "Armature, Elmi e Scudi" },
    "Brache Corazzate": { eng: "Armored Trousers", feat: "precise technical sketches of leather tailoring, metal studding, and joint protection", cat: "Armature, Elmi e Scudi" },
    "Brache da Cavallerizzo": { eng: "Cavalry Trousers", feat: "precise technical sketches of reinforced inner thighs and leather tailoring", cat: "Armature, Elmi e Scudi" },
    "Brache Imbottite": { eng: "Padded Trousers", feat: "precise technical sketches of quilting, padding layers, and tailoring", cat: "Armature, Elmi e Scudi" },
    "Brigantina": { eng: "Brigandine armor", feat: "precise technical sketches of small steel plates riveted inside a heavy cloth garment", cat: "Armature, Elmi e Scudi" },
    "Brocchiero d'Acciaio": { eng: "Steel Buckler", feat: "precise technical sketches of shield boss forging and hand grip assembly", cat: "Armature, Elmi e Scudi" },
    "Brocchiero Gnomesco": { eng: "Gnomish Buckler", feat: "precise technical sketches of advanced compact defensive angles and metal forging", cat: "Armature, Elmi e Scudi" },
    "Camaglio": { eng: "Chainmail Coif", feat: "precise technical sketches of interlocking steel rings and neck articulation", cat: "Armature, Elmi e Scudi" },
    "Cappa Nanica": { eng: "Dwarven Cloak", feat: "precise technical sketches of heavy protective textiles and chainmail inserts", cat: "Armature, Elmi e Scudi" },
    "Cappuccio a Doppia Trama": { eng: "Double Woven Hood", feat: "precise technical sketches of thick textile tailoring and head protection", cat: "Armature, Elmi e Scudi" },
    "Cappuccio Corazzato": { eng: "Armored Hood", feat: "precise technical sketches of leather tailoring and hidden metal splints", cat: "Armature, Elmi e Scudi" },
    "Cappuccio da Arciere Verden": { eng: "Verden Archer's Hood", feat: "precise technical sketches of camouflage tailoring and peripheral vision cuts", cat: "Armature, Elmi e Scudi" },
    "Cotta di Maglia": { eng: "Chainmail Hauberk", feat: "precise technical sketches of interlocking metal rings and weight distribution", cat: "Armature, Elmi e Scudi" },
    "Cotta Gnomesca": { eng: "Gnomish Chainmail", feat: "precise technical sketches of advanced ultra-fine interlocking metal rings", cat: "Armature, Elmi e Scudi" },
    "Elmo a Mezza Maschera": { eng: "Half-Mask Helmet", feat: "precise technical sketches of metal forging and facial protection plates", cat: "Armature, Elmi e Scudi" },
    "Elmo di Skellige": { eng: "Skellige Helmet", feat: "precise technical sketches of metal spectacles and chainmail neck guards", cat: "Armature, Elmi e Scudi" },
    "Elmo Nilfgaardiano": { eng: "Nilfgaardian Helmet", feat: "precise technical sketches of black metal forging and imperial crests", cat: "Armature, Elmi e Scudi" },
    "Farsetto Protettivo Halfling": { eng: "Halfling Protective Doublet", feat: "precise technical sketches of silk tailoring and hidden padding", cat: "Armature, Elmi e Scudi" },
    "Gambali di Maglia di Hindarsfjall": { eng: "Hindarsfjall Chain Chausses", feat: "precise technical sketches of heavy ring mesh and knee protection", cat: "Armature, Elmi e Scudi" },
    "Gambesone": { eng: "Gambeson", feat: "precise technical sketches of thick cloth padding, quilting, and tailoring", cat: "Armature, Elmi e Scudi" },
    "Gambesone Aedirniano": { eng: "Aedirnian Gambeson", feat: "precise technical sketches of thick military cloth padding and quilting", cat: "Armature, Elmi e Scudi" },
    "Gambesone a Doppia Trama": { eng: "Double Woven Gambeson", feat: "precise technical sketches of highly reinforced cloth padding and tailoring", cat: "Armature, Elmi e Scudi" },
    "Giubba di Cuoio Lyriano": { eng: "Lyrian Leather Jacket", feat: "precise technical sketches of hardened leather tailoring and metal studs", cat: "Armature, Elmi e Scudi" },
    "Grande Elmo": { eng: "Great Helm", feat: "precise technical sketches of massive metal plates, eye slits, and ventilation holes", cat: "Armature, Elmi e Scudi" },
    "Palvese": { eng: "Pavise Shield", feat: "precise technical sketches of massive wooden planks and ground-planting spikes", cat: "Armature, Elmi e Scudi" },
    "Palvese Mahakaman": { eng: "Mahakaman Pavise Shield", feat: "precise technical sketches of heavy dwarven steel reinforcement and ground-planting spikes", cat: "Armature, Elmi e Scudi" },
    "Palvese Nilfgaardiano": { eng: "Nilfgaardian Pavise Shield", feat: "precise technical sketches of tall black wood and metal ground-planting spikes", cat: "Armature, Elmi e Scudi" },
    "Schinieri di Piastre": { eng: "Plate Greaves", feat: "precise technical sketches of metal articulation around the shin and knee", cat: "Armature, Elmi e Scudi" },
    "Schinieri Nilfgaardiani": { eng: "Nilfgaardian Plate Greaves", feat: "precise technical sketches of black metal articulation around the shin and knee", cat: "Armature, Elmi e Scudi" },
    "Schinieri Redaniani": { eng: "Redanian Greaves", feat: "precise technical sketches of metal and leather articulation for infantry", cat: "Armature, Elmi e Scudi" },
    "Scudo d'Acciaio a Goccia": { eng: "Steel Kite Shield", feat: "precise technical sketches of teardrop-shaped metal forging and leather strapping", cat: "Armature, Elmi e Scudi" },
    "Scudo da Razziatore di Skellige": { eng: "Skellige Raider Shield", feat: "precise technical sketches of a round wooden frame, iron boss, and leather edge", cat: "Armature, Elmi e Scudi" },
    "Scudo di Cuoio": { eng: "Leather Shield", feat: "precise technical sketches of boiled leather stretching and wooden frame assembly", cat: "Armature, Elmi e Scudi" },
    "Scudo Elfico": { eng: "Elven Shield", feat: "precise technical sketches of elegant leaf-shaped woodwork and lightweight leather straps", cat: "Armature, Elmi e Scudi" },
    "Scudo Kaedweni": { eng: "Kaedweni Shield", feat: "precise technical sketches of a robust wooden heater shield and metal reinforcements", cat: "Armature, Elmi e Scudi" },
    "Scudo Temeriano": { eng: "Temerian Shield", feat: "precise technical sketches of a heavy wooden infantry shield and metal boss", cat: "Armature, Elmi e Scudi" },

    // Staffs, Daggers and Others
    "Bastone": { eng: "Quarterstaff", feat: "precise technical sketches of wood treatments and metal end-caps", cat: "Bastoni, Pugnali e Vari" },
    "Bastone con Cristallo": { eng: "Crystal Mage Staff", feat: "precise technical sketches of arcane gem mounts and magical conduit wiring", cat: "Bastoni, Pugnali e Vari" },
    "Bastone da Passeggio Elfico": { eng: "Elven Walking Stick", feat: "precise technical sketches of elegant carved wood and hidden weighted cores", cat: "Bastoni, Pugnali e Vari" },
    "Bastone di Ferro": { eng: "Iron Staff", feat: "precise technical sketches of heavy metal casting and gripping zones", cat: "Bastoni, Pugnali e Vari" },
    "Bastone Gnomesco": { eng: "Gnomish Staff", feat: "precise technical sketches of intricate metalwork and focus crystal mounts", cat: "Bastoni, Pugnali e Vari" },
    "Pugnale": { eng: "Dagger", feat: "precise technical sketches of a double-edged blade and simple hilt", cat: "Bastoni, Pugnali e Vari" },
    "Daga a Rondelle Halfling": { eng: "Halfling Roundel Dagger", feat: "precise technical sketches of a slender piercing blade and round guard plate", cat: "Bastoni, Pugnali e Vari" },
    "Jambiya": { eng: "Jambiya dagger", feat: "precise technical sketches of a curved double-edged blade and ornate wooden grip", cat: "Bastoni, Pugnali e Vari" },
    "Bastone Uncinato": { eng: "Hooked Staff", feat: "precise technical sketches of a hook-shaped iron head and sturdy haft", cat: "Bastoni, Pugnali e Vari" },
    "Asce da Lancio": { eng: "Throwing Axes", feat: "precise technical sketches of weight distribution and throwing axe geometry", cat: "Bastoni, Pugnali e Vari" },
    "Brache di Cuoio Lyriano": { eng: "Lyrian Leather Trousers", feat: "precise technical sketches of hardened leather trouser panels and double-seam tailoring", cat: "Armature, Elmi e Scudi" }
};

const items = Object.entries(nameMapping).map(([itaName, val]) => {
    // Generate formulaic prompt
    const isVowel = /^[aeiou]/i.test(val.eng);
    const article = isVowel ? "an" : "a";
    const prompt = `Digital painting viewed from directly above, top-down perspective, an arcane parchment detailing the blueprints for ${article} ${val.eng}, featuring ${val.feat}, lying flat on a dark rough textured stone surface, large subject perfectly framed with narrow margins, filling the space without overflowing, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.`;
    
    // Slugify target filename
    const slug = itaName.toLowerCase()
        .replace(/['"«»„“”]/g, '_')
        .replace(/[^\w\s-]/g, '_')
        .replace(/[-\s]+/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_|_$/g, '');
    const filename = `schema_${slug}.webp`;

    return {
        itaName,
        engName: val.eng,
        category: val.cat,
        prompt,
        filename
    };
});

// Save to a json database so we can access it during image generation
fs.writeFileSync('scratch/schematics_prompts_list.json', JSON.stringify(items, null, 2), 'utf8');
console.log(`Generated ${items.length} prompts in scratch/schematics_prompts_list.json`);

// Now let's update TO DO/report_schemi_asset.md
let content = fs.readFileSync(reportPath, 'utf8');

// Strip any existing "## Tracciamento Generazione Immagini" section if present
const secIdx = content.indexOf('## Tracciamento Generazione Immagini');
if (secIdx !== -1) {
    content = content.substring(0, secIdx).trim();
}

let newSection = '\n\n## Tracciamento Generazione Immagini Schemi\n\n';
newSection += 'Questo elenco tiene traccia di tutte le immagini degli schemi che sono state generate e di quelle ancora da generare.\n\n';

// Group by category
const categories = ["Spade e Lame", "Asce, Martelli e Armi in Asta", "Archi, Balestre e Armi a Distanza", "Armature, Elmi e Scudi", "Bastoni, Pugnali e Vari"];

for (const cat of categories) {
    newSection += `### ${cat}\n\n`;
    newSection += '| Stato | Nome Schema | File Target | Prompt Utilizzato |\n';
    newSection += '| :--- | :--- | :--- | :--- |\n';
    
    const catItems = items.filter(i => i.category === cat);
    for (const item of catItems) {
        newSection += `| [ ] | **Schema: ${item.itaName}** | \`${item.filename}\` | ${item.prompt} |\n`;
    }
    newSection += '\n';
}

fs.writeFileSync(reportPath, content + newSection, 'utf8');
console.log('Updated report_schemi_asset.md successfully!');
