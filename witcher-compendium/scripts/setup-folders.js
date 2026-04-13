Hooks.once("ready", async () => {
  // RESET FLAG per questa sessione per assicurarci che la pulizia avvenga
  // In produzione puoi togliere il reset, ma ora serve per "sistemare" il caos.
  await game.settings.set("witcher-compendium", "foldersCreated", false);

  // 1. Trova o Crea Root Principale
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

  // 1b. PULIZIA: Rimuovi cartelle orfane o vecchie con nomi incoerenti se presenti nel root
  const foldersToDelete = ["BESTIARIO / PNG", "Tomo Base", "Tomo del Caos", "Libro dei Racconti", "Diario di un Witcher"];
  for (const fName of foldersToDelete) {
      let f = game.folders.find(fol => fol.name === fName && fol.type === "Compendium" && fol.folder?.id === root.id);
      if (f) {
          // Se è una cartella di vecchio tipo la eliminiamo (Foundry sposterà i pack nel root)
          // ma noi li riassegneremo subito dopo.
          // await f.delete(); 
      }
  }

  // 2. Crea le categorie principali (1:1 con src-packs)
  const categories = ["CORE", "BESTIARIO", "EQUIPAGGIAMENTO", "MAGIA", "CRAFTING", "GAMEPLAY", "LORE"];
  const folderMap = {};

  for (const cat of categories) {
    let f = game.folders.find(fol => fol.name === cat && fol.type === "Compendium" && fol.folder?.id === root.id);
    if (!f) {
      f = await Folder.create({ name: cat, type: "Compendium", sorting: "m", folder: root.id });
    }
    folderMap[cat] = f;
  }

  // 3. Funzione per sottocartelle (Base, Caos, Racconti, Diario)
  const getSub = async (name, parent) => {
    let f = game.folders.find(fol => fol.name === name && fol.type === "Compendium" && fol.folder?.id === parent.id);
    if (!f) f = await Folder.create({ name, type: "Compendium", sorting: "a", folder: parent.id });
    return f;
  };

  // Mappe Sottocartelle
  const s = {
      equip: {
          base: await getSub("Base", folderMap["EQUIPAGGIAMENTO"]),
          caos: await getSub("Caos", folderMap["EQUIPAGGIAMENTO"]),
          racconti: await getSub("Racconti", folderMap["EQUIPAGGIAMENTO"])
      },
      magia: {
          base: await getSub("Base", folderMap["MAGIA"]),
          caos: await getSub("Caos", folderMap["MAGIA"]),
          racconti: await getSub("Racconti", folderMap["MAGIA"])
      },
      craft: {
          base: folderMap["CRAFTING"], // piatto
          diario: await getSub("Diario", folderMap["CRAFTING"]),
          racconti: await getSub("Racconti", folderMap["CRAFTING"])
      }
  };

  // 4. Assegnazione Pack
  const mapping = [
    // CORE
    { p: "witcher-races", f: folderMap["CORE"] },
    { p: "witcher-professions", f: folderMap["CORE"] },
    { p: "witcher-skills", f: folderMap["CORE"] },

    // BESTIARIO
    { p: "witcher-monsters", f: folderMap["BESTIARIO"] },
    { p: "witcher-png", f: folderMap["BESTIARIO"] },

    // EQUIPAGGIAMENTO
    { p: "witcher-weapons", f: s.equip.base },
    { p: "witcher-armor", f: s.equip.base },
    { p: "witcher-equipment", f: s.equip.base },
    { p: "witcher-special", f: s.equip.base },
    { p: "witcher-transports", f: s.equip.base },
    { p: "witcher-special-chaos", f: s.equip.caos },
    { p: "witcher-trophies", f: s.equip.caos },
    { p: "witcher-weapons-racconti", f: s.equip.racconti },

    // MAGIA
    { p: "witcher-spells", f: s.magia.base },
    { p: "witcher-rituals", f: s.magia.base },
    { p: "witcher-signs", f: s.magia.base },
    { p: "witcher-runes", f: s.magia.base },
    { p: "witcher-hexes-base", f: s.magia.base },
    { p: "witcher-spells-chaos", f: s.magia.caos },
    { p: "witcher-rituals-chaos", f: s.magia.caos },
    { p: "witcher-signs-chaos", f: s.magia.caos },
    { p: "witcher-hexes", f: s.magia.caos },
    { p: "witcher-invocations", f: s.magia.caos },
    { p: "witcher-gifts", f: s.magia.caos },
    { p: "witcher-goetia", f: s.magia.caos },
    { p: "witcher-spells-racconti", f: s.magia.racconti },

    // CRAFTING
    { p: "witcher-components", f: s.craft.base },
    { p: "witcher-schematics", f: s.craft.base },
    { p: "witcher-alchemy", f: s.craft.base },
    { p: "witcher-mutations", f: s.craft.base },
    { p: "witcher-components-diario", f: s.craft.diario },
    { p: "witcher-components-racconti", f: s.craft.racconti },
    { p: "witcher-schematics-racconti", f: s.craft.racconti },

    // GAMEPLAY & LORE
    { p: "witcher-critical-wounds", f: folderMap["GAMEPLAY"] },
    { p: "witcher-curses", f: folderMap["GAMEPLAY"] },
    { p: "witcher-lore", f: folderMap["LORE"] }
  ];

  for (const { p, f } of mapping) {
    const pack = game.packs.get(`witcher-compendium.${p}`);
    if (pack && f) {
      if (pack.folder?.id !== f.id) await pack.setFolder(f.id);
    }
  }

  // Forza il refresh UI
  await game.settings.set("witcher-compendium", "foldersCreated", true);
});
