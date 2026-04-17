import { extendedRoll } from '../rolls/extendedRoll.js';
import { getInteractActor } from '../helper.js';
import { RollConfig } from '../rollConfig.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';

export function addVerbalCombatDefenseMessageContextOptions(html, options) {
    let canDefend = li => li.querySelector('.verbal-combat-attack-message')?.length;
    options.push({
        name: `${game.i18n.localize('WITCHER.Context.Defense')}`,
        icon: '<i class="fas fa-shield-alt"></i>',
        condition: canDefend,
        callback: async li => {
            executeDefense(await getInteractActor(), li.dataset.messageId, li.find('.dice-total')[0].innerText);
        }
    });
    return options;
}

async function executeDefense(actor, messageId, totalAttack) {
    if (!actor) return;

    const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
        'systems/TheWitcherItaNewSystem/templates/dialog/verbal-combat-defense.hbs',
        {
            defenses: CONFIG.WITCHER.verbalCombat.Defenses
        }
    );

    const dialog = new foundry.applications.api.DialogV2({
        window: { 
            title: game.i18n.localize('WITCHER.verbalCombat.Title'),
            classList: ["verbal-combat-dialog"]
        },
        classes: ["verbal-combat-dialog"],
        content: dialogTemplate,
        buttons: [
            {
                action: "roll",
                label: game.i18n.localize('WITCHER.Dialog.ButtonRoll'),
                default: true,
                callback: (event, button, instance) => executeDefenseCallback(actor, totalAttack, instance.element)
            },
            {
                action: "cancel",
                label: game.i18n.localize('WITCHER.Button.Cancel')
            }
        ]
    });
    dialog.render(true);
}

async function executeDefenseCallback(actor, totalAttack, html) {
    let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

    let checkedBox = html.querySelector('input[name="verbalCombat"]:checked');
    if (!checkedBox) return;
    let verbal = checkedBox.value;

    if (verbal == 'Counterargue') {
        actor.verbalCombat();
        return;
    }

    let verbalCombat = CONFIG.WITCHER.verbalCombat.Defenses[verbal];
    let vcName = verbalCombat.name;

    let vcStatName = verbalCombat.skill?.attribute.label ?? 'WITCHER.Context.unavailable';
    let vcStat = verbalCombat.skill ? actor.system.stats[verbalCombat.skill.attribute.name]?.value : 0;

    let vcSkillName = verbalCombat.skill?.label ?? 'WITCHER.Context.unavailable';
    let vcSkill = verbalCombat.skill
        ? actor.system.skills[verbalCombat.skill.attribute.name][verbalCombat.skill.name]?.value
        : 0;

    let vcDmg = verbalCombat.baseDmg
        ? `${verbalCombat.baseDmg}+${actor.system.stats[verbalCombat.dmgStat.name].value}[${game.i18n.localize(verbalCombat.dmgStat?.label)}]`
        : game.i18n.localize('WITCHER.verbalCombat.None');

    let effect = verbalCombat.effect;

    let rollFormula = `1d10`;

    if (verbalCombat.skill) {
        rollFormula += !displayRollDetails
            ? ` +${vcStat} +${vcSkill}`
            : ` +${vcStat}[${game.i18n.localize(vcStatName)}] +${vcSkill}[${game.i18n.localize(vcSkillName)}]`;
        rollFormula += actor.addAllModifiers(verbalCombat.skill.name);
    }

    let customAtt = html.find('[name=customModifiers]')[0].value;
    if (customAtt < 0) {
        rollFormula += !displayRollDetails
            ? `${customAtt}`
            : `${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
    }
    if (customAtt > 0) {
        rollFormula += !displayRollDetails
            ? `+${customAtt}`
            : `+${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
    }

    let messageData = new ChatMessageData(actor);
    messageData.flavor = `
            <div class="verbal-combat-attack-message">
              <h2>${game.i18n.localize('WITCHER.verbalCombat.Title')}: ${game.i18n.localize(vcName)}</h2>
              <b>${game.i18n.localize('WITCHER.verbalCombat.ResolveDamage')}</b>: ${vcDmg} <br />
              ${game.i18n.localize(effect)}
              <hr />
              </div>`;
    messageData.flavor += vcDmg.includes('d')
        ? `<button class="vcDamage" > ${game.i18n.localize('WITCHER.verbalCombat.RollResolveDamage')}</button>`
        : '';

    let config = createRollConfig(vcSkill, totalAttack);
    config.showCrit = true;
    await extendedRoll(rollFormula, messageData, config, actor.createVerbalCombatFlags(verbalCombat, vcDmg));
}

function createRollConfig(skill, totalAttack) {
    let config = new RollConfig();
    config.showResult = true;
    config.defense = true;
    config.threshold = totalAttack;
    config.thresholdDesc = skill.label;
    return config;
}
