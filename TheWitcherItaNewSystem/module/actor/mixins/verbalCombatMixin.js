import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';

export let verbalCombatMixin = {
    async verbalCombat() {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');
        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/dialog/verbal-combat.hbs',
            {
                verbalCombat: CONFIG.WITCHER.verbalCombat
            }
        );
        const dialog = new foundry.applications.api.DialogV2({
            window: { 
                title: game.i18n.localize('WITCHER.verbalCombat.DialogTitle'),
                classList: ["verbal-combat-dialog"]
            },
            classes: ["verbal-combat-dialog"],
            content: dialogTemplate,
            buttons: [
                {
                    action: 'roll',
                    label: game.i18n.localize('WITCHER.Dialog.ButtonRoll'),
                    default: true,
                    callback: async (event, button, instance) => {
                        const html = $(instance.element);
                        let checkedBox = instance.element.querySelector('input[name="verbalCombat"]:checked');
                        if (!checkedBox) return;

                        let group = checkedBox.dataset.group;
                        let verbal = checkedBox.value;

                        let verbalCombat = CONFIG.WITCHER.verbalCombat[group][verbal];
                        let vcName = verbalCombat.name;

                        let vcStatName = verbalCombat.skill?.attribute.label ?? 'WITCHER.Context.unavailable';
                        let vcStat = verbalCombat.skill
                            ? this.system.stats[verbalCombat.skill.attribute.name]?.value
                            : 0;

                        let vcSkillName = verbalCombat.skill?.label ?? 'WITCHER.Context.unavailable';
                        let vcSkill = verbalCombat.skill
                            ? this.system.skills[verbalCombat.skill.attribute.name][verbalCombat.skill.name]?.value
                            : 0;

                        let vcDmg = verbalCombat.baseDmg
                            ? `${verbalCombat.baseDmg}+${this.system.stats[verbalCombat.dmgStat.name].value}[${game.i18n.localize(verbalCombat.dmgStat?.label)}]`
                            : game.i18n.localize('WITCHER.verbalCombat.None');
                        if (verbal == 'Counterargue') {
                            vcDmg = `${game.i18n.localize('WITCHER.verbalCombat.CounterargueDmg')}`;
                        }

                        let effect = verbalCombat.effect;

                        let rollFormula = `1d10`;

                        if (verbalCombat.skill) {
                            rollFormula += game.settings.get('TheWitcherItaNewSystem', 'woundsAffectSkillBase') ? ' +(' : ' +';
                            rollFormula += !displayRollDetails
                                ? `${vcStat} +${vcSkill}`
                                : `${vcStat}[${game.i18n.localize(vcStatName)}] +${vcSkill}[${game.i18n.localize(vcSkillName)}]`;
                            rollFormula += this.addAllModifiers(verbalCombat.skill.name);
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

                        let messageData = new ChatMessageData(this);
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

                        let config = new RollConfig();
                        config.showCrit = true;
                        await extendedRoll(
                            rollFormula,
                            messageData,
                            config,
                            this.createVerbalCombatFlags(verbalCombat, vcDmg)
                        );
                    }
                },
                {
                    action: 'cancel',
                    label: game.i18n.localize('WITCHER.Button.Cancel')
                }
            ]
        });
        dialog.render(true);
    },

    createVerbalCombatFlags(verbalCombat, vcDamage) {
        return [
            {
                key: 'verbalCombat',
                value: verbalCombat
            },
            {
                key: 'damage',
                value: {
                    formula: vcDamage
                }
            }
        ];
    }
};
