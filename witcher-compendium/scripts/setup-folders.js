Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  const ROOT_NAME = "The Witcher Compendio ITA";
  const MACRO_CATS = {
    "BESTIARIO": "BESTIARIO & PERSONAGGI",
    "MAGIA_E_MALEDIZIONI": "MAGIA & MALEDIZIONI",
    "EQUIPAGGIAMENTO_E_TRASPORTI": "EQUIPAGGIAMENTO & TRASPORTI",
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

  
  // Magia
  const mMagia = folderMap.get("MAGIA_E_MALEDIZIONI");
  await ensureSub("MAGIA_E_MALEDIZIONI/Segni", "Segni", mMagia);
  await ensureSub("MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali", "Incantesimi & Rituali", mMagia);
  await ensureSub("MAGIA_E_MALEDIZIONI/Doni_del_Caos", "Doni del Caos", mMagia);
  await ensureSub("MAGIA_E_MALEDIZIONI/Necromanzia", "Necromanzia", mMagia);
  await ensureSub("MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture", "Maledizioni & Fatture", mMagia);

  // Equipaggiamento
  const mEquip = folderMap.get("EQUIPAGGIAMENTO_E_TRASPORTI");
  await ensureSub("EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature", "Armi & Armature", mEquip);
  await ensureSub("EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti", "Trasporti", mEquip);
  await ensureSub("EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti", "Attrezzatura & Oggetti", mEquip);
  await ensureSub("EQUIPAGGIAMENTO_E_TRASPORTI/Reliquie_e_Artefatti", "Reliquie & Artefatti", mEquip);
  await ensureSub("EQUIPAGGIAMENTO_E_TRASPORTI/Protesi", "Protesi", mEquip);

  // Alchimia
  const mAlch = folderMap.get("ALCHIMIA_E_ARTIGIANATO");
  await ensureSub("ALCHIMIA_E_ARTIGIANATO/Componenti", "Componenti", mAlch);
  await ensureSub("ALCHIMIA_E_ARTIGIANATO/Mutageni", "Mutageni", mAlch);
  await ensureSub("ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette", "Formule & Ricette", mAlch);
  await ensureSub("ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione", "Schemi di Fabbricazione", mAlch);

  // Regolamento
  const mReg = folderMap.get("REGOLAMENTO_E_NARRATIVA");
  await ensureSub("REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita", "Professioni & Abilità", mReg);
  await ensureSub("REGOLAMENTO_E_NARRATIVA/Investigazioni", "Investigazioni", mReg);
  await ensureSub("REGOLAMENTO_E_NARRATIVA/Ferite_Critiche", "Ferite Critiche", mReg);
  await ensureSub("REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti", "Lore & Racconti", mReg);
  await ensureSub("REGOLAMENTO_E_NARRATIVA/Trofei", "Trofei", mReg);
  await ensureSub("REGOLAMENTO_E_NARRATIVA/Geografia", "Geografia", mReg);

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
