Hooks.once("ready", async () => {
  // Esegui solo se non già fatto
  const flag = game.settings.get("witcher-compendium", "foldersCreated");
  if (flag) return;

  // Controlla se le cartelle esistono già
  const esistente = game.folders.find(f => 
    f.name === "The Witcher Compendio ITA" && f.type === "Compendium"
  );
  if (esistente) return;

  ui.notifications.info("Witcher Compendio: creazione cartelle in corso...");

  // Crea root
  const root = await Folder.create({
    name: "The Witcher Compendio ITA",
    type: "Compendium",
    sorting: "m",
    color: "#6b0f0f"
  });

  // Crea categorie principali
  const [core, equip, magia, crafting, bestiario] = await Folder.create([
    { name: "CORE", type: "Compendium", sorting: "m", color: "#8b0000", folder: root.id },
    { name: "EQUIPAGGIAMENTO", type: "Compendium", sorting: "m", color: "#5a3e1b", folder: root.id },
    { name: "MAGIA", type: "Compendium", sorting: "m", color: "#1a1a6e", folder: root.id },
    { name: "CRAFTING", type: "Compendium", sorting: "m", color: "#2d5a1b", folder: root.id },
    { name: "BESTIARIO / PNG", type: "Compendium", sorting: "m", color: "#4a0e0e", folder: root.id }
  ]);

  // Crea sottocartelle
  await Folder.create([
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: equip.id },
    { name: "Tomo del Caos", type: "Compendium", sorting: "m", folder: equip.id },
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: magia.id },
    { name: "Tomo del Caos", type: "Compendium", sorting: "m", folder: magia.id },
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: crafting.id },
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: bestiario.id },
    { name: "Tomo del Caos", type: "Compendium", sorting: "m", folder: bestiario.id },
    { name: "Trofei", type: "Compendium", sorting: "m", folder: tomoCaosEquip?.id }
  ]);

  // Recupera le sottocartelle appena create per nome+parent
  const getFolder = (nome, parentId) => game.folders.find(
    f => f.name === nome && f.type === "Compendium" && f.folder?.id === parentId
  );

  const tomoBaseEquip    = getFolder("Tomo Base", equip.id);
  const tomoCaosEquip    = getFolder("Tomo del Caos", equip.id);
  const tomoBaseMagia    = getFolder("Tomo Base", magia.id);
  const tomoCaosMagia    = getFolder("Tomo del Caos", magia.id);
  const tomoBaseCreaz    = getFolder("Tomo Base", crafting.id);
  const tomoBaseBest     = getFolder("Tomo Base", bestiario.id);
  const tomoCaosBest     = getFolder("Tomo del Caos", bestiario.id);
  const tomoCaosTrofei   = getFolder("Trofei", tomoCaosEquip?.id);

  // Mappa pack → cartella
  const assegnazioni = [
    { packName: "witcher-races",          folderId: core.id },
    { packName: "witcher-professions",    folderId: core.id },
    { packName: "witcher-skills",         folderId: core.id },
    { packName: "witcher-weapons",        folderId: tomoBaseEquip?.id },
    { packName: "witcher-armor",          folderId: tomoBaseEquip?.id },
    { packName: "witcher-equipment",      folderId: tomoBaseEquip?.id },
    { packName: "witcher-special",        folderId: tomoBaseEquip?.id },
    { packName: "witcher-special-chaos",  folderId: tomoCaosEquip?.id },
    { packName: "witcher-spells",         folderId: tomoBaseMagia?.id },
    { packName: "witcher-rituals",        folderId: tomoBaseMagia?.id },
    { packName: "witcher-runes",          folderId: tomoBaseMagia?.id },
    { packName: "witcher-hexes-base",     folderId: tomoBaseMagia?.id },
    { packName: "witcher-signs",          folderId: tomoBaseMagia?.id },
    { packName: "witcher-spells-chaos",   folderId: tomoCaosMagia?.id },
    { packName: "witcher-rituals-chaos",  folderId: tomoCaosMagia?.id },
    { packName: "witcher-signs-chaos",    folderId: tomoCaosMagia?.id },
    { packName: "witcher-hexes",          folderId: tomoCaosMagia?.id },
    { packName: "witcher-invocations",    folderId: tomoCaosMagia?.id },
    { packName: "witcher-gifts",          folderId: tomoCaosMagia?.id },
    { packName: "witcher-goetia",         folderId: tomoCaosMagia?.id },
    { packName: "witcher-components",     folderId: tomoBaseCreaz?.id },
    { packName: "witcher-schematics",     folderId: tomoBaseCreaz?.id },
    { packName: "witcher-alchemy",        folderId: tomoBaseCreaz?.id },
    { packName: "witcher-mutations",      folderId: tomoBaseCreaz?.id },
    { packName: "witcher-monsters",       folderId: tomoBaseBest?.id },
    { packName: "witcher-monsters-chaos", folderId: tomoCaosBest?.id },
    { packName: "witcher-transports",     folderId: tomoBaseEquip?.id },
    { packName: "witcher-trophies",       folderId: tomoCaosTrofei?.id }
  ];

  console.log("Witcher Compendio: Inizio assegnazione pack...");

  for (const { packName, folderId } of assegnazioni) {
    if (!folderId) {
        console.warn(`Witcher Compendio: Cartella non trovata per ${packName}`);
        continue;
    }
    // Cerca il pack nel nostro modulo
    const p = game.packs.find(p => p.metadata.name === packName && p.metadata.packageName === "witcher-compendium");
    if (p) {
        await p.setFolder(folderId);
        console.log(`Witcher Compendio: Pack ${packName} assegnato a ${folderId}`);
    } else {
        console.error(`Witcher Compendio: Pack NON trovato -> ${packName}`);
    }
  }

  // Marca come completato
  await game.settings.set("witcher-compendium", "foldersCreated", true);
  ui.notifications.info("✅ Witcher Compendio: cartelle create e pack assegnati!");
});
