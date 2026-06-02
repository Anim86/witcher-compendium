import { removeExpiredEffects } from '../scripts/temporaryEffects/temporaryEffectHook.js';
import { applyGeneralCombatHooks } from '../scripts/combat/generalCombatHook.js';
import { countdownDurationOfRegions } from '../scripts/regions/regionHooks.js';
import WitcherCharacterWizard from '../app/WitcherCharacterWizard.js';

console.log("TheWitcherItaNewSystem | hooks.js loaded");

export function registerHooks() {

    // --------------------------------------------------------
    // COMBAT & SIDEBAR HOOKS
    // --------------------------------------------------------
    Hooks.on('updateCombat', (combat, update, options, userId) => {
        combatHooks(combat, update, options, userId);
    });

    Hooks.on('renderActorDirectory', (app, html, data) => {
        _addWizardButton(html);
    });

    Hooks.on('renderSidebarTab', (app, html, data) => {
        if (app?.constructor?.name === "ActorDirectory") {
            _addWizardButton(html);
        }
    });

    Hooks.on('getSidebarTabControlButtons', (app, buttons) => {
        if (app?.constructor?.name === "ActorDirectory") {
            let allowPlayer = true;
            try {
                allowPlayer = game.settings.get("TheWitcherItaNewSystem", "allowPlayerWizard");
            } catch (e) { }

            if (game.user.isGM || allowPlayer) {
                buttons.push({
                    name: "character-wizard",
                    title: game.i18n.localize("WITCHER.Wizard.Button.Launch"),
                    icon: "fa-solid fa-wand-magic-sparkles",
                    callback: () => {
                        console.log("TheWitcherItaNewSystem | Launching Character Wizard");
                        new WitcherCharacterWizard().render({ force: true });
                    }
                });
            }
        }
    });

    Hooks.on('getSceneControlButtons', (controls) => {
        if (!game.user?.isGM) return;

        const defaultTool = {
            name: 'witcher-tools-default',
            title: 'Seleziona Strumento',
            icon: 'fa-solid fa-arrow-pointer',
            button: false
        };

        const rewardIpTool = {
            name: 'witcher-rewards-ip',
            title: 'Assegna Punti Incremento (Gruppo)',
            icon: 'fa-solid fa-graduation-cap',
            button: true,
            onClick: () => {
                if (game.api?.rewards?.ip) game.api.rewards.ip();
            }
        };

        const rewardMagicTool = {
            name: 'witcher-rewards-magic',
            title: 'Assegna Punti Magia (Gruppo)',
            icon: 'fa-solid fa-sparkles',
            button: true,
            onClick: () => {
                if (game.api?.rewards?.ip) game.api.rewards.ip(null, 'magic');
            }
        };

        const rewardCurrencyTool = {
            name: 'witcher-rewards-currency',
            title: 'Assegna Corone (Gruppo)',
            icon: 'fa-solid fa-coins',
            button: true,
            onClick: () => {
                if (game.api?.rewards?.currency) game.api.rewards.currency();
            }
        };

        let witcherTools;
        if (Array.isArray(controls)) {
            witcherTools = [defaultTool, rewardIpTool, rewardMagicTool, rewardCurrencyTool];
        } else {
            witcherTools = {
                'witcher-tools-default': defaultTool,
                'witcher-rewards-ip': rewardIpTool,
                'witcher-rewards-magic': rewardMagicTool,
                'witcher-rewards-currency': rewardCurrencyTool
            };
        }

        const witcherControls = {
            name: "witcher-tools",
            title: "Strumenti del Master",
            layer: "controls", 
            icon: "fa-solid fa-book-journal-whills", 
            visible: true,
            tools: witcherTools,
            activeTool: "witcher-tools-default"
        };

        if (Array.isArray(controls)) {
            controls.push(witcherControls);
        } else {
            controls["witcher-tools"] = witcherControls;
        }
    });

    // --------------------------------------------------------
    // CONTEXT MENU HOOK (V14 - Application V2)
    // --------------------------------------------------------
    Hooks.on('getActorContextOptions', (app, options) => {
        console.log("TheWitcherItaNewSystem | getActorContextOptions fired!", options);

        const targetIndex = options.findIndex(item => item.name === 'OWNERSHIP.Configure');
        const insertIndex = targetIndex !== -1 ? targetIndex + 1 : options.length;

        const newOptions = [
            {
                name: "WITCHER.ContextMenu.ShowCharacterArtwork",
                icon: '<i class="fas fa-image"></i>',
                condition: node => {
                    if (!game.user.isGM) return false;

                    // Normalizzazione del nodo (Application V2 passa direttamente HTMLElement)
                    const el = node instanceof HTMLElement ? node : node[0];
                    const targetRow = el.closest('[data-entry-id]');
                    if (!targetRow) return false;

                    const actor = game.actors.get(targetRow.dataset.entryId);
                    return Boolean(actor && actor.img && actor.img !== "icons/svg/mystery-man.svg");
                },
                callback: node => {
                    const el = node instanceof HTMLElement ? node : node[0];
                    const actorId = el.closest('[data-entry-id]')?.dataset?.entryId;
                    const actor = game.actors.get(actorId);

                    if (!actor) return ui.notifications.error("Risoluzione del Document ID fallita a livello DOM.");

                    const ip = new ImagePopout(actor.img, {
                        title: actor.name,
                        uuid: actor.uuid
                    });

                    ip.render(true);
                    setTimeout(() => ip.shareImage(), 200);
                }
            },
            {
                name: "WITCHER.ContextMenu.ShowTokenArtwork",
                icon: '<i class="fas fa-user-circle"></i>',
                condition: node => {
                    if (!game.user.isGM) return false;

                    const el = node instanceof HTMLElement ? node : node[0];
                    const targetRow = el.closest('[data-entry-id]');
                    if (!targetRow) return false;

                    const actor = game.actors.get(targetRow.dataset.entryId);
                    if (!actor) return false;

                    const tokenImg = actor.prototypeToken?.texture?.src || actor.token?.img || actor.img;
                    return Boolean(tokenImg && tokenImg !== "icons/svg/mystery-man.svg");
                },
                callback: node => {
                    const el = node instanceof HTMLElement ? node : node[0];
                    const actorId = el.closest('[data-entry-id]')?.dataset?.entryId;
                    const actor = game.actors.get(actorId);

                    if (!actor) return ui.notifications.error("Risoluzione del Document ID fallita a livello DOM.");

                    const img = actor.prototypeToken?.texture?.src || actor.token?.img || actor.img;
                    const ip = new ImagePopout(img, {
                        title: `${actor.name} - Token`,
                        uuid: actor.uuid
                    });

                    ip.render(true);
                    setTimeout(() => ip.shareImage(), 200);
                }
            }
        ];

        options.splice(insertIndex, 0, ...newOptions);
    });
}

// --------------------------------------------------------
// FUNZIONI HELPER
// --------------------------------------------------------
function _addWizardButton(html) {
    const $html = (html instanceof HTMLElement) ? $(html) : html;
    if ($html.find(".wizard-button").length > 0) return;

    let allowPlayer = true;
    try { allowPlayer = game.settings.get("TheWitcherItaNewSystem", "allowPlayerWizard"); } catch (e) { }
    if (!game.user.isGM && !allowPlayer) return;

    const button = $(`<button type="button" class="wizard-button"><i class="fa-solid fa-wand-magic-sparkles"></i> ${game.i18n.localize("WITCHER.Wizard.Button.Launch")}</button>`);

    button.click(ev => {
        ev.preventDefault();
        new WitcherCharacterWizard().render({ force: true });
    });

    const footer = $html.find(".directory-footer");
    if (footer.length) footer.append(button);
    else {
        const header = $html.find(".directory-header .header-actions");
        if (header.length) header.append(button);
        else $html.append(button);
    }
}

function combatHooks(combat, update, options, userId) {
    applyGeneralCombatHooks(combat, update);
    removeExpiredEffects(combat);
    countdownDurationOfRegions(combat, update, options, userId);
}