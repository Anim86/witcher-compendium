const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

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
            gear: [],
            money: 0
        };

        // Cache for compendium data
        this.races = [];
        this.professions = [];
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
        updateHomeland: function(event, target) { this._updateHomeland(event, target); },
        rollBackground: function(event, target) { this._rollBackground(event, target); },
        rollLifeEvents: function(event, target) { this._rollLifeEvents(event, target); },
        toggleGear: function(event, target) { this._toggleGear(event, target); },
        selectAvatar: function(event, target) { this._selectAvatar(event, target); },
        goToStep: function(event, target) { this._goToStep(event, target); },
        finish: function(event, target) { this._finish(event, target); }
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
            // 1. Load Compendiums (Plain Objects)
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
                    if (obj.system?.skills) {
                        for (const key of Object.keys(obj.system.skills)) {
                            const config = CONFIG.WITCHER.skillMap[key];
                            obj.system.skills[key].label = config?.label || key;
                        }
                    }
                    return obj;
                });
            }
            
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

            return {
                step: this.step,
                maxSteps: this.maxSteps,
                steps: this._getStepList(),
                character: this.characterData,
                races: this.races,
                professions: this.professions,
                stats: stats,
                homelands: Object.entries(CONFIG.WITCHER.homelands || {}).map(([v, l]) => ({ value: v, label: l })),
                socialStandings: Object.entries(CONFIG.WITCHER.socialStanding || {}).map(([v, l]) => ({ value: v, label: l })),
                pointsRemaining: statsRemaining,
                derived: this._calculateDerivedStats(),
                professionSkills: this._getProfessionSkills(),
                pickupSkills: this._getPickupSkills(),
                professionPointsRemaining: this._calculateSkillPoints("profession"),
                pickupPointsRemaining: this._calculateSkillPoints("pickup"),
                isFirstStep: this.step === 1,
                isLastStep: this.step === this.maxSteps,
                currentTemplate: this._getTemplateForStep(this.step),
                allGear: {
                    weapons: (this.weapons || []).map(sanitizeItem),
                    armor: (this.armor || []).map(sanitizeItem),
                    equipment: (this.gear || []).map(sanitizeItem)
                },
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
                const config = CONFIG.WITCHER.skillMap[key];
                skills.push({ label: config?.label || key, value });
            }
        }
        return { stats, skills };
    }

    _getProfessionSkills() {
        if (!this.characterData.profession) return [];
        const profSkills = this.characterData.profession.system?.skills || {};
        return Object.entries(profSkills).map(([key, data]) => {
            const config = CONFIG.WITCHER.skillMap[key] || {};
            return { key, label: config.label || key, value: this.characterData.skills[key] || 0, cost: config.cost || 1 };
        });
    }

    _getPickupSkills() {
        const profKeys = this.characterData.profession?.system?.skills ? Object.keys(this.characterData.profession.system.skills) : [];
        return Object.entries(CONFIG.WITCHER.skillMap).filter(([k]) => !profKeys.includes(k)).map(([k, c]) => {
            return { key: k, label: c.label || k, value: this.characterData.skills[k] || 0, cost: c.cost || 1, isProfession: false };
        });
    }

    _calculateSkillPoints(type) {
        if (type === "profession") return 44 - this._getProfessionSkills().reduce((a, b) => a + (b.value * b.cost), 0);
        const available = (Number(this.characterData.stats.int) || 0) + (Number(this.characterData.stats.ref) || 0);
        return available - this._getPickupSkills().reduce((a, b) => a + (b.value * b.cost), 0);
    }

    _getStepList() {
        return [
            { id: 1, label: "WITCHER.Wizard.Step.Race.Title", active: this.step === 1, complete: this.step > 1 },
            { id: 2, label: "WITCHER.Wizard.Step.Background.Title", active: this.step === 2, complete: this.step > 2 },
            { id: 3, label: "WITCHER.Wizard.Step.Profession.Title", active: this.step === 3, complete: this.step > 3 },
            { id: 4, label: "WITCHER.Wizard.Step.Stats.Title", active: this.step === 4, complete: this.step > 4 },
            { id: 5, label: "WITCHER.Wizard.Step.Skills.Title", active: this.step === 5, complete: this.step > 5 },
            { id: 6, label: "WITCHER.Wizard.Step.Gear.Title", active: this.step === 6, complete: this.step > 6 },
            { id: 7, label: "WITCHER.Wizard.Step.Finish.Title", active: this.step === 7, complete: this.step > 7 }
        ];
    }

    _getTemplateForStep(step) {
        const t = { 1:"race", 2:"background", 3:"profession", 4:"stats", 5:"skills", 6:"gear", 7:"finish" };
        return `systems/TheWitcherItaNewSystem/templates/app/wizard/steps/${t[step]}.hbs`;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = $(this.element);
        const saveScroll = () => { this._scrollPos = this.element.querySelector(".witcher-wizard-content")?.scrollTop || 0; };
        html.find("[data-action]").not("select, input").on("click", (event) => {
            const action = event.currentTarget.dataset.action;
            if (this.constructor.ACTIONS[action]) { saveScroll(); this.constructor.ACTIONS[action].call(this, event, event.currentTarget); }
        });
        html.find("select[data-action], input[data-action]").on("change", (event) => {
            const action = event.currentTarget.dataset.action;
            if (this.constructor.ACTIONS[action]) { saveScroll(); this.constructor.ACTIONS[action].call(this, event, event.currentTarget); }
        });
        if (this._scrollPos) { 
            const c = this.element.querySelector(".witcher-wizard-content"); 
            if (c) requestAnimationFrame(() => c.scrollTop = this._scrollPos); 
        }
    }

    async _nextStep() { if (this.step < this.maxSteps) { this.step++; this.render(true); } }
    async _prevStep() { if (this.step > 1) { this.step--; this.render(true); } }
    async _updateHomeland(event, target) { this.characterData.homeland = target.value; this.render(true); }
    async _goToStep(event, target) { this.step = parseInt(target.dataset.step); this.render(true); }

    async _selectRace(event, target) {
        const id = target.dataset.raceId;
        const race = this.races.find(r => r.id === id);
        if (race) { this.characterData.race = race; this.render(true); }
    }

    async _selectProfession(event, target) {
        const id = target.dataset.profId;
        const prof = this.professions.find(p => p.id === id);
        if (prof) {
            this.characterData.profession = prof;
            this.characterData.skills = {};
            if (prof.system?.skills) Object.keys(prof.system.skills).forEach(s => this.characterData.skills[s] = 1);
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
        const skill = target.dataset.skill;
        const delta = parseInt(target.dataset.delta || 0);
        let val = (this.characterData.skills[skill] || 0) + delta;
        if (event.type === "change") val = parseInt(target.value);
        this.characterData.skills[skill] = Math.max(0, Math.min(10, val));
        this.render(true);
    }

    _calculateDerivedStats() {
        const s = this.characterData.stats;
        const res = Math.max(10, Math.floor(((Number(s.body)||0) + (Number(s.will)||0)) / 2) * 5);
        return { hp: res, sta: res, rec: Math.floor(res / 5), run: (Number(s.spd)||0) * 3, leap: Math.floor((Number(s.spd)||0) * 3 / 5), enc: (Number(s.body)||0) * 10 };
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
                skills: {},
                details: {
                    race: this.characterData.race?.name || "",
                    profession: this.characterData.profession?.name || "",
                    homeland: this.characterData.homeland || "",
                    age: this.characterData.age || 20
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

        // 3. Map Skills
        for (const [key, value] of Object.entries(this.characterData.skills)) {
            const skillDef = CONFIG.WITCHER.skillMap[key];
            if (skillDef) {
                const attr = skillDef.attribute.name;
                const skillName = skillDef.name;
                if (!actorData.system.skills[attr]) actorData.system.skills[attr] = {};
                
                actorData.system.skills[attr][skillName] = {
                    value: Number(value) || 0,
                    isProfession: this.characterData.profession?.system?.skills?.[key] !== undefined,
                    isPickup: this.characterData.profession?.system?.skills?.[key] === undefined && value > 0
                };
            }
        }

        // 4. Create Actor
        console.log("TheWitcherItaNewSystem | Wizard | Creating Actor:", actorData);
        const actor = await Actor.create(actorData);
        
        // 5. Add Embedded Items (Race, Profession, Gear)
        const itemsToCreate = [];
        if (this.characterData.race) {
            const r = foundry.utils.deepClone(this.characterData.race);
            delete r._id; delete r.id; itemsToCreate.push(r);
        }
        if (this.characterData.profession) {
            const p = foundry.utils.deepClone(this.characterData.profession);
            delete p._id; delete p.id; itemsToCreate.push(p);
        }
        if (this.characterData.gear.length > 0) {
            itemsToCreate.push(...this.characterData.gear.map(g => {
                const item = foundry.utils.deepClone(g);
                delete item._id; delete item.id;
                return item;
            }));
        }

        if (itemsToCreate.length > 0) {
            await actor.createEmbeddedDocuments("Item", itemsToCreate);
        }

        ui.notifications.info(`${name} creato con successo!`);
        this.close();
        if (actor.sheet) actor.sheet.render(true);
    }
}
