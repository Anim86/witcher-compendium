Hooks.once("init", () => {
    game.settings.register("witcher-compendium", "foldersCreated", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });
});

/**
 * Logica avanzata Drag & Drop per Witcher RPG Compendium (v2.4)
 * Gestisce canone, restrizioni e automazione bonus/perks.
 */

Hooks.on("preCreateItem", (item, data, options, userId) => {
    const actor = item.parent;
    if (!actor || actor.type !== "character") return;

    // 1. Gestione Unicità
    const uniqueTypes = ["race", "profession"];
    if (uniqueTypes.includes(item.type)) {
        const existing = actor.items.find(i => i.type === item.type);
        if (existing) {
            ui.notifications.error(`L'attore ha già una ${item.type === 'race' ? 'Razza' : 'Professione'}: ${existing.name}. Rimuovila prima.`);
            return false;
        }
    }

    // 2. Restrizioni Canoniche
    if (item.type === "profession") {
        const race = actor.items.find(i => i.type === "race")?.name || "";
        const profName = item.name.toLowerCase();


        if (profName.includes("witcher") && !race.includes("Witcher")) {
            ui.notifications.error("Restrizione: La professione Witcher richiede la razza Witcher.");
            return false;
        }
    }

    return true;
});

Hooks.on("createItem", async (item, options, userId) => {
    if (game.user.id !== userId) return;
    const actor = item.parent;
    if (!actor || actor.type !== "character") return;

    if (item.type === "race") {
        await applyRaceMechanics(actor, item);
    } else if (item.type === "profession") {
        await applyProfessionMechanics(actor, item);
    }
});

async function applyRaceMechanics(actor, item) {
    const name = item.name.toLowerCase();
    const system = item.system;
    const updates = {};

    // 1. Applica Bonus Statistiche
    if (name.includes("witcher")) {
        updates["system.stats.ref.unmodifiedMax"] = (actor.system.stats.ref.unmodifiedMax || 0) + 1;
        updates["system.stats.dex.unmodifiedMax"] = (actor.system.stats.dex.unmodifiedMax || 0) + 1;
        updates["system.stats.emp.unmodifiedMax"] = Math.max(1, (actor.system.stats.emp.unmodifiedMax || 0) - 4);
    } else if (name.includes("nani")) {
        updates["system.derivedStats.enc.totalModifiers"] = (actor.system.derivedStats.enc.totalModifiers || 0) + 25;
    } else if (name.includes("umani")) {
        updates["system.stats.int.modify"] = (actor.system.stats.int.modify || 0) + 1;
    }

    if (Object.keys(updates).length > 0) {
        await actor.update(updates);
    }

    // 2. AUTO-INSERT PERKS come Item "Note" o "Skill"
    if (system.perks && system.perks.length > 0) {
        const perkItems = system.perks.map(p => ({
            name: `Perk: ${p.name}`,
            type: "note",
            system: { text: p.description },
            img: "icons/skills/social/diplomacy-handshake.webp"
        }));
        await actor.createEmbeddedDocuments("Item", perkItems);
        ui.notifications.info(`Inseriti ${perkItems.length} Perk razziali.`);
    }

    // 3. Social Standing
    if (system.social) {
        await actor.update({ "system.general.socialStanding": mapSocial(system.social) });
    }
}

async function applyProfessionMechanics(actor, item) {
    const system = item.system;

    // 1. AUTO-INSERT ABILITÀ INNATA
    if (system.innate) {
        const innateItem = {
            name: `Innata: ${system.innate.name}`,
            type: "skill",
            system: { 
                description: system.innate.description,
                innate: true
            },
            img: "icons/magic/light/hand-sparks-glow-white.webp"
        };
        await actor.createEmbeddedDocuments("Item", [innateItem]);
        ui.notifications.info(`Abilità Innata "${system.innate.name}" aggiunta.`);
    }

    // 2. EQUIPAGGIAMENTO (Come Note per ora)
    if (system.equipment && system.equipment.length > 0) {
        const equipNote = {
            name: "Equipaggiamento Iniziale",
            type: "note",
            system: { text: system.equipment.join(", ") },
            img: "icons/containers/bags/backpack-leather-tan.webp"
        };
        await actor.createEmbeddedDocuments("Item", [equipNote]);
    }
}

function mapSocial(itSocial) {
    const map = {
        "Eguale": "equal",
        "Odiato": "hated",
        "Tollerato": "tolerated",
        "Odiato e Temuto": "hatedFeared",
        "Tollerato e Temuto": "toleratedFeared",
        "Temuto": "feared"
    };
    return map[itSocial] || "equal";
}
