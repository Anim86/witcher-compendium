import { extendedRoll } from '../scripts/rolls/extendedRoll.js';
import { getRandomInt } from '../scripts/helper.js';
import { RollConfig } from '../scripts/rollConfig.js';
import { WITCHER } from '../setup/config.js';
import { modifierMixin } from './mixins/modifierMixin.js';
import { damageUtilMixin } from './mixins/damageUtilMixin.js';
import { castSpellMixin } from './mixins/castSpellMixin.js';
import { locationMixin } from './mixins/locationMixin.js';
import { weaponAttackMixin } from './mixins/weaponAttackMixin.js';
import { verbalCombatMixin } from './mixins/verbalCombatMixin.js';
import { defenseMixin } from './mixins/defenseMixin.js';
import { damageMixin } from './mixins/damageMixin.js';
import { temporaryEffectMixin } from './mixins/temporaryEffectMixin.js';
import ChatMessageData from '../chatMessage/chatMessageData.js';
import { professionMixin } from './mixins/professionMixin.js';
import { armorMixin } from './mixins/armorMixin.js';
import { healMixin } from './mixins/healMixin.js';
import { rewardsMixin } from './mixins/rewardsMixin.js';
import { craftingMixin } from './mixins/craftingMixin.js';

const DialogV2 = foundry.applications.api.DialogV2;

const derivedPaths = ['derivedStats', 'attackStats'];

export default class WitcherActor extends Actor {
    static CRIT_HEALING_TABLE = {
        simple: { 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1 },
        complex: { 3: 9, 4: 8, 5: 7, 6: 6, 7: 5, 8: 4, 9: 3, 10: 2, 11: 1, 12: 1, 13: 1 },
        difficult: { 3: 12, 4: 11, 5: 10, 6: 9, 7: 8, 8: 7, 9: 6, 10: 5, 11: 4, 12: 3, 13: 2 }
    };

    /**
     * An array of ActiveEffect instances which are present on the Actor or Items which have a limited duration.
     * @type {ActiveEffect[]}
     */
    get temporaryEffects() {
        let temporaryEffects = super.temporaryEffects;

        let temporaryItemImprovements = this.items
            .map(item => item.effects.filter(effect => effect.isAppliedTemporaryItemImprovement))
            .flat();
        return temporaryEffects.concat(temporaryItemImprovements);
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        if (this.type === 'loot') return;
        if (this.type === 'mystery') return;

        let armorEffects = this.getList('armor')
            .filter(armor => armor.system.equipped)
            .map(armor => armor.system.effects)
            .flat()
            .filter(effect => effect.statusEffect)
            .map(effect => WITCHER.armorEffects.find(armorEffect => armorEffect.id == effect.statusEffect));
        this.applyStatus(armorEffects);

        this.calculateStats();
        this.calculateFixedDerivedStats();
        this.calculateStats();
        this.calculateDerivedStats();
        this.calculateToxicity();
        this.calculateAttackStats();
        this.calculateShield();
        this.applyActiveEffects('derived');
        this.calculateArmorSP();
    }

    /** @override */
    async _preUpdate(changed, options, user) {
        await super._preUpdate(changed, options, user);

        // Se vengono aggiornate le ferite critiche
        if (foundry.utils.hasProperty(changed, 'system.critWounds')) {
            const currentWounds = this.system.critWounds || [];
            const changedWounds = changed.system.critWounds;

            // Foundry gestisce gli aggiornamenti agli array come oggetti di indici
            for (let [i, woundUpdate] of Object.entries(changedWounds)) {
                const originalWound = currentWounds[i];
                if (!originalWound) continue;

                // Se la ferita è stata appena segnata come 'treated' o 'stabilized' o è cambiato il tipo
                const treatedJustFlipped = woundUpdate.treated === true && !originalWound.treated;
                const stabilizedJustFlipped = (woundUpdate.stabilized === true && !originalWound.stabilized) || (woundUpdate.treated === true && !originalWound.stabilized);
                const typeChanged = !!woundUpdate.configEntry && woundUpdate.configEntry !== originalWound.configEntry;

                if (treatedJustFlipped || stabilizedJustFlipped || typeChanged) {
                    // Calcola il tempo di guarigione se non è già presente o se è cambiato il tipo
                    if (!originalWound.healingTime || originalWound.healingTime === 0 || typeChanged) {
                        const configEntry = woundUpdate.configEntry || originalWound.configEntry;
                        const config = WITCHER.Crit[configEntry];
                        if (config && config.severity) {
                            woundUpdate.healingTime = this.calculateCritHealingTime(config.severity);
                            if (typeChanged || !originalWound.daysHealed) woundUpdate.daysHealed = 0;
                        }
                    }
                }
            }
        }
    }

