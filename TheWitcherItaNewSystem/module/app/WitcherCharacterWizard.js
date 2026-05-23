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
            originRegion: "",
            homeland: "",
            background: {
                socialStatus: "",
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
            money: 0,
            selectedProfessionGear: []
        };

        // Cache for compendium data
        this.races = [];
        this.professions = [];
        this.allSkills = [];
        this.activeSkillTab = "profession-skills";
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
            height: 650
        }
    };

    
    static PROFESSION_GEAR_MAP = {
        "Armigero": { choose: 5, items: ["Kord", "Lancia", "Ascia da Battaglia", "Coltello da Lancio", "Sacco", "Camaglio", "Brigantina", "Brache Corazzate", "Balestra", "Brocchiero d'Acciaio"] },
        "Artigiano": { choose: 5, items: ["Utensili da armaiolo", "Utensili da mercante", "Spada di Ferro", "Liuto", "Attrezzatura alchemica", "Clessidra", "Scrigno piccolo", "Mazza", "50 corone in componenti", "Lucchetto"] },
        "Bardo": { choose: 5, items: ["Plancia da poker con dadi", "Mazzo di Gwent", "Specchietto", "Liuto", "Superalcolici", "Pugnale", "Profumo/colonia", "Borsello", "Fodero da giarrettiera", "Diario"] },
        "Criminale": { choose: 5, items: ["Dadi truccati", "Lanterna", "Tasca segreta", "Arnesi da scasso", "Fodero da manica", "Stiletto", "Tirapugni", "Coltello da Lancio", "Cloroformio", "Sacco"] },
        "Mago": { choose: 5, items: ["Clessidra", "Kit per il trucco", "Borsello", "Cronista", "Specchietto", "Pugnale", "Bastone", "Fodero da giarrettiera", "Diario", "100 corone in componenti"] },
        "Medico": { choose: 5, items: ["Polvere coagulante", "Fluido sterilizzante", "Erbe anestetiche", "Strumenti chirurgici", "Cronista", "Clessidra", "Candele", "Coperta", "Tenda", "Pugnale"] },
        "Mercante": { choose: 3, items: ["Cronista", "Utensili da mercante", "Tenda", "Diario", "Balestra", "Pugnale", "Carro", "Mulo"] },
        "Prete": { choose: 5, items: ["Simbolo sacro", "Fluido sterilizzante", "Attrezzatura alchemica", "Strumenti chirurgici", "Borsello", "Pugnale", "Bastone", "Polvere coagulante", "Erbe anestetiche", "100 corone in componenti"] },
        "Witcher": { 
            always: ["Medaglione dei witcher", "Spada d'Arme", "Spada d'Argento", "Formula per pozioni", "Formula per unguenti", "Formula per decotto", "Gambesone a Doppia Trama", "Coltello da Lancio"],
            choose: 2, 
            items: ["Attrezzatura alchemica", "Cavallo", "Balestrino"] 
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
        updateOriginRegion: function(event, target) { this._updateOriginRegion(event, target); },
        updateHomeland: function(event, target) { this._updateHomeland(event, target); },
        rollBackground: function(event, target) { this._rollBackground(event, target); },
        rollLifeEvents: function(event, target) { this._rollLifeEvents(event, target); },
        rollFamilyFate: function(event, target) { this._rollFamilyFate(event, target); },
        updateBackground: function(event, target) { this._updateBackground(event, target); },
        toggleGear: function(event, target) { this._toggleGear(event, target); },
        selectAvatar: function(event, target) { this._selectAvatar(event, target); },
        goToStep: function(event, target) { this._goToStep(event, target); },
        addPickupSkill: function(event, target) { this._addPickupSkill(event, target); },
        finish: function(event, target) { this._finish(event, target); },
        switchSkillTab: function(event, target) { this._switchSkillTab(event, target); },
        toggleProfessionGear: function(event, target) { this._toggleProfessionGear(event, target); }
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
            
            
            // 2.1 Profession Gear Logic
            const profName = this.characterData.profession?.name;
            const gearConfig = this.constructor.PROFESSION_GEAR_MAP[profName];
            let professionGearList = [];
            let professionGearRemaining = 0;

            if (gearConfig) {
                const searchPacks = [...(this.weapons || []), ...(this.armor || []), ...(this.gear || [])];
                
                // Helper to find item by names (fuzzy or exact)
                const findItem = (name) => {
                    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return searchPacks.find(i => {
                        const iName = i.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return iName.includes(cleanName) || cleanName.includes(iName);
                    });
                };

                // Fixed items (Witcher only for now)
                const fixedItems = (gearConfig.always || []).map(name => {
                    const item = findItem(name);
                    return item ? sanitizeItem(item) : { name, missing: true };
                });

                // Chooseable items
                const chooseableItems = gearConfig.items.map(name => {
                    const item = findItem(name);
                    const itemDoc = item ? sanitizeItem(item) : { name, missing: true };
                    const id = item?.id || name;
                    return {
                        ...itemDoc,
                        id: id,
                        selected: this.characterData.selectedProfessionGear.includes(id)
                    };
                });

                professionGearList = [...fixedItems, ...chooseableItems];
                const selectedCount = this.characterData.selectedProfessionGear.length;
                professionGearRemaining = Math.max(0, (gearConfig.choose || 0) - selectedCount);
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

            const regionHomelands = {
                north: ["aedirn", "cidaris", "cintra", "kaedwen", "kovir", "lyria", "poviss", "redania", "rivia", "skellige", "temeria", "verden"],
                nilfgaard: ["angren", "ebbing", "etolia", "gemmeria", "gheso", "maecht", "magturga", "mettina", "nazair", "nilfgaard", "vicovaro"],
                elder: ["dolblathanna", "mahakam"]
            };
            
            let filteredHomelands = [];
            if (this.characterData.originRegion) {
                const allowed = regionHomelands[this.characterData.originRegion] || [];
                filteredHomelands = Object.entries(CONFIG.WITCHER.homelands || {})
                    .filter(([v, l]) => allowed.includes(v))
                    .map(([v, l]) => ({ value: v, label: l }));
            }

            return {
                step: this.step,
                maxSteps: this.maxSteps,
                steps: this._getStepList(),
                character: this.characterData,
                races: this.races,
                professions: filteredProfessions,
                stats: stats,
                regions: [
                    { value: "north", label: "Regni Settentrionali" },
                    { value: "nilfgaard", label: "Nilfgaard" },
                    { value: "elder", label: "Terre degli Antichi" }
                ],
                homelands: filteredHomelands,
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
                professionGearList: professionGearList,
                professionGearRemaining: professionGearRemaining,
                professionGearChoose: gearConfig?.choose || 0,
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

        // Professional gear (Fix 6)
        const profGear = [];
        const profName = this.characterData.profession?.name;
        const gearConfig = this.constructor.PROFESSION_GEAR_MAP[profName];
        if (gearConfig) {
            const searchPacks = [...(this.weapons || []), ...(this.armor || []), ...(this.gear || [])];
            const findItem = (nameOrId) => searchPacks.find(i => i.id === nameOrId || i.name === nameOrId);
            
            for (const name of (gearConfig.always || [])) {
                const item = findItem(name);
                if (item) profGear.push({ name: item.name });
            }
            for (const id of this.characterData.selectedProfessionGear) {
                const item = findItem(id);
                if (item) profGear.push({ name: item.name });
            }
        }

        return { stats, skills, professionGear: profGear };
    }

    _getProfessionSkillNames() {
        if (!this.characterData.profession) return [];
        const raw = this.characterData.profession.system?.professionSkills;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string") return raw.split(",").map(s => s.trim()).filter(Boolean);
        return [];
    }

    _getProfessionSkills() {
        const names = this._getProfessionSkillNames();
        const result = [];
        for (const name of names) {
            const skill = this.allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (skill) {
                const cost = this._getSkillCost(skill);
                result.push({
                    key: skill._id,
                    name: skill.name,
                    value: this.characterData.skills[skill._id] || 1, // Start at 1
                    cost: cost,
                    isDifficult: cost === 2
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
            const cost = this._getSkillCost(skill);
            return {
                key: skill._id,
                name: skill.name,
                value: this.characterData.skills[skill._id] || 0,
                cost: cost,
                isDifficult: cost === 2
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
                cost: this._getSkillCost(s)
            };
        });
    }

    _calculateSkillPoints(type) {
        if (type === "profession") {
            const spent = this._getProfessionSkills().reduce((acc, s) => {
                // The first 8 levels of the native language are free
                let val = s.value;
                if (this._isNativeLanguage(s.name)) {
                    val = Math.max(0, s.value - 8);
                }
                return acc + (val * s.cost);
            }, 0);
            return 44 - spent;
        } else {
            const available = (Number(this.characterData.stats.int) || 0) + (Number(this.characterData.stats.ref) || 0);
            const spent = this._getPickupSkills().reduce((acc, s) => {
                let val = s.value;
                if (this._isNativeLanguage(s.name)) {
                    val = Math.max(0, s.value - 8);
                }
                return acc + (val * s.cost);
            }, 0);
            return available - spent;
        }
    }

    /**
     * Checks if a skill name matches the current native language.
     * @param {string} skillName - Name of the skill to check.
     * @returns {boolean}
     * @private
     */
    _isNativeLanguage(skillName) {
        const raceName = this.characterData.race?.name;
        const homeland = this.characterData.homeland?.toLowerCase();
        
        let langKey = "commonspeech";
        if (raceName === "Elfi") langKey = "eldersp";
        else if (raceName === "Nani" || raceName === "Gnomo") langKey = "dwarven";
        else if (raceName === "Umani") {
            const elderHomelands = ["nilfgaard", "vicovaro", "etolia", "gemmeria", "ebbing", "maecht", "mettina", "nazair", "gheso", "magturga", "skellige"];
            if (elderHomelands.includes(homeland)) langKey = "eldersp";
        }
        
        const label = game.i18n.localize(CONFIG.WITCHER.skillMap[langKey].label);
        return skillName.toLowerCase() === label.toLowerCase();
    }

    /**
     * Determines the cost of a skill from the global configuration.
     * @param {Object} skillItem - The skill item document or object.
     * @returns {number} - 1 for simple, 2 for difficult.
     * @private
     */
    _getSkillCost(skillItem) {
        const entry = Object.values(CONFIG.WITCHER.skillMap).find(e => {
            // Match by technical name if it exists, otherwise by localized label
            if (e.name && e.name.toLowerCase() === skillItem.name.toLowerCase()) return true;
            return game.i18n.localize(e.label).toLowerCase() === skillItem.name.toLowerCase();
        });
        return entry?.cost || 1;
    }

    /**
     * Automatically updates the native language skill to +8 based on race and homeland.
     * @private
     */
    _updateNativeLanguage() {
        const raceName = this.characterData.race?.name;
        const homeland = this.characterData.homeland?.toLowerCase();
        
        let langKey = "commonspeech";
        if (raceName === "Elfi") langKey = "eldersp";
        else if (raceName === "Nani" || raceName === "Gnomo") langKey = "dwarven";
        else if (raceName === "Umani") {
            const elderHomelands = ["nilfgaard", "vicovaro", "etolia", "gemmeria", "ebbing", "maecht", "mettina", "nazair", "gheso", "magturga", "skellige"];
            if (elderHomelands.includes(homeland)) langKey = "eldersp";
        }
        
        // Find the skill in allSkills
        const langSkill = this.allSkills.find(s => {
            const label = game.i18n.localize(CONFIG.WITCHER.skillMap[langKey].label);
            return s.name.toLowerCase() === label.toLowerCase();
        });
        
        if (langSkill) {
            // Clear existing level 8 from any language skill to avoid duplicates
            const langKeys = ["commonspeech", "eldersp", "dwarven"];
            const langLabels = langKeys.map(k => game.i18n.localize(CONFIG.WITCHER.skillMap[k].label).toLowerCase());
            
            for (const skillId in this.characterData.skills) {
                const s = this.allSkills.find(sk => sk._id === skillId);
                if (s && langLabels.includes(s.name.toLowerCase()) && this.characterData.skills[skillId] === 8) {
                    this.characterData.skills[skillId] = 0;
                }
            }
            
            // Set the new native language to 8
            this.characterData.skills[langSkill._id] = 8;
        }
    }

    _getStepList() {
        const steps = [
            { label: "WITCHER.Wizard.Step.Race.Title", icon: "fa-solid fa-person-rays" },
            { label: "WITCHER.Wizard.Step.Background.Title", icon: "fa-solid fa-scroll" },
            { label: "WITCHER.Wizard.Step.Profession.Title", icon: "fa-solid fa-sword" },
            { label: "WITCHER.Wizard.Step.Stats.Title", icon: "fa-solid fa-chart-simple" },
            { label: "WITCHER.Wizard.Step.Skills.Title", icon: "fa-solid fa-book-open-reader" },
            { label: "WITCHER.Wizard.Step.Gear.Title", icon: "fa-solid fa-bag-shopping" },
            { label: "WITCHER.Wizard.Step.Finalize.Title", icon: "fa-solid fa-check-double" }
        ];
        return steps.map((s, i) => ({
            id: i + 1,
            number: i + 1,
            label: s.label,
            icon: s.icon,
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


    async _updateOriginRegion(event, target) {
        this.characterData.originRegion = target.value;
        this.characterData.homeland = "";
        this.characterData.background.socialStatus = "";
        this.characterData.background.familyFate = "";
        this.characterData.background.events = [];
        this.render(true);
    }

    async _updateHomeland(event, target) { 
        this.characterData.homeland = target.value; 
        this._updateNativeLanguage();
        this.render(true); 
    }
    async _updateAge(event, target) { this.characterData.age = parseInt(target.value); this.render(true); }
    async _updateMoney(event, target) { this.characterData.money = parseInt(target.value); this.render(true); }
    async _goToStep(event, target) { this.step = parseInt(target.dataset.step); this.render(true); }
    
    _toggleProfessionGear(event, target) {
        const id = target.dataset.itemId;
        const profName = this.characterData.profession?.name;
        const gearConfig = this.constructor.PROFESSION_GEAR_MAP[profName];
        if (!gearConfig) return;

        const idx = this.characterData.selectedProfessionGear.indexOf(id);
        if (idx > -1) {
            this.characterData.selectedProfessionGear.splice(idx, 1);
        } else {
            if (this.characterData.selectedProfessionGear.length < (gearConfig.choose || 0)) {
                this.characterData.selectedProfessionGear.push(id);
            } else {
                ui.notifications.warn(`Puoi scegliere solo ${gearConfig.choose} oggetti per la tua dotazione.`);
            }
        }
        this.render(true);
    }

    _switchSkillTab(event, target) { 
        this.activeSkillTab = target.dataset.tab; 
        this.render(true);
    }

    async _selectRace(event, target) {
        const id = target.dataset.raceId;
        const race = this.races.find(r => r.id === id);
        if (race) { 
            this.characterData.race = race; 
            this._updateNativeLanguage();
            this.render(true); 
        }
    }

    async _selectProfession(event, target) {
        const id = target.dataset.profId;
        const prof = this.professions.find(p => p.id === id);
        if (prof) {
            // Reset old profession skills to 0
            this.characterData.skills = {};
            this.characterData.selectedProfessionGear = [];
            
            // Reset old profession gear
            this.characterData.selectedProfessionGear = [];
            
            // Pre-select first 5 (or choose amount) for non-Witcher
            const gearConfig = this.constructor.PROFESSION_GEAR_MAP[prof.name];
            if (gearConfig && prof.name !== "Witcher") {
                const searchPacks = [...(this.weapons || []), ...(this.armor || []), ...(this.gear || [])];
                const findItem = (name) => {
                    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const item = searchPacks.find(i => i.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanName));
                    return item;
                };
                
                for (let i = 0; i < Math.min(gearConfig.choose || 0, gearConfig.items.length); i++) {
                    const item = findItem(gearConfig.items[i]);
                    if (item) this.characterData.selectedProfessionGear.push(item.id);
                    else this.characterData.selectedProfessionGear.push(gearConfig.items[i]);
                }
            }

            this.characterData.profession = prof;
            if (prof.img) this.characterData.img = prof.img;
            
            // Reinitialize new profession skills logic handled in _getProfessionSkills normally
            // But we must prepopulate characterData.skills keys here:
            const names = typeof prof.system?.professionSkills === "string"
                ? prof.system.professionSkills.split(",").map(s => s.trim()).filter(Boolean)
                : [];
            names.forEach(name => {
                const s = this.allSkills.find(sk => sk.name.toLowerCase() === name.toLowerCase());
                if (s) {
                    // Only set to 1 if it's not already set (e.g. by native language at 8)
                    if (this.characterData.skills[s._id] === undefined || this.characterData.skills[s._id] === 0) {
                        this.characterData.skills[s._id] = 1;
                    }
                }
            });

            this._updateNativeLanguage();
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

    _getOriginCategory() {
        const raceName = (this.characterData.race?.name || "").toLowerCase();
        const homeland = (this.characterData.homeland || "").toLowerCase();
        
        // Elder Lands (Terre Antiche): non-human races or specific homelands
        const elderRaces = ["elfi", "nani", "gnomo", "elfo", "nano", "gnomi"];
        const elderHomelands = ["skellige", "dolblathanna", "mahakam"];
        
        if (elderRaces.includes(raceName) || elderHomelands.includes(homeland)) {
            return "Terre Antiche";
        }
        
        // Nilfgaardian: Nilfgaardian homelands
        const nilfgaardianHomelands = ["nilfgaard", "vicovaro", "etolia", "gemmeria", "ebbing", "maecht", "mettina", "nazair", "gheso", "magturga"];
        if (nilfgaardianHomelands.includes(homeland)) {
            return "Nilfgaardiana";
        }
        
        // Default: Northern Kingdoms (Settentrionale)
        return "Settentrionale";
    }

    async _rollBackground() {
        const origin = this._getOriginCategory();
        let tableName = "";
        let hints = [];
        if (origin === "Terre Antiche") {
            tableName = "Situazione Familiare (Terre Antiche)";
            hints = ["Situazione Familiare (Terre Antiche)", "Situazione Familiare - Terre Antiche", "Terre Antiche"];
        } else if (origin === "Nilfgaardiana") {
            tableName = "Situazione Familiare (Nilfgaardiana)";
            hints = ["Situazione Familiare (Nilfgaardiana)", "Situazione Familiare - Nilfgaardiana", "Nilfgaardiana"];
        } else {
            tableName = "Situazione Familiare (Settentrionale)";
            hints = ["Situazione Familiare (Settentrionale)", "Situazione Familiare - Settentrionale", "Settentrionale"];
        }
        
        // Fallbacks
        hints.push("Situazione Familiare", "Social Standing", "Posizione Sociale", "Rango Sociale");

        const t = await this._findTable(hints);
        if (t) {
            const r = await t.roll();
            const text = r.results[0]?.text ?? r.results[0]?.getChatText?.() ?? "";
            this.characterData.background.socialStatus = text;
            ui.notifications.info(`Situazione Familiare: ${text}`);
        } else {
            ui.notifications.warn(`Tabella '${tableName}' non trovata nel mondo o nei compendi.`);
        }
        this.render(true);
    }

    async _rollFamilyFate() {
        const t = await this._findTable(["Destino della Famiglia", "Destino Familiare", "Family Fate", "Family Background"]);
        if (t) {
            const r = await t.roll();
            const text = r.results[0]?.text ?? r.results[0]?.getChatText?.() ?? "";
            this.characterData.background.familyFate = text;
            ui.notifications.info(`Destino Familiare: ${text}`);
        } else {
            ui.notifications.warn("Tabella 'Destino Familiare' non trovata nel mondo o nei compendi.");
        }
        this.render(true);
    }

    async _rollLifeEvents() {
        const t = await this._findTable(["Eventi della Vita", "Life Events", "Evento di Vita"]);
        if (t) {
            const existing = this.characterData.background.events;
            const lastAge = existing.length > 0 ? existing[existing.length - 1].age : (this.characterData.age || 20);
            const nextAge = lastAge + 10;
            const r = await t.roll();
            const text = r.results[0]?.text ?? r.results[0]?.getChatText?.() ?? "";
            existing.push({ age: nextAge, text });
        } else {
            ui.notifications.warn("Tabella 'Eventi della Vita' non trovata nel mondo o nei compendi.");
        }
        this.render(true);
    }

    _updateBackground(event, target) {
        const name = target.name || target.dataset.name;
        const value = target.value;
        if (name === "background.socialStatus") {
            this.characterData.background.socialStatus = value;
        } else if (name === "background.familyFate") {
            this.characterData.background.familyFate = value;
        }
        // No re-render on manual typing to avoid losing focus
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
        // 1. Search world tables first (fastest)
        for (const h of hints) {
            const t = game.tables.find(t => t.name.toLowerCase().includes(h.toLowerCase()));
            if (t) return t;
        }
        // 2. Search registered compendium packs of type RollTable
        const rollTablePacks = game.packs.filter(p => p.metadata.type === "RollTable");
        for (const pack of rollTablePacks) {
            // Use the pack index to avoid loading all documents
            const index = pack.index.size > 0 ? pack.index : await pack.getIndex();
            for (const h of hints) {
                const entry = index.find(e => e.name.toLowerCase().includes(h.toLowerCase()));
                if (entry) {
                    const doc = await pack.getDocument(entry._id);
                    if (doc) return doc;
                }
            }
        }
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
                    crown: Number(this.characterData.money) || 0
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

        // 5. Add selected profession gear (Fix 8: decoupled)
        const profName = this.characterData.profession?.name;
        const gearConfig = this.constructor.PROFESSION_GEAR_MAP[profName];
        if (gearConfig) {
            const searchPacks = [...(this.weapons || []), ...(this.armor || []), ...(this.gear || [])];
            const findItem = (nameOrId) => {
                return searchPacks.find(i => i.id === nameOrId || i.name === nameOrId);
            };

            // Fixed items
            for (const name of (gearConfig.always || [])) {
                const item = findItem(name);
                if (item) {
                    const cloned = foundry.utils.deepClone(item.toObject ? item.toObject() : item);
                    delete cloned._id; delete cloned.id;
                    itemsToCreate.push(cloned);
                }
            }

            // Selected items
            for (const id of this.characterData.selectedProfessionGear) {
                const item = findItem(id);
                if (item) {
                    const cloned = foundry.utils.deepClone(item.toObject ? item.toObject() : item);
                    delete cloned._id; delete cloned.id;
                    itemsToCreate.push(cloned);
                }
            }
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

        ui.notifications.info(`${name} creato con successo!`);
        this.close();
        if (actor.sheet) actor.sheet.render(true);
    }
}
