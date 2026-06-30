import { getInteractActor } from '../helper.js';

const DialogV2 = foundry.applications.api.DialogV2;

export function addDamageMessageContextOptions(html, options) {
    let canApplyDamage = li => li.querySelector('.damage-message');
    options.push(
        {
            label: `${game.i18n.localize('WITCHER.Context.applyDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            visible: canApplyDamage,
            callback: async li => {
                ApplyNormalDamage(
                    await getInteractActor(),
                    parseInt(li.querySelector('.dice-total').innerText),
                    li.dataset.messageId
                );
            }
        },
        {
            label: `${game.i18n.localize('WITCHER.Context.applyNonLethal')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            visible: canApplyDamage,
            callback: async li => {
                ApplyNonLethalDamage(
                    await getInteractActor(),
                    parseInt(li.querySelector('.dice-total').innerText),
                    li.dataset.messageId
                );
            }
        }
    );
    return options;
}

async function ApplyNormalDamage(actor, totalDamage, messageId) {
    let damage = game.messages.get(messageId).getFlag('TheWitcherItaNewSystem', 'damage');
    applyDamageFromMessage(actor, totalDamage, messageId, damage.properties.isNonLethal ? 'sta' : 'hp');
}

async function ApplyNonLethalDamage(actor, totalDamage, messageId) {
    applyDamageFromMessage(actor, totalDamage, messageId, 'sta');
}

async function createApplyDamageDialog(actor, damageObject) {
    const locationOptions = `
    <option value="Empty"></option>
    <option value="head"> ${game.i18n.localize('WITCHER.Dialog.attackHead')} </option>
    <option value="torso"> ${game.i18n.localize('WITCHER.Dialog.attackTorso')} </option>
    <option value="leftArm"> ${game.i18n.localize('WITCHER.Dialog.attackLArm')} </option>
    <option value="rightArm"> ${game.i18n.localize('WITCHER.Dialog.attackRArm')} </option>
    <option value="leftLeg"> ${game.i18n.localize('WITCHER.Dialog.attackLLeg')} </option>
    <option value="rightLeg"> ${game.i18n.localize('WITCHER.Dialog.attackRLeg')} </option>
    <option value="tailWing"> ${game.i18n.localize('WITCHER.Dialog.attackTail')} </option>
    `;

    let location = damageObject.location;
    let damageTypeloc = `WITCHER.DamageType.${damageObject.type}`;
    let content = `<label>${game.i18n.localize('WITCHER.Damage.damageType')}: <b>${game.i18n.localize(damageTypeloc)}</b></label> <br />
      <label>${game.i18n.localize('WITCHER.Damage.CurrentLocation')}: <b>${location.alias}</b></label> <br />
      <label>${game.i18n.localize('WITCHER.Damage.ChangeLocation')}: <select name="changeLocation">${locationOptions}</select></label> <br />`;

    let itemSource = damageObject.item?.system?.source;
    let isImmune = actor.system.automatedImmunities?.includes(damageObject.type) || (itemSource && actor.system.automatedImmunities?.includes(itemSource));
    let isResistant = actor.system.automatedResistances?.includes(damageObject.type) || (itemSource && actor.system.automatedResistances?.includes(itemSource));
    let isVulnerableAuto = actor.system.automatedVulnerabilities?.includes(damageObject.type) || (itemSource && actor.system.automatedVulnerabilities?.includes(itemSource));

    if (isImmune) {
        content += `<div style="color:red; font-weight:bold; margin-top:5px; margin-bottom:5px;">⚠️ BERSAGLIO IMMUNE A QUESTO DANNO! (Danno azzerato automaticamente)</div>`;
    } else if (isResistant) {
        content += `<div style="color:orange; font-weight:bold; margin-top:5px; margin-bottom:5px;">⚠️ BERSAGLIO RESISTENTE (Danni dimezzati automaticamente)</div>`;
    } else if (isVulnerableAuto) {
        content += `<div style="color:purple; font-weight:bold; margin-top:5px; margin-bottom:5px;">⚠️ BERSAGLIO VULNERABILE (Danni raddoppiati automaticamente)</div>`;
    }

    if (actor.type == 'monster') {
        content += `<label>${game.i18n.localize('WITCHER.Damage.resistNonSilver')}: <input type="checkbox" name="resistNonSilver" ${actor.system.resistantNonSilver ? 'checked' : 'unchecked'}></label><br />
                    <label>${game.i18n.localize('WITCHER.Damage.resistNonMeteorite')}: <input type="checkbox" name="resistNonMeteorite" ${actor.system.resistantNonMeteorite ? 'checked' : 'unchecked'}></label><br />`;
    }

    let isMagicShield = actor.getFlag('TheWitcherItaNewSystem', 'magicShield');
    let hasPhysicalShield = !isMagicShield && (actor.system.derivedStats.shield.value > 0);

    if (hasPhysicalShield) {
        content += `<label>${game.i18n.localize('WITCHER.Damage.useShield') || 'Usa Scudo Fisico Equipaggiato'}: <input type="checkbox" name="useShield" checked></label><br />`;
    }

    content += `<label>${game.i18n.localize('WITCHER.Damage.isVulnerable')}: <input type="checkbox" name="vulnerable"></label><br />
    <label>${game.i18n.localize('WITCHER.Damage.oilDmg')}: <input type="checkbox" name="oilDmg"></label><br />`;

    let { newLocation, resistNonSilver, resistNonMeteorite, isVulnerable, addOilDmg, useShield } = await DialogV2.prompt({
        window: { title: `${game.i18n.localize('WITCHER.Context.applyDmg')}` },
        content: content,
        modal: true,
        ok: {
            callback: (event, button, dialog) => {
                return {
                    newLocation: button.form.elements.changeLocation?.value,
                    resistNonSilver: button.form.elements.resistNonSilver?.checked,
                    resistNonMeteorite: button.form.elements.resistNonMeteorite?.checked,
                    isVulnerable: button.form.elements.vulnerable?.checked,
                    addOilDmg: button.form.elements.oilDmg?.checked,
                    useShield: button.form.elements.useShield ? button.form.elements.useShield.checked : true
                };
            }
        },
        rejectClose: true
    });

    return {
        resistNonSilver,
        resistNonMeteorite,
        newLocation,
        isVulnerable,
        addOilDmg,
        useShield
    };
}

async function applyDamageFromStatus(actor, totalDamage, damageObject, derivedStat) {
    actor.applyDamage(null, totalDamage, damageObject, derivedStat);
}

async function applyDamageFromMessage(actor, totalDamage, messageId, derivedStat) {
    let damage = game.messages.get(messageId).getFlag('TheWitcherItaNewSystem', 'damage');

    let dialogData = await createApplyDamageDialog(actor, damage);

    if (dialogData.newLocation != 'Empty') {
        damage.location = actor.getLocationObject(dialogData.newLocation);
    }

    if (dialogData.addOilDmg) {
        damage.properties.oilEffect = actor.system.category;
    }

    if (dialogData.useShield === false) {
        damage.properties.useShield = false;
    }

    actor.applyDamage(dialogData, totalDamage, damage, derivedStat);
}

export { ApplyNormalDamage, ApplyNonLethalDamage, applyDamageFromStatus };
