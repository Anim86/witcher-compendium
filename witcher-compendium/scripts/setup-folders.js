Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  const ROOT_NAME = "The Witcher Compendio ITA";
  const MACRO_CATS = {
    "BESTIARIO": "BESTIARIO & PERSONAGGI",
    "PROFESSIONI_E_ABILITA": "PROFESSIONI & ABILITÀ",
    "MAGIA": "MAGIA",
    "EQUIPAGGIAMENTO": "EQUIPAGGIAMENTO",
    "ALCHIMIA_E_ARTIGIANATO": "ALCHIMIA & ARTIGIANATO",
    "REGOLAMENTO_E_NARRATIVA": "REGOLAMENTO & NARRATIVA"
  };

  const macroDisplayNames = Object.values(MACRO_CATS);

  // 1. Root Principale (Ordinamento Alfabetico)
  let root = game.folders.find(f => f.name === ROOT_NAME && f.type === "Compendium" && !f.folder);
  if (!root) {
    root = await Folder.create({ name: ROOT_NAME, type: "Compendium", sorting: "a", color: "#5a0000" });
  } else if (root.sorting !== "a") {
    await root.update({ sorting: "a" });
  }

  // 2. Cleanup cartelle piatte/legacy
  const currentFolders = game.folders.filter(f => f.type === "Compendium" && f.folder?.id === root.id);
  for (let f of currentFolders) {
    if (!macroDisplayNames.includes(f.name)) {
      await f.delete({ deleteSubfolders: false, deleteContents: false });
    }
  }

  // 3. Macro-Categorie (Ordinamento Alfabetico)
  const folderMap = new Map();
  for (const [key, displayName] of Object.entries(MACRO_CATS)) {
    let f = game.folders.find(fol => fol.name === displayName && fol.type === "Compendium" && fol.folder?.id === root.id);
    if (!f) {
      f = await Folder.create({ name: displayName, type: "Compendium", sorting: "a", folder: root.id });
    } else if (f.sorting !== "a") {
      await f.update({ sorting: "a" });
    }
    folderMap.set(key, f);
  }

  // 4. Sottocartelle Nidificate (Ordinamento Alfabetico)
  const subMap = new Map();
  const ensureSub = async (pathKey, name, parent) => {
    let f = game.folders.find(fol => fol.name === name && fol.type === "Compendium" && fol.folder?.id === parent.id);
    if (!f) {
      f = await Folder.create({ name: name, type: "Compendium", sorting: "a", folder: parent.id });
    } else if (f.sorting !== "a") {
      await f.update({ sorting: "a" });
    }
    subMap.set(pathKey, f);
    return f;
  };

  // Bestiario (Directly under parent now)
  // No sub-levels for BESTIARIO to keep it clean as requested.

  
  // Riorganizzazione Magia (compendi posizionati direttamente nella root MAGIA)

  // Equipaggiamento (Directly under parent now)
  const mEquip = folderMap.get("EQUIPAGGIAMENTO");

  // Alchimia (Flattened)
  const mAlch = folderMap.get("ALCHIMIA_E_ARTIGIANATO");


  // Regolamento
  const mReg = folderMap.get("REGOLAMENTO_E_NARRATIVA");


  // 5. Rilocazione Pack
  for (let pack of game.packs) {
    if (pack.metadata.system !== "TheWitcherItaNewSystem") continue;

    const pathParts = pack.metadata.path.split('/');
    const packsIdx = pathParts.indexOf('packs');
    if (packsIdx === -1 || pathParts.length <= packsIdx + 1) continue;

    const rootPart = pathParts[packsIdx + 1];
    const subPart = pathParts[packsIdx + 2];
    const parentFolder = folderMap.get(rootPart);
    if (!parentFolder) continue;

    let targetFolder = parentFolder;
    if (subPart && subPart !== pack.metadata.name) {
      targetFolder = subMap.get(`${rootPart}/${subPart}`) || parentFolder;
    }

    if (pack.folder?.id !== targetFolder.id) {
      await pack.setFolder(targetFolder.id);
    }
  }

  // 6. Cleanup Finale
  const allCompendiumFolders = game.folders.filter(f => f.type === "Compendium");
  for (let f of allCompendiumFolders) {
    if (f.name === ROOT_NAME) continue;
    const packsCount = game.packs.filter(p => p.folder?.id === f.id).length;
    const subFoldersCount = game.folders.filter(sf => sf.folder?.id === f.id).length;
    
    if (packsCount === 0 && subFoldersCount === 0) {
      if (f.folder?.id === root.id || Array.from(folderMap.values()).some(m => f.folder?.id === m.id)) {
          await f.delete();
      }
    }
  }

  const fallback = game.folders.find(f => f.name === "_DA_RICOLLOCARE" && f.type === "Compendium");
  if (fallback && game.packs.filter(p => p.folder?.id === fallback.id).length === 0) {
    await fallback.delete();
  }

  console.log("💎 Witcher Compendium: Setup & Sorting Complete!");
});
