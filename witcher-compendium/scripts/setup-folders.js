Hooks.once("ready", async () => {
  // Esegui solo se non già fatto
  const flag = game.settings.get("witcher-compendium", "foldersCreated");
  if (flag) return;

  // 1. Trova o Crea Root
  let root = game.folders.find(f => f.name === "The Witcher Compendio ITA" && f.type === "Compendium");
  if (!root) {
    console.log("Witcher Compendio: Creazione cartella Root...");
    root = await Folder.create({
      name: "The Witcher Compendio ITA",
      type: "Compendium",
      sorting: "m",
      color: "#6b0f0f"
    });
  }

  // 2. Trova o Crea categorie principali
  const categories = ["CORE", "EQUIPAGGIAMENTO", "MAGIA", "CRAFTING", "BESTIARIO / PNG"];
  const folderMap = {};

  for (const cat of categories) {
    let f = game.folders.find(fol => fol.name === cat && fol.type === "Compendium" && fol.folder?.id === root.id);
    if (!f) {
      console.log(`Witcher Compendio: Creazione cartella ${cat}...`);
      f = await Folder.create({ 
        name: cat, 
        type: "Compendium", 
        sorting: "m", 
        folder: root.id 
      });
    }
    folderMap[cat] = f;
  }

  // 3. Trova o Crea sottocartelle specifiche
  const getSubfolder = async (name, parent) => {
    let f = game.folders.find(fol => fol.name === name && fol.type === "Compendium" && fol.folder?.id === parent.id);
    if (!f) {
      f = await Folder.create({ name, type: "Compendium", sorting: "m", folder: parent.id });
    }
    return f;
  };

  const core = folderMap["CORE"];
  const equip = folderMap["EQUIPAGGIAMENTO"];
  const magia = folderMap["MAGIA"];
  const crafting = folderMap["CRAFTING"];
  const bestiario = folderMap["BESTIARIO / PNG"];

  const tomoBaseEquip = await getSubfolder("Tomo Base", equip);
  const tomoCaosEquip = await getSubfolder("Tomo del Caos", equip);
  const tomoBaseMagia = await getSubfolder("Tomo Base", magia);
  const tomoCaosMagia = await getSubfolder("Tomo del Caos", magia);
  const tomoBaseCreaz = await getSubfolder("Tomo Base", crafting);
  const tomoBaseBest = await getSubfolder("Tomo Base", bestiario);
  const tomoCaosBest = await getSubfolder("Tomo del Caos", bestiario);
  const tomoCaosTrofei = await getSubfolder("Trofei", tomoCaosEquip);

  // Mappa pack → cartella
  const assegnazioni = [
    { pack: "witcher-races",          folder: core },
    { pack: "witcher-professions",    folder: core },
    { pack: "witcher-skills",         folder: core },
    { pack: "witcher-weapons",        folder: tomoBaseEquip },
    { pack: "witcher-armor",          folder: tomoBaseEquip },
    { pack: "witcher-equipment",      folder: tomoBaseEquip },
    { pack: "witcher-special",        folder: tomoBaseEquip },
    { pack: "witcher-special-chaos",  folder: tomoCaosEquip },
    { pack: "witcher-spells",         folder: tomoBaseMagia },
    { pack: "witcher-rituals",        folder: tomoBaseMagia },
    { pack: "witcher-runes",          folder: tomoBaseMagia },
    { pack: "witcher-hexes-base",     folder: tomoBaseMagia },
    { pack: "witcher-signs",          folder: tomoBaseMagia },
    { pack: "witcher-spells-chaos",   folder: tomoCaosMagia },
    { pack: "witcher-rituals-chaos",  folder: tomoCaosMagia },
    { pack: "witcher-signs-chaos",    folder: tomoCaosMagia },
    { pack: "witcher-hexes",          folder: tomoCaosMagia },
    { pack: "witcher-invocations",    folder: tomoCaosMagia },
    { pack: "witcher-gifts",          folder: tomoCaosMagia },
    { pack: "witcher-goetia",         folder: tomoCaosMagia },
    { pack: "witcher-components",     folder: tomoBaseCreaz },
    { pack: "witcher-schematics",     folder: tomoBaseCreaz },
    { pack: "witcher-alchemy",        folder: tomoBaseCreaz },
    { pack: "witcher-mutations",      folder: tomoBaseCreaz },
    { pack: "witcher-monsters",       folder: tomoBaseBest },
    { pack: "witcher-monsters-chaos", folder: tomoCaosBest },
    { pack: "witcher-transports",     folder: tomoBaseEquip },
    { pack: "witcher-trophies",       folder: tomoCaosTrofei }
  ];

  console.log("Witcher Compendio: Inizio assegnazione pack...");

  for (const { pack, folder } of assegnazioni) {
    const fullId = `witcher-compendium.${pack}`;
    const p = game.packs.get(fullId);
    if (p && folder) {
      if (p.folder?.id !== folder.id) {
        await p.setFolder(folder.id);
        console.log(`Witcher Compendio: Pack ${pack} spostato in ${folder.name}`);
      }
    } else {
      if (!p) console.error(`Witcher Compendio: Pack NON trovato -> ${fullId}`);
    }
  }

  // Marca come completato
  await game.settings.set("witcher-compendium", "foldersCreated", true);
  ui.notifications.info("✅ Witcher Compendio: cartelle create e pack assegnati!");
});