    /**
     * Spende Punti Incremento per aumentare un'abilità
     * @param {string} skillPath - Percorso completo dell'abilità (es. 'system.skills.int.awareness')
     */
    async spendIp(skillPath) {
        const skill = foundry.utils.getProperty(this, skillPath);
        if (!skill) return;

        const currentLevel = skill.value || 0;
        const multiplier = skill.multiplier || 1;
        
        // Costo: se livello 0 -> 1 * mult (o 2 per difficile). Se livello > 0 -> livello corrente * mult.
        // Regola: Sbloccare Liv 1 = 1 PI (Normal) o 2 PI (Hard).
        // Aumentare da X a X+1 = X PI. 
        // Aspetta, il manuale dice: "Il costo è esattamente pari al livello corrente dell'abilità".
        // Esempio: da 4 a 5 costa 4 PI.
        // Se è difficile, da 0 a 1 costa 2. Quindi da 4 a 5 costa 4 * 2 = 8? 
        // In realtà il manuale dice che i PI si spendono in base al livello CORRENTE.
        // Se è difficile costa il doppio dei PI.
        
        const cost = (currentLevel === 0 ? 1 : currentLevel) * multiplier;
        const currentIp = this.system.improvementPoints || 0;

        if (currentIp < cost) {
            ui.notifications.warn(game.i18n.format('WITCHER.Notifications.NotEnoughIP', { cost, current: currentIp }));
            return;
        }

        const newLevel = currentLevel + 1;
        const skillLabel = game.i18n.localize(skill.label);

        // Prepara l'aggiornamento
        const updates = {
            [skillPath + '.value']: newLevel,
            'system.improvementPoints': currentIp - cost
        };

        // Aggiungi al log
        const logEntry = {
            label: `${game.i18n.localize('WITCHER.Log.SpentIP')}: ${skillLabel} (${currentLevel} -> ${newLevel})`,
            ip: -cost,
            isMagic: false,
            date: Date.now()
        };

        const currentLogs = Array.from(this.system.logs.ipLog || []);
        currentLogs.push(logEntry);
        updates['system.logs.ipLog'] = currentLogs;

        await this.update(updates);
        ui.notifications.info(game.i18n.format('WITCHER.Notifications.SkillIncreased', { skill: skillLabel, level: newLevel, cost }));
    }

    /**
     * Ritorna un oggetto contenente le statistiche penalizzate dalle ferite critiche
     */
    get penalizedStats() {
        const penalized = {};
        const stats = ['int', 'ref', 'dex', 'body', 'emp', 'cra', 'will', 'luck', 'spd'];
        for (let s of stats) {
            const mods = this.getAllModifiers(s);
            if (mods.totalModifiers < 0 || mods.totalDivider > 1) {
                penalized[s] = true;
            }
        }
        return penalized;
    }

    /**
     * Calcola il tempo di guarigione base per una ferita critica
     * @param {string} severity - 'simple', 'complex', 'difficult'
     * @returns {number} - giorni di guarigione
     */
    calculateCritHealingTime(severity) {
        if (severity === 'deadly') return 0; // Menomazione permanente
        const body = Math.clamp(this.system.stats.body.value, 3, 13);
        const table = WitcherActor.CRIT_HEALING_TABLE[severity];
        return table ? table[body] : 0;
    }

