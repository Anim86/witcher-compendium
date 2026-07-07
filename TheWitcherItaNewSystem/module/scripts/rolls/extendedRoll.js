import { RollConfig } from '../rollConfig.js';

/**
 * @param {string} rollFormula rollFormula to apply
 * @param {*} messageData messageData to display
 * @param {RollConfig} config Configuration for Extended roll
 * @param {Flag} flags an object/array of objects of flags to be set
 */
export async function extendedRoll(rollFormula, messageData, config = new RollConfig(), flags = []) {
    let roll = await new Roll(rollFormula).evaluate();
    let rollTotal = Number(roll.total);

    //crit/fumble calculation
    if (config.showCrit && (isCrit(roll) || isFumble(roll))) {
        let extraRollDescription = isCrit(roll)
            ? `${game.i18n.localize('WITCHER.Crit')}`
            : `${game.i18n.localize('WITCHER.Fumble')}`;

        let critClass = config.reversal ? 'dice-fail' : 'dice-success';
        let fumbleClass = config.reversal ? 'dice-success' : 'dice-fail';
        messageData.flavor += isCrit(roll)
            ? `<div class="${critClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize('WITCHER.Crit')}</div>`
            : `<div class="${fumbleClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize('WITCHER.Fumble')}</div>`;

        messageData.flavor += `<div>${rollFormula} = <b>${rollTotal}</b></div>`;
        messageData.flavor += `<div>Dado: <b>${formatDiceResults(roll)}</b></div>`;

        //print crit/fumble roll
        let extraRollFormula = `1d10x10[${extraRollDescription}]`;
        let extraRoll = await new Roll(extraRollFormula).evaluate();
        let extraRollTotal = Number(extraRoll.total);
        messageData.flavor += `<div>${extraRollFormula} = <b>${extraRollTotal}</b></div>`;
        messageData.flavor += `<div>${extraRollDescription}: <b>${formatDiceResults(extraRoll)}</b></div>`;

        //add/subtract extra result from the original one
        extraRollFormula = `${rollTotal}[${game.i18n.localize('WITCHER.BeforeCrit')}]`;
        let options;
        if (isCrit(roll)) {
            extraRollFormula += `+${extraRollTotal}[${extraRollDescription}]`;
            rollTotal += extraRollTotal;
            options = {
                crit: true
            };
        } else {
            options = {
                fumble: true,
                fumbleAmount: extraRollTotal
            };

            extraRollFormula += `-${extraRollTotal}[${extraRollDescription}]`;
            if (extraRollTotal > rollTotal) {
                extraRollFormula += `+${extraRollTotal - rollTotal}[Minimo 0]`;
            }
            rollTotal -= extraRollTotal;
        }

        //print add/subtract roll info
        extraRoll = await new Roll(extraRollFormula, null, options).evaluate();
        roll = extraRoll;
    }

    messageData.system.rollTotal = roll.total;

    //calculate overall success/failure for the attack/defense
    if (config.threshold >= 0) {
        let success;
        if (!config.reversal) {
            success = config.defense ? roll.total >= config.threshold : roll.total > config.threshold;
            roll.options.rollOver = roll.total - config.threshold;
        } else {
            success = config.defense ? roll.total <= config.threshold : roll.total < config.threshold;
            roll.options.rollOver = config.threshold - roll.total;
        }

        roll.options.success = success;

        let successHeader = config.thresholdDesc
            ? `: ${game.i18n.localize(config.thresholdDesc)}`
            : ': ' + config.threshold;
        messageData.flavor += success
            ? `<div class="dice-success"><i>${game.i18n.localize('WITCHER.Chat.Success')}${successHeader}</i></br>${config.messageOnSuccess}</div>`
            : `<div class="dice-fail"><i>${game.i18n.localize('WITCHER.Chat.Fail')}${successHeader}</i></br>${config.messageOnFailure}</div>`;

        messageData.flags = {
            TheWitcherItaNewSystem: success ? config.flagsOnSuccess : config.flagsOnFailure
        };
    }

    if (config.showResult) {
        let message = await roll.toMessage(messageData);
        if (flags) {
            if (Array.isArray(flags)) {
                flags.forEach(flag => message.setFlag('TheWitcherItaNewSystem', flag.key, flag.value));
            } else {
                message.setFlag('TheWitcherItaNewSystem', flags.key, flags.value);
            }
        }
    } else {
        roll.messageData = messageData;
    }

    return roll;
}

function isCrit(roll) {
    return roll.dice[0]?.results[0].result == 10;
}

function isFumble(roll) {
    return roll.dice[0]?.results[0].result == 1;
}

function formatDiceResults(roll) {
    const results = roll.dice[0]?.results
        ?.filter(result => result.active !== false)
        .map(result => result.result);

    if (!results?.length) return roll.total;
    return results.join(' + ');
}
