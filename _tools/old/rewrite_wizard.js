const fs = require('fs');
const filepath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TheWitcherItaNewSystem/module/app/WitcherCharacterWizard.js';
let js = fs.readFileSync(filepath, 'utf8');

// The rewrite script below replaces chunks of the JS. Let's do a complete rewrite.
// Rather than complex replace strings, let's just write the whole file since it's only 560 lines.

const fullCode = `const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Character Creation Wizard for The Witcher TRPG.
 * Guides the user through a multi-step process to generate a new Actor.
 */
export default class WitcherCharacterWizard extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(options = {}) {
        super(options);

        // Wizard State
        this.step = 1;
        this.maxSteps = 7;
        
        // Character Data
        this.characterData = {
            name: "",
            race: null,
            homeland: "Aedirn",
            background: {
                socialStatus: "Paritario",
                familyFate: "",
                events: []
            },
            profession: null,
            stats: {
                int: 3, ref: 3, dex: 3, body: 3, spd: 3, emp: 3, cra: 3, will: 3, luck: 3
            },
            skills: {},
            selectedPickupSkills: [], // We'll populate this dynamically
            gear: [],
            money: 0
        };

        // Cache for compendium data
        this.races = [];
        this.professions = [];
        this.allSkills = [];
        this.activeSkillTab = "profession-skills";
        
        this.difficultSkills = [
            "Bestiario", "Linguaggio", "Tattica", "Alchimia", "Costruire Trappole", 
            "Manifattura", "Intessere Fatture", "Lanciare Incantesimi", "Resistere alla Magia", "Officiare Rituali"
        ];
    }

    static DEFAULT_OPTIONS = {
        id: "witcher-character-wizard",
        tag: "form",
        classes: ["witcher-wizard", "witcher-style"],
        window: {
            title: "WITCHER.Wizard.Title",
            icon: "fa-solid fa-wand-magic-sparkles",
            resizable: true,
            minimizable: true
        },
        position: {
            width: 1000,
            height: 800
        }
    };

    static ACTIONS = {
        nextStep: function(event, target) { this._nextStep(event, target); },
        prevStep: function(event, target) { this._prevStep(event, target); },
        selectRace: function(event, target) { this._selectRace(event, target); },
        selectProfession: function(event, target) { this._selectProfession(event, target); },
        adjustStat: function(event, target) { this._adjustStat(event, target); },
        adjustSkill: function(event, target) { this._adjustSkill(event, target); },
        updateAge: function(event, target) { this._updateAge(event, target); },
        updateMoney: function(event, target) { this._updateMoney(event, target); },
        updateHomeland: function(event, target) { this._updateHomeland(event, target); },
        rollBackground: function(event, target) { this._rollBackground(event, target); },
        rollLifeEvents: function(event, target) { this._rollLifeEvents(event, target); },
        toggleGear: function(event, target) { this._toggleGear(event, target); },
        selectAvatar: function(event, target) { this._selectAvatar(event, target); },
        goToStep: function(event, target) { this._goToStep(event, target); },
        addPickupSkill: function(event, target) { this._addPickupSkill(event, target); },
        finish: function(event, target) { this._finish(event, target); },
        switchSkillTab: function(event, target) { this._switchSkillTab(event, target); }
    };

    static PARTS = {
        navigation: { template: "systems/TheWitcherItaNewSystem/templates/app/wizard/navigation.hbs" },
        content: { template: "systems/TheWitcherItaNewSystem/templates/app/wizard/content.hbs" },
        footer: { template: "systems/TheWitcherItaNewSystem/templates/app/wizard/footer.hbs" }
    };

    /* -------------------------------------------- */
    /*  Data Preparation                            */
    /* -------------------------------------------- */

    async _prepareContext(options, renderContext) {
        try {
            // 1. Load Compendiums
            if (this.races.length === 0) {
                const racePack = game.packs.get("witcher-compendium.witcher-races");
                const docs = racePack ? await racePack.getDocuments() : [];
                this.races = docs.map(d => {
                    const obj = d.toObject();
                    obj._id = d.id;
                    obj.id = d.id;
                    return obj;
                });
            }
            if (this.professions.length === 0) {
                const profPack = game.packs.get("witcher-compendium.witcher-professions");
                const docs = profPack ? await profPack.getDocuments() : [];
                this.professions = docs.map(d => {
                    const obj = d.toObject();
                    obj._id = d.id;
                    obj.id = d.id;
                    return obj;
                });
            }
            if (this.allSkills.length === 0) {
                const skillPack = game.packs.get("witcher-compendium.witcher-skills");
                const docs = skillPack ? await skillPack.getDocuments() : [];
                this.allSkills = docs.map(d => {
                    const obj = d.toObject();
                    obj._id = d.id;
                    obj.id = d.id;
                    return obj;
                }).sort((a,b) => a.name.localeCompare(b.name));
            }
            
            // 1.1 Calculate Budget and Gear Cost
            const gearCost = this.characterData.gear.reduce((acc, item) => {
                const cost = Number(item.system?.cost?.value || item.system?.cost || 0);
                return acc + cost;
            }, 0);
            const isOverBudget = gearCost > (Number(this.characterData.money) || 0);
            
            // 2. Load Gear
            if (!this.weapons) {
                const weaponPack = game.packs.get("witcher-compendium.witcher-weapons");
                this.weapons = weaponPack ? await weaponPack.getDocuments() : [];
                const armorPack = game.packs.get("witcher-compendium.witcher-armor");
                this.armor = armorPack ? await armorPack.getDocuments() : [];
                const gearPack = game.packs.get("witcher-compendium.witcher-equipment");
                this.gear = gearPack ? await gearPack.getDocuments() : [];
            }

            const sanitizeItem = (i) => {
                const obj = i.toObject ? i.toObject() : i;
                obj._id = obj._id || obj.id || i.id;
                obj.id = obj._id;
                if (obj.system && (obj.system.reliability === null || obj.system.reliability === undefined)) {
                    obj.system.reliability = 0;
                }
                return {
                    ...obj,
                    selected: this.characterData.gear.some(g => (g._id === obj.id || g.id === obj.id))
                };
            };

            const statsTotal = Object.values(this.characterData.stats).reduce((a, b) => a + Number(b), 0);
            const statsRemaining = 60 - statsTotal;

            const stats = {};
            for (const [key, statDef] of Object.entries(CONFIG.WITCHER.statMap)) {
                if (statDef.origin === "stats") {
                    stats[key] = { label: statDef.labelShort || statDef.label, value: this.characterData.stats[key] || 0 };
                }
            }

            let filteredProfessions = this.professions;
            if (this.characterData.race) {
                const raceName = (this.characterData.race.name || "").toLowerCase();
                filteredProfessions = this.professions.filter(p => {
                    const pName = (p.name || "").toLowerCase();
                    
                    // Filter Mago/Prete/Sacerdote
                    if (pName.includes("mago") || pName.includes("prete") || pName.includes("sacerdote")) {
                        return raceName.includes("umani") || raceName.includes("elfi") || raceName.includes("umano") || raceName.includes("elfo");
                    }
                    
                    // Filter Witcher
                    if (pName.includes("witcher")) {
                        return raceName.includes("witcher");
                    }
                    
                    return true;
                });
            }

            return {
                step: this.step,
                maxSteps: this.maxSteps,
                steps: this._getStepList(),
                character: this.characterData,
                races: this.races,
                professions: filteredProfessions,
                stats: stats,
                homelands: Object.entries(CONFIG.WITCHER.homelands || {}).map(([v, l]) => ({ value: v, label: l })),
                socialStandings: Object.entries(CONFIG.WITCHER.socialStanding || {}).map(([v, l]) => ({ value: v, label: l })),
                pointsRemaining: statsRemaining,
                derived: this._calculateDerivedStats(),
                professionSkills: this._getProfessionSkills(),
                pickupSkills: this._getPickupSkills(),
                availablePickupSkills: this._getAvailablePickupSkills(),
                professionPointsRemaining: this._calculateSkillPoints("profession"),
                pickupPointsRemaining: this._calculateSkillPoints("pickup"),
                activeSkillTab: this.activeSkillTab,
                isFirstStep: this.step === 1,
                isLastStep: this.step === this.maxSteps,
                currentTemplate: this._getTemplateForStep(this.step),
                allGear: {
                    weapons: (this.weapons || []).map(sanitizeItem),
                    armor: (this.armor || []).map(sanitizeItem),
                    equipment: (this.gear || []).map(sanitizeItem)
                },
                gearCost: gearCost,
                isOverBudget: isOverBudget,
                professionGear: this.characterData.profession?.system?.notes || "",
                summary: this._getSummaryContext()
            };
        } catch (error) {
            console.error("TheWitcherItaNewSystem | Wizard Error:", error);
            return { error: true, message: error.message };
        }
    }

    _getSummaryContext() {
        const stats = [];
        for (const [key, value] of Object.entries(this.characterData.stats)) {
            const statDef = CONFIG.WITCHER.statMap[key];
            if (statDef?.origin === "stats") stats.push({ label: statDef.labelShort || key, value });
        }
        const skills = [];
        for (const [key, value] of Object.entries(this.characterData.skills)) {
            if (value > 0) {
                const s = this.allSkills.find(s => s._id === key);
                skills.push({ label: s ? s.name : key, value });
            }
        }
        return { stats, skills };
    }

    _getProfessionSkillNames() {
        if (!this.characterData.profession) return [];
        const profSkillsStr = this.characterData.profession.system?.professionSkills || "";
        return profSkillsStr.split(",").map(s => s.trim()).filter(s => s);
    }

    _getProfessionSkills() {
        const names = this._getProfessionSkillNames();
        const result = [];
        for (const name of names) {
            const skill = this.allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (skill) {
                const isDiff = this.difficultSkills.includes(skill.name);
                result.push({
                    key: skill._id,
                    name: skill.name,
                    value: this.characterData.skills[skill._id] || 1, // Start at 1
                    cost: isDiff ? 2 : 1,
                    isDifficult: isDiff
                });
                
                // Initialize default value if missing
                if (this.characterData.skills[skill._id] === undefined) {
                    this.characterData.skills[skill._id] = 1;
                }
            }
        }
        return result;
    }

    _getPickupSkills() {
        return this.characterData.selectedPickupSkills.map(id => {
            const skill = this.allSkills.find(s => s._id === id);
            if (!skill) return null;
            const isDiff = this.difficultSkills.includes(skill.name);
            return {
                key: skill._id,
                name: skill.name,
                value: this.characterData.skills[skill._id] || 0,
                cost: isDiff ? 2 : 1,
                isDifficult: isDiff
            };
        }).filter(s => s !== null);
    }

    _getAvailablePickupSkills() {
        const profNames = this._getProfessionSkillNames().map(n => n.toLowerCase());
        return this.allSkills.filter(s => {
            const isProf = profNames.includes(s.name.toLowerCase());
            const isSelected = this.characterData.selectedPickupSkills.includes(s._id);
            return !isProf && !isSelected;
        }).map(s => {
            return {
                key: s._id,
                name: s.name,
                cost: this.difficultSkills.includes(s.name) ? 2 : 1
            };
        });
    }

    _calculateSkillPoints(type) {
        if (type === "profession") {
            const spent = this._getProfessionSkills().reduce((acc, s) => acc + (s.value * s.cost), 0);
            return 44 - spent;
        } else {
            const available = (Number(this.characterData.stats.int) || 0) + (Number(this.characterData.stats.ref) || 0);
            const spent = this._getPickupSkills().reduce((acc, s) => acc + (s.value * s.cost), 0);
            return available - spent;
        }
    }

    _getStepList() {
        const labels = [
            "WITCHER.Wizard.Step.Race.Title",
            "WITCHER.Wizard.Step.Background.Title",
            "WITCHER.Wizard.Step.Profession.Title",
            "WITCHER.Wizard.Step.Stats.Title",
            "WITCHER.Wizard.Step.Skills.Title",
            "WITCHER.Wizard.Step.Gear.Title",
            "WITCHER.Wizard.Step.Finalize.Title"
        ];
        return labels.map((l, i) => ({
            id: i + 1,
            number: i + 1,
            label: l,
            active: this.step === i + 1,
            complete: this.step > i + 1
        }));
    }

    _getTemplateForStep(step) {
        const t = { 
            1: "race", 
            2: "background", 
            3: "profession", 
            4: "stats", 
            5: "skills", 
            6: "gear", 
            7: "finish" 
        };
        return "systems/TheWitcherItaNewSystem/templates/app/wizard/steps/" + t[step] + ".hbs";
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = $(this.element);

        const saveScroll = () => {
            const c = this.element.querySelector(".wizard-content");
            if (c) this._scrollPos = c.scrollTop;
        };

        html.find("[data-action]").not("select, input").on("click", (event) => {
            const action = event.currentTarget.dataset.action;
            if (this.constructor.ACTIONS[action]) {
                saveScroll();
                this.constructor.ACTIONS[action].call(this, event, event.currentTarget);
            }
        });

        html.find("select[data-action], input[data-action]").on("change", (event) => {
            const action = event.currentTarget.dataset.action;
            if (this.constructor.ACTIONS[action]) {
                saveScroll();
                this.constructor.ACTIONS[action].call(this, event, event.currentTarget);
            }
        });

        if (this._scrollPos) {
            const pos = this._scrollPos;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const c = this.element.querySelector(".wizard-content");
                    if (c) c.scrollTop = pos;
                });
            });
        }
    }

    async _nextStep() { if (this.step < this.maxSteps) { this.step++; this.render(true); } }
    async _prevStep() { if (this.step > 1) { this.step--; this.render(true); } }


    async _updateHomeland(event, target) { this.characterData.homeland = target.value; this.render(true); }
    async _updateAge(event, target) { this.characterData.age = parseInt(target.value); this.render(true); }
    async _updateMoney(event, target) { this.characterData.money = parseInt(target.value); this.render(true); }
    async _goToStep(event, target) { this.step = parseInt(target.dataset.step); this.render(true); }
    _switchSkillTab(event, target) { 
        this.activeSkillTab = target.dataset.tab; 
        this.render(true);
    }

    async _selectRace(event, target) {
        const id = target.dataset.raceId;
        const race = this.races.find(r => r.id === id);
        if (race) { this.characterData.race = race; this.render(true); }
    }

    async _selectProfession(event, target) {
        const id = target.dataset.profId;
        const prof = this.professions.find(p => p.id === id);
        if (prof) {
            // Reset old profession skills to 0
            this.characterData.skills = {};
            this.characterData.selectedPickupSkills = [];
            this.characterData.profession = prof;
            if (prof.img) this.characterData.img = prof.img;
            
            // Reinitialize new profession skills logic handled in _getProfessionSkills normally
            // But we must prepopulate characterData.skills keys here:
            const names = (prof.system?.professionSkills || "").split(",").map(s => s.trim()).filter(Boolean);
            names.forEach(name => {
                const s = this.allSkills.find(sk => sk.name.toLowerCase() === name.toLowerCase());
                if (s) this.characterData.skills[s._id] = 1;
            });
            this.render(true);
        }
    }

    async _addPickupSkill(event, target) {
        const skillKey = this.element.querySelector("select[name='new-pickup-skill']")?.value;
        if (skillKey && !this.characterData.selectedPickupSkills.includes(skillKey)) {
            this.characterData.selectedPickupSkills.push(skillKey);
            this.characterData.skills[skillKey] = 0;
            this.render(true);
        }
    }

    _adjustStat(event, target) {
        const stat = target.dataset.stat;
        const delta = parseInt(target.dataset.delta || 0);
        let val = (this.characterData.stats[stat] || 0) + delta;
        if (event.type === "change") val = parseInt(target.value);
        val = Math.max(1, Math.min(10, val));
        const total = Object.values(this.characterData.stats).reduce((a, b) => a + b, 0) - (this.characterData.stats[stat] || 0) + val;
        if (total <= 60) { this.characterData.stats[stat] = val; this.render(true); }
    }

    _adjustSkill(event, target) {
        const skillId = target.dataset.skill;
        const delta = parseInt(target.dataset.delta || 0);
        let val = (this.characterData.skills[skillId] || 0) + delta;
        if (event.type === "change") val = parseInt(target.value);

        const type = target.dataset.type;
        const isProg = type === "profession";

        // Both are capped at 6. Profession starts at 1, Pickup starts at 0.
        const minVal = isProg ? 1 : 0;
        val = Math.max(minVal, Math.min(6, val));

        const oldVal = this.characterData.skills[skillId] || 0;
        this.characterData.skills[skillId] = val;

        const remaining = this._calculateSkillPoints(type);
        if (remaining < 0) {
            this.characterData.skills[skillId] = oldVal;
            ui.notifications.warn("Non hai abbastanza punti per aumentare questa abilità.");
        }

        this.render(true);
    }

    _calculateDerivedStats() {
        const s = this.characterData.stats;
        const res = Math.max(10, Math.floor(((Number(s.body)||0) + (Number(s.will)||0)) / 2) * 5);
        const stun = Math.floor(((Number(s.body)||0) + (Number(s.will)||0)) / 2);
        return { 
            hp: res, 
            sta: res, 
            rec: Math.floor(res / 5), 
            stun: stun,
            run: (Number(s.spd)||0) * 3, 
            leap: Math.floor((Number(s.spd)||0) * 3 / 5), 
            enc: (Number(s.body)||0) * 10 
        };
    }

    async _rollBackground() {
        const t = await this._findTable(["Social Standing"]);
        if (t) { const r = await t.roll(); this.characterData.background.socialStatus = r.results[0].text; }
        this.render(true);
    }

    async _rollLifeEvents() {
        const t = await this._findTable(["Life Events"]);
        if (t) {
            this.characterData.background.events = [];
            for (let i = 0; i < 2; i++) { const r = await t.roll(); this.characterData.background.events.push({ age: 20 + i * 10, text: r.results[0].text }); }
        }
        this.render(true);
    }

    _toggleGear(event, target) {
        const id = target.dataset.itemId;
        const type = target.dataset.itemType;
        const idx = this.characterData.gear.findIndex(g => g.id === id || g._id === id);
        if (idx > -1) { this.characterData.gear.splice(idx, 1); }
        else {
            const src = type === "weapon" ? this.weapons : (type === "armor" ? this.armor : this.gear);
            const item = src.find(i => i.id === id || i._id === id);
            if (item) this.characterData.gear.push(item.toObject ? item.toObject() : item);
        }
        this.render(true);
    }

    async _findTable(hints) {
        for (const h of hints) { const t = game.tables.find(t => t.name.toLowerCase().includes(h.toLowerCase())); if (t) return t; }
        return null;
    }

    _selectAvatar() { 
        new FilePicker({ type: "image", callback: (p) => { this.characterData.img = p; this.render(true); } }).browse(); 
    }

    async _finish() {
        const name = this.element.querySelector("input[name='name']")?.value || "New Hero";
        
        // 1. Prepare base actor data
        const actorData = {
            name,
            type: "character",
            img: this.characterData.img || "icons/svg/mystery-man.svg",
            system: {
                stats: {},
                details: {
                    race: this.characterData.race?.name || "",
                    profession: this.characterData.profession?.name || "",
                    homeland: this.characterData.homeland || "",
                    age: this.characterData.age || 20
                },
                currency: {
                    crowns: Number(this.characterData.money) || 0
                }
            }
        };

        // 2. Map Stats
        for (const [key, value] of Object.entries(this.characterData.stats)) {
            const statDef = CONFIG.WITCHER.statMap[key];
            if (statDef?.origin === "stats") {
                actorData.system.stats[key] = {
                    value: Number(value) || 0,
                    unmodifiedMax: Number(value) || 0,
                    max: Number(value) || 0
                };
            }
        }

        // 3. Create Actor
        console.log("TheWitcherItaNewSystem | Wizard | Creating Actor:", actorData);
        const actor = await Actor.create(actorData);
        
        // 4. Add Embedded Items
        const itemsToCreate = [];

        if (this.characterData.race) {
            const r = foundry.utils.deepClone(this.characterData.race);
            delete r._id; delete r.id; 
            itemsToCreate.push(r);
        }

        if (this.characterData.profession) {
            const p = foundry.utils.deepClone(this.characterData.profession);
            delete p._id; delete p.id; 
            itemsToCreate.push(p);
        }

        if (this.characterData.gear.length > 0) {
            const gearArr = this.characterData.gear.map(g => {
                const item = foundry.utils.deepClone(g);
                delete item._id; delete item.id;
                return item;
            });
            itemsToCreate.push(...gearArr);
        }

        // Collect exact skills from allSkills
        const myProfNames = this._getProfessionSkillNames().map(s => s.toLowerCase());
        for (const [skillId, value] of Object.entries(this.characterData.skills)) {
            if (value > 0) {
                const skillItem = this.allSkills.find(s => s._id === skillId);
                if (skillItem) {
                    const cloned = foundry.utils.deepClone(skillItem);
                    delete cloned._id; delete cloned.id;
                    cloned.system.value = Number(value) || 0;
                    cloned.system.isProfession = myProfNames.includes(cloned.name.toLowerCase());
                    cloned.system.isPickup = !cloned.system.isProfession;
                    cloned.system.isLearned = true;
                    itemsToCreate.push(cloned);
                }
            }
        }

        if (itemsToCreate.length > 0) {
            await actor.createEmbeddedDocuments("Item", itemsToCreate);
        }

        ui.notifications.info(\`\${name} creato con successo!\`);
        this.close();
        if (actor.sheet) actor.sheet.render(true);
    }
}
`;

fs.writeFileSync(filepath, fullCode);
console.log('Done script');