    /**
     * Esegue l'azione di riposo giornaliero
     */
    async rest() {
        const rec = this.system.derivedStats.rec.value;
        const luckStat = this.system.stats.luck;
        const totalLuck = luckStat.unmodifiedMax || luckStat.max || 0;

        const content = `
            <div class="rest-dialog" style="padding: 10px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px;">${game.i18n.localize('WITCHER.Rest.Type')}:</label>
                    <select name="restType" style="width: 100%; padding: 5px;">
                        <option value="full">${game.i18n.localize('WITCHER.Rest.Full')}</option>
                        <option value="active">${game.i18n.localize('WITCHER.Rest.Active')}</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" name="healed" checked id="rest-healed">
                    <label for="rest-healed">${game.i18n.localize('WITCHER.Rest.Healed')}</label>
                </div>
                <div class="form-group" style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" name="assisted" id="rest-assisted">
                    <label for="rest-assisted">${game.i18n.localize('WITCHER.Rest.Assisted')}</label>
                </div>
            </div>
        `;

        return DialogV2.confirm({
            window: { 
                title: game.i18n.localize('WITCHER.Rest.Title'),
                icon: "fas fa-bed"
            },
            content: content,
            yes: {
                label: game.i18n.localize('WITCHER.Rest.Button'),
                callback: async (event, button, dialog) => {
                    const html = dialog.element;
                    const restType = html.querySelector('[name=restType]').value;
                    const assisted = html.querySelector('[name=assisted]').checked;
                    const healed = html.querySelector('[name=healed]').checked;

                    let hpGained = 0;
                    if (healed) {
                        hpGained = restType === 'full' ? rec : Math.floor(rec / 2);
                        if (assisted) hpGained += 3;
                    }

                    // Aggiorna HP
                    const newHp = Math.min(this.system.derivedStats.hp.value + hpGained, this.system.derivedStats.hp.max);
                    
                    // Aggiorna giorni di guarigione ferite critiche
                    const critWounds = foundry.utils.deepClone(this.system.critWounds || []);
                    let woundsProgressed = false;
                    critWounds.forEach(w => {
                        if (w.treated && w.healingTime > 0 && w.daysHealed < w.healingTime) {
                            w.daysHealed += 1;
                            woundsProgressed = true;
                        }
                    });

                    const updateData = {
                        "system.derivedStats.hp.value": newHp,
                        "system.stats.luck.value": totalLuck
                    };
                    if (woundsProgressed) updateData["system.critWounds"] = critWounds;

                    await this.update(updateData);

                    // Messaggio in chat
                    let chatContent = `<h3>${game.i18n.localize('WITCHER.Rest.Title')}</h3>`;
                    chatContent += `<p>${game.i18n.localize('WITCHER.Rest.HPGained')}: <b>${hpGained}</b></p>`;
                    chatContent += `<p>${game.i18n.localize('WITCHER.Rest.LuckReset')}: <b>${totalLuck}</b></p>`;
                    if (woundsProgressed) {
                        chatContent += `<p><i>Le ferite trattate hanno progredito nella guarigione (+1 giorno).</i></p>`;
                    }

                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor: this }),
                        content: chatContent
                    });
                }
            }
        });
    }

    calculateStats() {
        this.calculateStat('int');
        this.calculateStat('ref');
        this.calculateStat('dex');
        this.calculateStat('body');
        this.calculateStat('spd');
        this.calculateStat('emp');
        this.calculateStat('cra');
        this.calculateStat('will');

        this.system.stats.toxicity.max += this.system.stats.toxicity.totalModifiers;
        this.system.stats.luck.max += this.system.stats.luck.totalModifiers;
        
        // Calcola la reputazione includendo i modificatori
        let repModifiers = 0;
        this.system.reputation.modifiers.forEach(item => (repModifiers += Number(item.value)));
        this.system.reputation.max = (this.system.reputation.unmodifiedMax || 0) + repModifiers;
        this.system.reputation.value = this.system.reputation.max;
    }

    calculateStat(stat) {
        let totalModifiers = this.getAllModifiers(stat).totalModifiers;
        let divider = this.getAllModifiers(stat).totalDivider;

        this.system.stats[stat].modifiers.forEach(item => (totalModifiers += Number(item.value)));

        //Adjust for encumbrance
        if (stat === 'ref' || stat === 'dex' || stat === 'spd') {
            if (stat === 'ref' || stat === 'dex') {
                let armorEnc = this.getArmorEcumbrance();
                totalModifiers -= armorEnc;
            }

            totalModifiers -= this.calculateWeigthEncumbrance();
        }

        const HPvalue = this.system.derivedStats.hp.value;
        if (HPvalue <= 0) {
            this.system.deathStateApplied = true;
            divider += 2;
        } else if (HPvalue < this.system.derivedStats.woundTreshold.value && this.system.derivedStats.woundTreshold.value > 0) {
            this.system.woundTresholdApplied = true;
            if (stat === 'ref' || stat === 'dex' || stat === 'int' || stat === 'will') {
                divider += 1;
            }
        }

        let baseVal = this.system.stats[stat].unmodifiedMax || this.system.stats[stat].max || 0;
        this.system.stats[stat].totalModifiers = totalModifiers;
        this.system.stats[stat].value = Math.floor((baseVal + totalModifiers) / divider);
    }

    calculateWeigthEncumbrance() {
        let bodyTotalModifiers = this.getAllModifiers('body').totalModifiers + this.system.stats.body.totalModifiers;
        this.system.stats.body.modifiers.forEach(item => (bodyTotalModifiers += Number(item.value)));
        let bodyBase = this.system.stats.body.unmodifiedMax || this.system.stats.body.max || 0;
        let currentEncumbrance =
            (bodyBase + bodyTotalModifiers) * 10 +
            this.getAllModifiers('enc').totalModifiers +
            this.system.derivedStats.enc.totalModifiers;
        var totalWeights = this.getTotalWeight();

        let encDiff = 0;
        if (currentEncumbrance < totalWeights) {
            encDiff = Math.ceil((totalWeights - currentEncumbrance) / 5);
        }

        return encDiff;
    }

    calculateFixedDerivedStats() {
        const bodyVal = this.system.stats.body.value || 0;
        const willVal = this.system.stats.will.value || 0;
        const bodyMax = this.system.stats.body.unmodifiedMax || this.system.stats.body.max || 0;
        const willMax = this.system.stats.will.unmodifiedMax || this.system.stats.will.max || 0;
        
        const base = Math.floor((bodyVal + willVal) / 2);
        const baseMax = Math.floor((bodyMax + willMax) / 2);

        let stunTotalModifiers = this.getAllModifiers('stun').totalModifiers;
        let stunDivider = this.getAllModifiers('stun').totalDivider;
        this.system.derivedStats.stun.modifiers.forEach(item => (stunTotalModifiers += Number(item.value)));
        this.system.derivedStats.stun.value = Math.floor((Math.clamp(base, 1, 10) + stunTotalModifiers) / stunDivider);
        this.system.derivedStats.stun.max = Math.clamp(baseMax, 1, 10);
        this.system.derivedStats.stun.totalModifiers = stunTotalModifiers;

        let runTotalModifiers = this.getAllModifiers('run').totalModifiers;
        let runDivider = this.getAllModifiers('run').totalDivider;
        this.system.derivedStats.run.modifiers.forEach(item => (runTotalModifiers += Number(item.value)));
        this.system.derivedStats.run.value = Math.floor(
            (this.system.stats.spd.value * 3 + runTotalModifiers) / runDivider
        );
        this.system.derivedStats.run.max = this.system.stats.spd.value * 3;
        this.system.derivedStats.run.totalModifiers = runTotalModifiers;

        let leapTotalModifiers = this.getAllModifiers('leap').totalModifiers;
        let leapDivider = this.getAllModifiers('leap').totalDivider;
        this.system.derivedStats.leap.modifiers.forEach(item => (leapTotalModifiers += Number(item.value)));
        this.system.derivedStats.leap.value =
            Math.floor((this.system.stats.spd.value * 3) / 5 + leapTotalModifiers) / leapDivider;
        this.system.derivedStats.leap.max = Math.floor((this.system.stats.spd.max * 3) / 5);
        this.system.derivedStats.leap.totalModifiers = leapTotalModifiers;

        let encTotalModifiers = this.getAllModifiers('enc').totalModifiers;
        let encDivider = this.getAllModifiers('enc').totalDivider;
        this.system.derivedStats.enc.modifiers.forEach(item => (encTotalModifiers += Number(item.value)));
        this.system.derivedStats.enc.value = Math.floor(
            ((this.system.stats.body.value || 0) * 10 + encTotalModifiers) / encDivider
        );
        const encLimit = (this.system.stats.body.unmodifiedMax || this.system.stats.body.max || 0) * 10;
        this.system.derivedStats.enc.max = encLimit;
        this.system.derivedStats.enc.value = encLimit;
        this.system.derivedStats.enc.totalModifiers = encTotalModifiers;

        let recTotalModifiers = this.getAllModifiers('rec').totalModifiers;
        let recDivider = this.getAllModifiers('rec').totalDivider;
        this.system.derivedStats.rec.modifiers.forEach(item => (recTotalModifiers += Number(item.value)));
        this.system.derivedStats.rec.value = Math.floor((base + recTotalModifiers) / recDivider);
        this.system.derivedStats.rec.max = baseMax;
        this.system.derivedStats.rec.totalModifiers = recTotalModifiers;

        let wtTotalModifiers =
            this.getAllModifiers('woundTreshold').totalModifiers +
            this.system.derivedStats.woundTreshold.totalModifiers;
        let wtDivider = this.getAllModifiers('woundTreshold').totalDivider;
        this.system.derivedStats.woundTreshold.modifiers.forEach(item => (wtTotalModifiers += Number(item.value)));
        this.system.derivedStats.woundTreshold.value = Math.floor((baseMax + wtTotalModifiers) / wtDivider);
        this.system.derivedStats.woundTreshold.max = baseMax;
    }

    calculateDerivedStats() {
        this.calculateDerivedStat('hp');
        this.calculateDerivedStat('sta');
        this.calculateDerivedStat('resolve');
        this.calculateDerivedStat('focus');
        this.calculateDerivedStat('vigor');
    }

    calculateShield() {
        // Initialize with default values
        this.system.derivedStats.shield.value = 0;
        this.system.derivedStats.shield.max = 0;

        let shields = this.items.filter(i => {
            if (i.type !== 'armor' || !i.system.equipped) return false;
            const loc = i.system.location;
            if (!loc) return false;
            
            // Handle both string and array for location (though schema says string)
            const locations = Array.isArray(loc) ? loc : [loc];
            return locations.some(l => l === 'Shield' || l.includes('Shield'));
        });

        if (shields.length > 0) {
            // Take the one with highest current reliability as the active shield
            let bestShield = shields.reduce((prev, current) => 
                ((current.system.reliability || 0) > (prev.system.reliability || 0)) ? current : prev
            );
            this.system.derivedStats.shield.value = bestShield.system.reliability || 0;
            this.system.derivedStats.shield.max = bestShield.system.reliabilityMax || 0;
        }
    }

    calculateDerivedStat(stat) {
        let totalModifiers = this.getAllModifiers(stat).totalModifiers;
        let divider = this.getAllModifiers(stat).totalDivider;

        this.system.derivedStats[stat].modifiers.forEach(item => (totalModifiers += Number(item.value)));

        const bodyVal = this.system.stats.body.value || 0;
        const willVal = this.system.stats.will.value || 0;
        const base = Math.floor((bodyVal + willVal) / 2);
        
        if (!this.system.customStat && (stat === 'hp' || stat === 'sta')) {
            this.system.derivedStats[stat].unmodifiedMax = base * 5;
        }

        let modifiedMax = this.system.derivedStats[stat].unmodifiedMax + totalModifiers;

        if (stat === 'resolve' || stat === 'focus') {
            divider += 1;
        }

        if (!this.system.customStat) {
            if (stat === 'hp' || stat === 'sta') {
                modifiedMax = Math.floor((base * 5 + totalModifiers) / divider);
            } else if (stat === 'resolve') {
                modifiedMax =
                    Math.floor((this.system.stats.will.value + this.system.stats.int.value) / divider) * 5 +
                    totalModifiers;
            } else if (stat === 'focus') {
                modifiedMax =
                    Math.floor((this.system.stats.will.value + this.system.stats.int.value) / divider) * 3 +
                    totalModifiers;
            }
        }

        this.system.derivedStats[stat].max = modifiedMax;
        this.system.derivedStats[stat].value = Math.min(this.system.derivedStats[stat].value, modifiedMax);
        this.system.derivedStats[stat].totalModifiers = totalModifiers;
    }

    calculateToxicity() {
        if (this.type !== 'character') return;

        // 1. Determine Max Toxicity (Threshold)
        // Default is 100%. Check for "Stomach of Iron" (Stomaco di Ferro)
        let toxicityMax = 100;
        const stomachOfIron = this.items.find(
            i => i.name.includes('Stomaco di Ferro') || i.name.includes('Stomach of Iron')
        );
        if (stomachOfIron) {
            toxicityMax = 150;
        }
        this.system.stats.toxicity.max = toxicityMax;

        // 2. Sum current Toxicity from active effects
        let currentToxicity = 0;
        const applicableEffects = this.effects.filter(e => e.active);

        for (const effect of applicableEffects) {
            if (effect.system.toxicity) {
                currentToxicity += Number(effect.system.toxicity);
            }
        }

        this.system.stats.toxicity.value = currentToxicity;

        // 3. Handle Poisoned state
        const isOverLimit = currentToxicity > toxicityMax;
        const hasPoisonStatus = this.statuses.has('poison');

        if (isOverLimit && !hasPoisonStatus) {
            this.toggleStatusEffect('poison');
        } else if (!isOverLimit && hasPoisonStatus) {
            // In Witcher, toxicity-induced poisoning ends when toxicity is back in range
            this.toggleStatusEffect('poison');
        }

        // 4. Handle Frenzy (Frenesia)
        this.system.frenzyActive = false;
        if (isOverLimit) {
            const frenzy = this.items.find(i => i.name.includes('Frenesia') || i.name.includes('Frenzy'));
            if (frenzy) {
                this.system.frenzyActive = true;
            }
        }
    }

    calculateAttackStats() {
        let meleeBonus = Math.ceil((this.system.stats.body.value - 6) / 2) * 2;

        if (this.system.frenzyActive) {
            meleeBonus += 3; // Standard Frenzy damage bonus
        }

        this.system.attackStats.meleeBonus += meleeBonus;
        this.system.attackStats.punch.value = `1d6+${meleeBonus}`;
        this.system.attackStats.kick.value = `1d6+${4 + meleeBonus}`;
    }

    applyActiveEffects(preparationStage) {
        const overrides = {};
        const changes = [];

        const isHalfling = this.items.some(i => i.type === 'race' && i.name.includes('Halfling'));

        switch (preparationStage) {
            case 'derived':
                // Organize non-disabled effects by their application priority
                for (const effect of this.allApplicableEffects()) {
                    if (!effect.active) continue;

                    // Halfling immunity to alchemical benefits
                    if (isHalfling && effect.system.toxicity > 0) continue;

                    changes.push(
                        ...effect.changes
                            .filter(change => derivedPaths.some(path => change.key.includes(path)))
                            .map(change => {
                                const c = foundry.utils.deepClone(change);
                                c.effect = effect;
                                c.priority = c.priority ?? c.mode * 10;
                                return c;
                            })
                    );
                }
                break;
            default:
                //this is the native foundry call
                this.statuses.clear();
                // Organize non-disabled effects by their application priority
                for (const effect of this.allApplicableEffects()) {
                    if (!effect.active) continue;

                    // Halfling immunity to alchemical benefits
                    if (isHalfling && effect.system.toxicity > 0) continue;

                    changes.push(
                        ...effect.changes.map(change => {
                            const c = foundry.utils.deepClone(change);
                            c.effect = effect;
                            c.priority = c.priority ?? c.mode * 10;
                            return c;
                        })
                    );
                    for (const statusId of effect.statuses) this.statuses.add(statusId);
                }
        }

        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for (const change of changes) {
            if (!change.key) continue;
            const changes = change.effect.apply(this, change);
            Object.assign(overrides, changes);
        }

        // Expand the set of final overrides
        this.overrides = foundry.utils.expandObject(overrides);
    }

    /**
     * Spend luck points and return the modifier.
     * Prioritizes temporary luck points first.
     * @param {number} amount
     * @returns {number}
     */
    async spendLuck(amount) {
        if (amount <= 0) return 0;
        
        let luck = this.system.stats.luck;
        let currentTemp = luck.temp || 0;
        let currentVal = luck.value || 0;
        
        if (amount > (currentTemp + currentVal)) {
            amount = currentTemp + currentVal; // Cap at max available
        }
        
        let toSpendFromTemp = Math.min(amount, currentTemp);
        let toSpendFromVal = amount - toSpendFromTemp;
        
        await this.update({
            'system.stats.luck.temp': currentTemp - toSpendFromTemp,
            'system.stats.luck.value': currentVal - toSpendFromVal
        });
        
        return amount;
    }

    async rollSkill(skillName, threshold = -1) {
        return this.rollSkillCheck(CONFIG.WITCHER.skillMap[skillName], threshold);
    }

    async rollSkillCheck(skillMapEntry, threshold = -1) {
        let attribute = skillMapEntry.attribute;
        let attributeLabel = game.i18n.localize(attribute.label);
        let attributeValue = this.system.stats[attribute.name].value;

        let skillName = skillMapEntry.name;
        let skillLabel = game.i18n.localize(skillMapEntry.rollLabel ?? skillMapEntry.label);
        let skillValue = this.system.skills[attribute.name][skillName].value;

        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

        let messageData = new ChatMessageData(this, `${attributeLabel}: ${skillLabel} Check`);

        let rollFormula = '1d10 +';
        if (game.settings.get('TheWitcherItaNewSystem', 'woundsAffectSkillBase')) {
            rollFormula += '(';
        }
        if (!this.system.dontAddAttr) {
            rollFormula += !displayRollDetails ? `${attributeValue} +` : `${attributeValue}[${attributeLabel}] +`;
        }

        rollFormula += !displayRollDetails ? `${skillValue}` : `${skillValue}[${skillLabel}]`;
        rollFormula += this.addAllModifiers(skillMapEntry.name);

        rollFormula += this.addSocialStanding(attribute, skillName);

        let armorEnc = this.getArmorEcumbrance();
        if (armorEnc > 0 && (skillName == 'hexweave' || skillName == 'ritcraft' || skillName == 'spellcast')) {
            rollFormula += !displayRollDetails
                ? `-${armorEnc}`
                : `-${armorEnc}[${game.i18n.localize('WITCHER.Armor.EncumbranceValue')}]`;
        }

        const totalLuck = (this.system.stats.luck.value || 0) + (this.system.stats.luck.temp || 0);

        return await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}` },
            content: `
                <div class="form-group">
                    <label>${game.i18n.localize('WITCHER.Dialog.attackCustom')}:</label>
                    <input name="customModifiers" type="number" value=0>
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize('WITCHER.StLuck')} (${totalLuck}):</label>
                    <input name="luckToSpend" type="number" value=0 min=0 max="${totalLuck}">
                </div>`,
            ok: {
                label: game.i18n.localize('WITCHER.Button.Continue'),
                callback: async (event, button, dialog) => {
                    let customModifier = Number(button.form.elements.customModifiers.value || 0);
                    let luckToSpend = Number(button.form.elements.luckToSpend.value || 0);

                    if (luckToSpend > 0) {
                        await this.spendLuck(luckToSpend);
                        rollFormula += !displayRollDetails
                            ? ` +${luckToSpend}`
                            : ` +${luckToSpend}[${game.i18n.localize('WITCHER.StLuck')}]`;
                    }

                    if (customModifier < 0) {
                        rollFormula += !displayRollDetails
                            ? ` ${customModifier}`
                            : ` ${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    if (customModifier > 0) {
                        rollFormula += !displayRollDetails
                            ? ` +${customModifier}`
                            : ` +${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    let config = new RollConfig();
                    config.showCrit = true;
                    config.showSuccess = true;
                    config.threshold = threshold;
                    return extendedRoll(rollFormula, messageData, config);
                }
            },
            rejectClose: true
        });
    }

    addSocialStanding(attribute, skillName) {
        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

        const tolerated = ['tolerated', 'toleratedFeared'];
        const feared = ['feared', 'toleratedFeared', 'hatedFeared'];
        const hated = ['hated', 'hatedFeared'];

        let socialModifiers = '';
        if (this.type == 'character') {
            // core rulebook page 21
            if (attribute.name == 'emp') {
                if (
                    skillName == 'charisma' ||
                    skillName == 'leadership' ||
                    skillName == 'persuasion' ||
                    skillName == 'seduction'
                ) {
                    if (tolerated.includes(this.system.general.socialStanding)) {
                        socialModifiers += !displayRollDetails
                            ? `-1`
                            : `-1[${game.i18n.localize('WITCHER.socialStanding.tolerated')}]`;
                    } else if (hated.includes(this.system.general.socialStanding)) {
                        socialModifiers += !displayRollDetails
                            ? `-2`
                            : `-2[${game.i18n.localize('WITCHER.socialStanding.hated')}]`;
                    }
                }

                if (skillName == 'charisma' && feared.includes(this.system.general.socialStanding)) {
                    socialModifiers += !displayRollDetails
                        ? `-1`
                        : `-1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
                }
            }

            if (
                attribute.name == 'will' &&
                skillName == 'intimidation' &&
                feared.includes(this.system.general.socialStanding)
            ) {
                socialModifiers += !displayRollDetails
                    ? `+1`
                    : `+1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
            }
        }

        return socialModifiers;
    }

    async rollCustomSkillCheck(event) {
        let customSkill = this.items.find(item => item.id == event.currentTarget.closest('.item').dataset.itemId);

        let attribute = CONFIG.WITCHER.statMap[customSkill.system.attribute];
        let attributeLabel = game.i18n.localize(attribute.label);
        let attributeValue = this.system.stats[attribute.name].value;

        let skillLabel = customSkill.name;
        let skillValue = customSkill.system.value;

        let displayRollDetails = game.settings.get('TheWitcherItaNewSystem', 'displayRollsDetails');

        let messageData = new ChatMessageData(this, `${attributeLabel}: ${skillLabel} Check`);

        let rollFormula;
        if (this.system.dontAddAttr) {
            rollFormula = !displayRollDetails ? `1d10+${skillValue}` : `1d10+${skillValue}[${skillLabel}]`;
        } else {
            rollFormula = !displayRollDetails
                ? `1d10+${attributeValue}+${skillValue}`
                : `1d10+${attributeValue}[${attributeLabel}]+${skillValue}[${skillLabel}]`;
        }

        rollFormula += this.addAllModifiers(customSkill.name);
        customSkill.system.modifiers?.forEach(mod => {
            if (mod.value < 0) {
                rollFormula += !displayRollDetails ? ` ${mod.value}` : ` ${mod.value}[${mod.name}]`;
            }
            if (mod.value > 0) {
                rollFormula += !displayRollDetails ? ` +${mod.value}` : ` +${mod.value}[${mod.name}]`;
            }
        });

        const totalLuck = (this.system.stats.luck.value || 0) + (this.system.stats.luck.temp || 0);

        return DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}` },
            content: `
                <div class="form-group">
                    <label>${game.i18n.localize('WITCHER.Dialog.attackCustom')}:</label>
                    <input name="customModifiers" type="number" value=0>
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize('WITCHER.StLuck')} (${totalLuck}):</label>
                    <input name="luckToSpend" type="number" value=0 min=0 max="${totalLuck}">
                </div>`,
            ok: {
                label: game.i18n.localize('WITCHER.Button.Continue'),
                callback: async (event, button, dialog) => {
                    let customModifier = Number(button.form.elements.customModifiers.value || 0);
                    let luckToSpend = Number(button.form.elements.luckToSpend.value || 0);

                    if (luckToSpend > 0) {
                        await this.spendLuck(luckToSpend);
                        rollFormula += !displayRollDetails
                            ? ` +${luckToSpend}`
                            : ` +${luckToSpend}[${game.i18n.localize('WITCHER.StLuck')}]`;
                    }

                    if (customModifier < 0) {
                        rollFormula += !displayRollDetails
                            ? ` ${customModifier}`
                            : ` ${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    if (customModifier > 0) {
                        rollFormula += !displayRollDetails
                            ? ` +${customModifier}`
                            : ` +${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    let config = new RollConfig();
                    config.showCrit = true;
                    config.showSuccess = true;
                    return extendedRoll(rollFormula, messageData, config);
                }
            },
            rejectClose: true
        });
    }

    async applyStatus(effects) {
        effects
            ?.filter(effect => !!effect.statusEffect)
            .forEach(effect => {
                if (!this.statuses.find(status => status == effect.statusEffect)) {
                    this.toggleStatusEffect(effect.statusEffect);
                }

                if (this.system.statusEffectImmunities?.find(immunity => immunity == statusEffectId)) {
                    //untoggle it so people see it was tried to be applied but failed
                    setTimeout(() => {
                        this.toggleStatusEffect(statusEffectId);
                    }, 1000);
                }
            });
    }

    async removeStatus(effects) {
        effects
            .filter(effect => !!effect.statusEffect)
            .forEach(effect => {
                if (this.statuses.find(status => status == effect.statusEffect)) {
                    this.toggleStatusEffect(effect.statusEffect);
                }
            });
    }

    async useItem(itemId, options) {
        let item = this.items.get(itemId);

        if (!item) return;

        if (item.type === 'weapon') {
            return this.weaponAttack(item, options);
        }

        if (item.type === 'spell' || item.type === 'hex' || item.type === 'ritual') {
            return this.castSpell(item);
        }

        if (item.isConsumable) {
            item.consume();
            this.removeItem(item.id, 1);
            return;
        }

        // Handle shield offensive attack
        if (item.type === 'armor' && item.system.location?.includes('Shield')) {
            if (item.system.reliability <= 0) {
                return ui.notifications.error(`${game.i18n.localize('WITCHER.Shield.Broken')}: ${item.name}`);
            }
            return this.shieldAttack(item, options);
        }
    }

    async shieldAttack(shield, options = {}) {
        let brawlingSkill = this.system.skills.ref.brawling;
        if (!brawlingSkill) {
            return ui.notifications.error(game.i18n.localize('WITCHER.Weapon.error.noAttackSkill'));
        }

        // Shield weight class bonus
        // Light (Leggero): +0
        // Medium (Medio): +2
        // Heavy (Pesante): +4
        let shieldBonus = 0;
        if (shield.system.type === 'Medium') shieldBonus = 2;
        if (shield.system.type === 'Heavy') shieldBonus = 4;

        // Punch Damage: 1d6 + meleeBonus
        let meleeBonus = Math.ceil((this.system.stats.body.value - 6) / 2) * 2;
        if (this.system.frenzyActive) meleeBonus += 3;
        
        let totalBonus = meleeBonus + shieldBonus;
        // Rules say shield strike deals lethal damage
        let damageFormula = `1d6${totalBonus >= 0 ? '+' : ''}${totalBonus}`;

        // Create a temporary mock weapon object to reuse weaponAttack logic
        const shieldWeapon = {
            id: shield.id,
            name: `${game.i18n.localize('WITCHER.Attack.ShieldStrike')}: ${shield.name}`,
            img: shield.img,
            type: 'weapon',
            system: {
                damage: damageFormula,
                reliability: shield.system.reliability,
                meleeAttackSkill: 'brawling',
                accuracy: 0,
                type: { value: 'bludgeoning' },
                hands: 'none',
                description: shield.system.description,
                applyMeleeBonus: false, // Already included in formula
                isThrowable: false,
                usingAmmo: false,
                defenseOptions: ['block', 'parry'],
                rollOnlyDmg: false,
                enhancementItems: shield.system.enhancementItems || [],
                createBaseDamageObject: () => {
                    return {
                        formula: damageFormula,
                        type: 'bludgeoning',
                        properties: { effects: [] },
                        location: {},
                        originalLocation: 'random'
                    };
                },
                getItemAttack: () => {
                    return {
                        skill: 'brawling',
                        attackOption: 'melee',
                        alias: 'WITCHER.skills.brawling.label'
                    };
                },
                isEnoughThrowable: () => true
            },
            // For disaster damage logic
            update: (data) => shield.update(data)
        };

        return this.weaponAttack(shieldWeapon, options);
    }

    getTotalWeight() {
        let total = this.items.reduce((total, item) => (total += item.system.calcWeight?.() ?? 0), 0);
        return Math.ceil(total + this.system.calcCurrencyWeight());
    }

    getList(name) {
        if (name === 'shield') {
            return this.items
                .filter(item => item.type == 'armor' && item.system.location?.includes('Shield'))
                .sort((a, b) => a.sort - b.sort);
        }
        return this.items.filter(i => i.type == name && !i.system.isStored).sort((a, b) => a.sort - b.sort);
    }

    async addItem(addItem, numberOfItem, forcecreate = false) {
        let foundItem = this.items.find(item => item.name == addItem.name && item.type == addItem.type);
        if (foundItem && !forcecreate && !foundItem.system.isStored) {
            await foundItem.update({
                'system.quantity': String(Number(foundItem.system.quantity) + Number(numberOfItem))
            });
        } else {
            //if toObject cannot be called, we dont have a source => we dont need to call toObject
            let newItem = addItem.toObject ? addItem.toObject(false) : addItem;

            if (numberOfItem) {
                newItem.system.quantity = String(numberOfItem);
            }

            await this.createEmbeddedDocuments('Item', [newItem]);
        }
    }

    async removeItem(itemId, quantityToRemove) {
        let foundItem = this.items.get(itemId);
        let newQuantity = foundItem.system.quantity - quantityToRemove;
        if (newQuantity <= 0) {
            await this.items.get(itemId).delete();
        } else {
            await foundItem.update({ 'system.quantity': newQuantity });
        }
    }

    async removeItemsOfType(type) {
        this.deleteEmbeddedDocuments(
            'Item',
            this.items.filter(item => item.type === type).map(item => item.id)
        );
    }

    static getAllLocations() {
        let locations = ['head', 'torso', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];

        if (this.type == 'monster' && this.system.hasTailWing) {
            locations.push('tailWing');
        }

        return locations;
    }

    static getLocationObject(location) {
        let alias = '';
        let modifier = `+0`;
        let locationFormula;
        switch (location) {
            case 'randomHuman':
                let randomHumanLocation = getRandomInt(10);
                switch (randomHumanLocation) {
                    case 1:
                        location = 'head';
                        locationFormula = 3;
                        break;
                    case 2:
                    case 3:
                    case 4:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                    case 5:
                        location = 'rightArm';
                        locationFormula = 0.5;
                        break;
                    case 6:
                        location = 'leftArm';
                        locationFormula = 0.5;
                        break;
                    case 7:
                    case 8:
                        location = 'rightLeg';
                        locationFormula = 0.5;
                        break;
                    case 9:
                    case 10:
                        location = 'leftLeg';
                        locationFormula = 0.5;
                        break;
                    default:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                }
                alias = `${game.i18n.localize('WITCHER.Location.Random')}`;
                break;
            case 'randomMonster':
                let randomMonsterLocation = getRandomInt(10);
                switch (randomMonsterLocation) {
                    case 1:
                        location = 'head';
                        locationFormula = 3;
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                    case 6:
                    case 7:
                        location = 'rightLeg';
                        locationFormula = 0.5;
                        break;
                    case 8:
                    case 9:
                        location = 'leftLeg';
                        locationFormula = 0.5;
                        break;
                    case 10:
                        location = 'tailWing';
                        locationFormula = 0.5;
                        break;
                    default:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                }
                alias = `${game.i18n.localize('WITCHER.Location.Random')}`;
                break;
            case 'head':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationHead')}`;
                locationFormula = 3;
                modifier = `-6`;
                break;
            case 'torso':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                locationFormula = 1;
                modifier = `-1`;
                break;
            case 'rightArm':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationRight')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationArm'
                )}`;
                locationFormula = 0.5;
                modifier = `-3`;
                break;
            case 'leftArm':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationLeft')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationArm'
                )}`;
                locationFormula = 0.5;
                modifier = `-3`;
                break;
            case 'rightLeg':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationRight')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationLeg'
                )}`;
                locationFormula = 0.5;
                modifier = `-2`;
                break;
            case 'leftLeg':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationLeft')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationLeg'
                )}`;
                locationFormula = 0.5;
                modifier = `-2`;
                break;
            case 'tailWing':
                alias = `${game.i18n.localize('WITCHER.Dialog.attackTail')}`;
                locationFormula = 0.5;
                break;
            default:
                alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                locationFormula = 1;
                modifier = `-1`;
                break;
        }

        return {
            name: location,
            alias: alias,
            locationFormula: locationFormula,
            modifier: modifier
        };
    }
}

Object.assign(WitcherActor.prototype, professionMixin);
Object.assign(WitcherActor.prototype, modifierMixin);
Object.assign(WitcherActor.prototype, damageMixin);
Object.assign(WitcherActor.prototype, damageUtilMixin);
Object.assign(WitcherActor.prototype, weaponAttackMixin);
Object.assign(WitcherActor.prototype, defenseMixin);
Object.assign(WitcherActor.prototype, healMixin);
Object.assign(WitcherActor.prototype, castSpellMixin);
Object.assign(WitcherActor.prototype, verbalCombatMixin);
Object.assign(WitcherActor.prototype, locationMixin);
Object.assign(WitcherActor.prototype, temporaryEffectMixin);
Object.assign(WitcherActor.prototype, armorMixin);
Object.assign(WitcherActor.prototype, rewardsMixin);
Object.assign(WitcherActor.prototype, craftingMixin);
