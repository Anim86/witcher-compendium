import { removeExpiredEffects } from '../scripts/temporaryEffects/temporaryEffectHook.js';
import { applyGeneralCombatHooks } from '../scripts/combat/generalCombatHook.js';
import { countdownDurationOfRegions } from '../scripts/regions/regionHooks.js';
import WitcherCharacterWizard from '../app/WitcherCharacterWizard.js';

console.log("TheWitcherItaNewSystem | hooks.js loaded");

export function registerHooks() {
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

    // Modern V12/V13/V14 way to add buttons to sidebar header
    Hooks.on('getSidebarTabControlButtons', (app, buttons) => {
        if (app?.constructor?.name === "ActorDirectory") {
            let allowPlayer = true;
            try {
                allowPlayer = game.settings.get("TheWitcherItaNewSystem", "allowPlayerWizard");
            } catch (e) {}

            if (game.user.isGM || allowPlayer) {
                buttons.push({
                    name: "character-wizard",
                    title: game.i18n.localize("WITCHER.Wizard.Button.Launch"),
                    icon: "fa-solid fa-wand-magic-sparkles",
                    callback: () => {
                        console.log("TheWitcherItaNewSystem | Launching Character Wizard from header button");
                        new WitcherCharacterWizard().render({ force: true });
                    }
                });
            }
        }
    });
}

function _addWizardButton(html) {
    const $html = (html instanceof HTMLElement) ? $(html) : html;
    if ($html.find(".wizard-button").length > 0) return;
    
    console.log("TheWitcherItaNewSystem | Attempting to add Wizard button to Actor Directory");
    
    let allowPlayer = true;
    try {
        allowPlayer = game.settings.get("TheWitcherItaNewSystem", "allowPlayerWizard");
    } catch (e) {}

    if (!game.user.isGM && !allowPlayer) return;

    const button = $(`<button type="button" class="wizard-button"><i class="fa-solid fa-wand-magic-sparkles"></i> ${game.i18n.localize("WITCHER.Wizard.Button.Launch")}</button>`);
    
    button.click(ev => {
        ev.preventDefault();
        console.log("TheWitcherItaNewSystem | Wizard button clicked");
        new WitcherCharacterWizard().render({ force: true });
    });

    // Try multiple insertion points
    const footer = $html.find(".directory-footer");
    if (footer.length) {
        footer.append(button);
        console.log("TheWitcherItaNewSystem | Button added to footer");
    } else {
        const header = $html.find(".directory-header .header-actions");
        if (header.length) {
            header.append(button);
            console.log("TheWitcherItaNewSystem | Button added to header-actions");
        } else {
            $html.append(button); // Extreme fallback
            console.log("TheWitcherItaNewSystem | Button added to root of sidebar (emergency fallback)");
        }
    }
}

function combatHooks(combat, update, options, userId) {
    applyGeneralCombatHooks(combat);
    removeExpiredEffects(combat);
    countdownDurationOfRegions(combat, update, options, userId);
}
