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

  // Marca come completato
  await game.settings.set("witcher-compendium", "foldersCreated", true);
  ui.notifications.info("✅ Witcher Compendio: cartelle create!");
});
