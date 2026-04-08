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
  const [core, equip, magia, creazione, bestiario] = await Folder.create([
    { name: "CORE", type: "Compendium", sorting: "m", color: "#8b0000", folder: root.id },
    { name: "EQUIPAGGIAMENTO", type: "Compendium", sorting: "m", color: "#5a3e1b", folder: root.id },
    { name: "MAGIA", type: "Compendium", sorting: "m", color: "#1a1a6e", folder: root.id },
    { name: "CREAZIONE", type: "Compendium", sorting: "m", color: "#2d5a1b", folder: root.id },
    { name: "BESTIARIO / PNG", type: "Compendium", sorting: "m", color: "#4a0e0e", folder: root.id }
  ]);

  // Crea sottocartelle
  await Folder.create([
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: equip.id },
    { name: "Tomo del Caos", type: "Compendium", sorting: "m", folder: equip.id },
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: magia.id },
    { name: "Tomo del Caos", type: "Compendium", sorting: "m", folder: magia.id },
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: creazione.id },
    { name: "Tomo Base", type: "Compendium", sorting: "m", folder: bestiario.id },
    { name: "Tomo del Caos", type: "Compendium", sorting: "m", folder: bestiario.id }
  ]);

  // Recupera le sottocartelle appena create per nome+parent
  const getFolder = (nome, parentId) => game.folders.find(
    f => f.name === nome && f.type === "Compendium" && f.folder?.id === parentId
  );

  const tomoBaseEquip    = getFolder("Tomo Base", equip.id);
  const tomoCaosEquip    = getFolder("Tomo del Caos", equip.id);
  const tomoBaseMagia    = getFolder("Tomo Base", magia.id);
  const tomoCaosMagia    = getFolder("Tomo del Caos", magia.id);
  const tomoBaseCreaz    = getFolder("Tomo Base", creazione.id);
  const tomoBaseBest     = getFolder("Tomo Base", bestiario.id);
  const tomoCaosBest     = getFolder("Tomo del Caos", bestiario.id);

  // Mappa pack → cartella
  const assegnazioni = [
    // CORE
    { pack: "witcher-compendium.witcher-races",          folder: core.id },
    { pack: "witcher-compendium.witcher-professions",    folder: core.id },
    { pack: "witcher-compendium.witcher-skills",         folder: core.id },
    // EQUIPAGGIAMENTO - Tomo Base
    { pack: "witcher-compendium.witcher-weapons",        folder: tomoBaseEquip.id },
    { pack: "witcher-compendium.witcher-armor",          folder: tomoBaseEquip.id },
    { pack: "witcher-compendium.witcher-equipment",      folder: tomoBaseEquip.id },
    { pack: "witcher-compendium.witcher-special",        folder: tomoBaseEquip.id },
    // EQUIPAGGIAMENTO - Tomo del Caos
    { pack: "witcher-compendium.witcher-special-chaos",  folder: tomoCaosEquip.id },
    // MAGIA - Tomo Base
    { pack: "witcher-compendium.witcher-spells",         folder: tomoBaseMagia.id },
    { pack: "witcher-compendium.witcher-rituals",        folder: tomoBaseMagia.id },
    // MAGIA - Tomo del Caos
    { pack: "witcher-compendium.witcher-spells-chaos",   folder: tomoCaosMagia.id },
    { pack: "witcher-compendium.witcher-rituals-chaos",  folder: tomoCaosMagia.id },
    // CREAZIONE - Tomo Base
    { pack: "witcher-compendium.witcher-components",     folder: tomoBaseCreaz.id },
    { pack: "witcher-compendium.witcher-schematics",     folder: tomoBaseCreaz.id },
    { pack: "witcher-compendium.witcher-alchemy",        folder: tomoBaseCreaz.id },
    // BESTIARIO - Tomo Base
    { pack: "witcher-compendium.witcher-monsters",       folder: tomoBaseBest.id },
    // BESTIARIO - Tomo del Caos
    { pack: "witcher-compendium.witcher-monsters-chaos", folder: tomoCaosBest.id },
  ];

  for (const { pack, folder } of assegnazioni) {
    const p = game.packs.get(pack);
    if (p) await p.setFolder(folder);
  }

  // Marca come completato
  await game.settings.set("witcher-compendium", "foldersCreated", true);
  ui.notifications.info("✅ Witcher Compendio: cartelle create e pack assegnati!");
});
