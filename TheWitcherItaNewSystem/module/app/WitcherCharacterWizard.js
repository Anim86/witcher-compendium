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
            name: this._getRandomFantasyName("umano"),
            gender: "",
            race: null,
            originRegion: "",
            homeland: "",
            background: {
                socialStatus: "",
                familyState: "",
                familyFate: "",
                parentsState: "",
                parentsFate: "",
                events: []
            },
            profession: null,
            stats: {
                int: 3, ref: 3, dex: 3, body: 3, spd: 3, emp: 3, cra: 3, will: 3, luck: 3
            },
            skills: {},
            selectedPickupSkills: [], // We'll populate this dynamically
            selectedCombatSkills: [],
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
        rollStats: function(event, target) { this._rollStats(event, target); },
        adjustSkill: function(event, target) { this._adjustSkill(event, target); },
        updateAge: function(event, target) { this._updateAge(event, target); },
        updateName: function(event, target) { this._updateName(event, target); },
        updateGender: function(event, target) { this._updateGender(event, target); },
        rollAge: function(event, target) { this._rollAge(event, target); },
        rollName: function(event, target) { this._rollName(event, target); },
        updateMoney: function(event, target) { this._updateMoney(event, target); },
        updateOriginRegion: function(event, target) { this._updateOriginRegion(event, target); },
        updateHomeland: function(event, target) { this._updateHomeland(event, target); },
        rollBackground: function(event, target) { this._rollBackground(event, target); },
        rollLifeEvents: function(event, target) { this._rollLifeEvents(event, target); },
        rollFamilyFate: function(event, target) { this._rollFamilyFate(event, target); },
        rollParentsFate: function(event, target) { this._rollParentsFate(event, target); },
        updateBackground: function(event, target) { this._updateBackground(event, target); },
        toggleGear: function(event, target) { this._toggleGear(event, target); },
        selectAvatar: function(event, target) { this._selectAvatar(event, target); },
        openListModal: function(event, target) { this._openListModal(event, target); },
        goToStep: function(event, target) { this._goToStep(event, target); },
        addPickupSkill: function(event, target) { this._addPickupSkill(event, target); },
        addCombatSkill: function(event, target) { this._addCombatSkill(event, target); },
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
            const statsRemainingPct = Math.max(0, Math.min(100, (statsRemaining / 33) * 100));

            const stats = {};
            for (const [key, statDef] of Object.entries(CONFIG.WITCHER.statMap)) {
                if (statDef.origin === "stats" && key !== "toxicity") {
                    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
                    stats[key] = {
                        label: `WITCHER.St${capKey}`,
                        labelShort: statDef.labelShort,
                        value: this.characterData.stats[key] || 0
                    };
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

            // Cache regional lists when region changes
            const currentOrigin = this._getOriginCategory();
            const hasRegion = !!this.characterData.originRegion;
            if (this._cachedOrigin !== currentOrigin || this._cachedHasRegion !== hasRegion || !this.socialStatusOptions) {
                this._cachedOrigin = currentOrigin;
                this._cachedHasRegion = hasRegion;
                this.socialStatusOptions = [];
                this.familyFateOptions = [];
                this.parentsFateOptions = [];

                if (hasRegion) {
                    // Load Situazione Familiare options
                    let socialHints = [];
                    if (currentOrigin === "Terre Antiche") {
                        socialHints = ["Situazione Familiare (Terre Antiche)", "Situazione Familiare - Terre Antiche", "Terre Antiche"];
                    } else if (currentOrigin === "Nilfgaardiana") {
                        socialHints = ["Situazione Familiare (Nilfgaardiana)", "Situazione Familiare - Nilfgaardiana", "Nilfgaardiana"];
                    } else {
                        socialHints = ["Situazione Familiare (Settentrionale)", "Situazione Familiare - Settentrionale", "Settentrionale"];
                    }
                    socialHints.push("Situazione Familiare", "Social Standing", "Posizione Sociale", "Rango Sociale");

                    const socialTable = await this._findTable(socialHints);
                    if (socialTable) {
                        this.socialStatusOptions = socialTable.results
                            .map(r => r.name || r.description || r._source?.text || r._source?.description || "")
                            .filter(Boolean);
                    }

                    // Load Destino della Famiglia options
                    let fateHints = [];
                    if (currentOrigin === "Terre Antiche") {
                        fateHints = ["Sorte della Famiglia (Terre Antiche)", "Sorte della Famiglia - Terre Antiche", "Destino della Famiglia (Terre Antiche)", "Destino della Famiglia - Terre Antiche", "Terre Antiche"];
                    } else if (currentOrigin === "Nilfgaardiana") {
                        fateHints = ["Sorte della Famiglia (Nilfgaardiana)", "Sorte della Famiglia - Nilfgaardiana", "Destino della Famiglia (Nilfgaardiana)", "Destino della Famiglia - Nilfgaardiana", "Nilfgaardiana"];
                    } else {
                        fateHints = ["Sorte della Famiglia (Settentrionale)", "Sorte della Famiglia - Settentrionale", "Destino della Famiglia (Settentrionale)", "Destino della Famiglia - Settentrionale", "Settentrionale"];
                    }
                    fateHints.push("Sorte della Famiglia", "Sorte Familiare", "Destino della Famiglia", "Destino Familiare", "Family Fate", "Family Background");

                    const fateTable = await this._findTable(fateHints);
                    if (fateTable) {
                        this.familyFateOptions = fateTable.results
                            .map(r => r.name || r.description || r._source?.text || r._source?.description || "")
                            .filter(Boolean);
                    }

                    // Load Sorte dei Genitori options
                    let parentsFateHints = [];
                    if (currentOrigin === "Terre Antiche") {
                        parentsFateHints = ["Sorte dei Genitori (Terre Antiche)", "Sorte dei Genitori - Terre Antiche", "Terre Antiche"];
                    } else if (currentOrigin === "Nilfgaardiana") {
                        parentsFateHints = ["Sorte dei Genitori (Nilfgaardiana)", "Sorte dei Genitori - Nilfgaardiana", "Nilfgaardiana"];
                    } else {
                        parentsFateHints = ["Sorte dei Genitori (Settentrionale)", "Sorte dei Genitori - Settentrionale", "Settentrionale"];
                    }
                    parentsFateHints.push("Sorte dei Genitori", "Sorte Genitori", "Parents Fate", "Parents Background");

                    const parentsFateTable = await this._findTable(parentsFateHints);
                    if (parentsFateTable) {
                        this.parentsFateOptions = parentsFateTable.results
                            .map(r => r.name || r.description || r._source?.text || r._source?.description || "")
                            .filter(Boolean);
                    }
                }
            }

            const ageLimits = this._getAgeLimits();
            if (!this.characterData.age) {
                this.characterData.age = Math.floor(Math.random() * (ageLimits.max - ageLimits.min + 1)) + ageLimits.min;
            } else {
                if (this.characterData.age < ageLimits.min) this.characterData.age = ageLimits.min;
                if (this.characterData.age > ageLimits.max) this.characterData.age = ageLimits.max;
            }

            // Combat skills logic for Armigero
            let availableCombatSkills = [];
            let combatSkillsRemaining = 0;
            const isArmigero = this.characterData.profession?.name?.toLowerCase() === "armigero";
            if (isArmigero) {
                const maxCombatSkills = 5;
                const selectedCount = this.characterData.selectedCombatSkills.length;
                combatSkillsRemaining = Math.max(0, maxCombatSkills - selectedCount);

                if (combatSkillsRemaining > 0) {
                    availableCombatSkills = this.allSkills.filter(s => 
                        s.system?.isCombatSkill && 
                        !this.characterData.selectedCombatSkills.includes(s._id) &&
                        !this._getProfessionSkillNames().includes(s.name)
                    ).map(s => {
                        const info = this._getSkillInfo(s);
                        return {
                            key: s._id,
                            name: s.name,
                            cost: this._getSkillCost(s),
                            attributeLabel: info.attributeLabel
                        };
                    });
                }
            }

            return {
                ageLimits: ageLimits,
                socialStatusOptions: this.socialStatusOptions || [],
                familyFateOptions: this.familyFateOptions || [],
                parentsFateOptions: this.parentsFateOptions || [],
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
                pointsRemainingPct: statsRemainingPct,
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
                availableCombatSkills: availableCombatSkills,
                combatSkillsRemaining: combatSkillsRemaining,
                isArmigero: isArmigero,
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
        let names = [];
        if (raw instanceof Set) names = Array.from(raw);
        else if (Array.isArray(raw)) names = raw;
        else if (typeof raw === "string") names = raw.split(",").map(s => s.trim()).filter(Boolean);
        else if (raw && typeof raw === "object" && typeof raw.forEach === "function") {
            const arr = [];
            raw.forEach(x => arr.push(x));
            names = arr;
        }

        if (this.characterData.selectedCombatSkills && this.characterData.selectedCombatSkills.length > 0) {
            for (const id of this.characterData.selectedCombatSkills) {
                const s = this.allSkills.find(sk => sk._id === id);
                if (s) names.push(s.name);
            }
        }

        return names;
    }

    _findSkillByKeyOrName(keyOrName) {
        if (!keyOrName) return null;
        const lowerKeyOrName = keyOrName.toLowerCase();

        // 1. Try to find entry in CONFIG.WITCHER.skillMap by key or by entry.name
        let entry = CONFIG.WITCHER.skillMap[keyOrName];
        if (!entry) {
            entry = Object.values(CONFIG.WITCHER.skillMap).find(e => {
                if (e.name && e.name.toLowerCase() === lowerKeyOrName) return true;
                return game.i18n.localize(e.label).toLowerCase() === lowerKeyOrName;
            });
        }

        // Get the localized label and the technical name
        const localizedLabel = entry ? game.i18n.localize(entry.label).toLowerCase() : lowerKeyOrName;
        const technicalName = entry?.name ? entry.name.toLowerCase() : lowerKeyOrName;

        // 2. Search in allSkills matching localized label, technical name, or keyOrName
        return this.allSkills.find(s => {
            const sName = s.name.toLowerCase();
            return sName === localizedLabel || sName === technicalName || sName === lowerKeyOrName;
        });
    }

    _getSkillInfo(skill) {
        const entry = Object.values(CONFIG.WITCHER.skillMap).find(e => {
            if (e.name && e.name.toLowerCase() === skill.name.toLowerCase()) return true;
            return game.i18n.localize(e.label).toLowerCase() === skill.name.toLowerCase();
        });
        
        let attributeLabel = "";
        if (entry?.attribute) {
            attributeLabel = game.i18n.localize(entry.attribute.labelShort);
        }
        
        return {
            attributeLabel: attributeLabel,
            isNativeLanguage: this._isNativeLanguage(skill.name)
        };
    }

    _getProfessionSkills() {
        const names = this._getProfessionSkillNames();
        const result = [];
        
        // Add defining skill (Abilità Esclusiva/Definente)
        const defSkill = this.characterData.profession?.system?.definingSkill;
        if (defSkill && defSkill.skillName) {
            let statLabel = defSkill.stat;
            if (CONFIG.WITCHER && CONFIG.WITCHER.statMap && CONFIG.WITCHER.statMap[defSkill.stat]) {
                statLabel = game.i18n.localize(CONFIG.WITCHER.statMap[defSkill.stat].labelShort || defSkill.stat);
            }
            
            result.push({
                key: "definingSkill",
                name: defSkill.skillName,
                value: this.characterData.skills["definingSkill"] || 1,
                cost: 1,
                isDifficult: false,
                isNativeLanguage: false,
                attributeLabel: statLabel,
                description: defSkill.definition || "",
                isDefining: true
            });
            if (this.characterData.skills["definingSkill"] === undefined) {
                this.characterData.skills["definingSkill"] = 1;
            }
        }

        console.log("TheWitcherItaNewSystem | _getProfessionSkills | Names to find:", names);
        console.log("TheWitcherItaNewSystem | _getProfessionSkills | Total skills in allSkills:", this.allSkills.length);
        for (const name of names) {
            const skill = this._findSkillByKeyOrName(name);
            if (skill) {
                const cost = this._getSkillCost(skill);
                const info = this._getSkillInfo(skill);
                result.push({
                    key: skill._id,
                    name: skill.name,
                    value: this.characterData.skills[skill._id] || 1, // Start at 1
                    cost: cost,
                    isDifficult: cost === 2,
                    isNativeLanguage: info.isNativeLanguage,
                    attributeLabel: info.attributeLabel,
                    description: skill.system?.description || ""
                });
                
                // Initialize default value if missing
                if (this.characterData.skills[skill._id] === undefined) {
                    this.characterData.skills[skill._id] = 1;
                }
            } else {
                console.warn(`TheWitcherItaNewSystem | _getProfessionSkills | Skill not found in allSkills: "${name}"`);
            }
        }
        console.log("TheWitcherItaNewSystem | _getProfessionSkills | Found starting skills count:", result.length);
        return result;
    }

    _getPickupSkills() {
        return this.characterData.selectedPickupSkills.map(id => {
            const skill = this.allSkills.find(s => s._id === id);
            if (!skill) return null;
            const cost = this._getSkillCost(skill);
            const info = this._getSkillInfo(skill);
            return {
                key: skill._id,
                name: skill.name,
                value: this.characterData.skills[skill._id] || 0,
                cost: cost,
                isDifficult: cost === 2,
                isNativeLanguage: info.isNativeLanguage,
                attributeLabel: info.attributeLabel
            };
        }).filter(s => s !== null);
    }

    _getAvailablePickupSkills() {
        const profNames = this._getProfessionSkillNames();
        const resolvedProfSkillIds = profNames.map(name => {
            const s = this._findSkillByKeyOrName(name);
            return s?._id;
        }).filter(Boolean);

        return this.allSkills.filter(s => {
            const isProf = resolvedProfSkillIds.includes(s._id);
            const isSelected = this.characterData.selectedPickupSkills.includes(s._id);
            return !isProf && !isSelected;
        }).map(s => {
            const info = this._getSkillInfo(s);
            return {
                key: s._id,
                name: s.name,
                cost: this._getSkillCost(s),
                attributeLabel: info.attributeLabel
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
    async _updateAge(event, target) {
        const limits = this._getAgeLimits();
        let val = parseInt(target.value) || limits.min;
        if (val < limits.min) val = limits.min;
        if (val > limits.max) val = limits.max;
        this.characterData.age = val;
        this.render(true);
    }

    async _updateName(event, target) {
        this.characterData.name = target.value;
        this.render(true);
    }

    async _updateGender(event, target) {
        this.characterData.gender = target.value;
        this.render(true);
    }

    _getAgeLimits() {
        const raceName = (this.characterData.race?.name || "").toLowerCase();
        
        if (raceName.includes("elfo") || raceName.includes("elfi") || raceName.includes("elf")) {
            return { min: 20, max: 600 };
        } else if (raceName.includes("gnomo") || raceName.includes("gnomi") || raceName.includes("gnome")) {
            return { min: 20, max: 500 };
        } else if (raceName.includes("bobolak")) {
            return { min: 20, max: 300 };
        } else if (raceName.includes("umano") || raceName.includes("umani") || raceName.includes("human")) {
            return { min: 16, max: 90 };
        } else if (raceName.includes("vran")) {
            return { min: 20, max: 400 };
        } else if (raceName.includes("nano") || raceName.includes("nani") || raceName.includes("dwarf")) {
            return { min: 20, max: 500 };
        } else if (raceName.includes("witcher")) {
            return { min: 50, max: 260 };
        }
        
        return { min: 16, max: 500 };
    }

    async _rollAge() {
        const limits = this._getAgeLimits();
        const rolledAge = Math.floor(Math.random() * (limits.max - limits.min + 1)) + limits.min;
        this.characterData.age = rolledAge;
        this.render(true);
    }

    _getRandomFantasyName(raceName = "") {
        const lowerRace = raceName.toLowerCase();

        const humanFirst = ["Geralt", "Julian", "Caleb", "Olgierd", "Sigismund", "Radovid", "Foltest", "Emhyr", "Leo", "Vilgefortz", "Cahir", "Valdo", "Yennefer", "Triss", "Keira", "Philippa", "Shani", "Calanthe", "Meve", "Anna", "Syanna", "Renfri", "Milva", "Lytta", "Fringilla", "Sabrina", "Vesemir", "Lambert", "Eskel", "Coën", "Cedric", "Dolan", "Letho", "Serrit", "Auckes"];
        const humanLast = ["di Rivia", "di Maribor", "di Vengerberg", "di Ellander", "di Cintra", "di Oxenfurt", "di Vizima", "di Novigrad", "di Tretogor", "di Lan Exeter", "di Beauclair", "di Gors Velen", "di Aldersberg", "di Guleta", "di Ban Ard", "di Aretuza"];

        const elfFirst = ["Yaevinn", "Iorveth", "Toruviel", "Francesca", "Filavandrel", "Crevan", "Ida", "Eredin", "Auberon", "Avallac'h", "Aelirenn", "Lara", "Shiadhal", "Galarr", "Ciaran", "Aegar", "Riordain", "Gwynbleidd", "Isengrim", "Chireadan", "Eithné", "Morenn", "Mousesack", "Faoiltiarna"];
        const elfLast = ["aep Dahy", "findabair", "en Craite", "aep Cellach", "aep Muirloe", "aep Gwydion", "aep Llwyd", "aep Gwyn", "aep Rhiannon"];

        const dwarfFirst = ["Yarpen", "Zoltan", "Barclay", "Dennis", "Sheldon", "Figgis", "Munro", "Brouver", "Eudora", "Golan", "Vimme", "Barnaby", "Beck", "Rudolf", "Gaspard", "Paulie", "Reginald"];
        const dwarfLast = ["Chivay", "Zigrin", "Els", "Cranmer", "Cleaver", "Vivaldi", "Hoog", "Dahlberg", "Giancardi", "Figgis", "Borok", "Groz", "Kov"];

        const gnomeFirst = ["Percival", "Schuttenbach", "Barnaby", "Beckenbauer", "Golyat", "Reginald", "Bremervoord", "Aaron", "Gedymin", "Kalkstein", "Pinety"];
        const vranFirst = ["Karrg", "Varkk", "Sssral", "Zzash", "Grek", "Grzz", "Vrrx", "Krrs", "Hsssk", "Tzass"];

        let firstList = humanFirst;
        let lastList = humanLast;

        if (lowerRace.includes("elfo") || lowerRace.includes("elfi") || lowerRace.includes("elf")) {
            firstList = elfFirst;
            lastList = elfLast;
        } else if (lowerRace.includes("nano") || lowerRace.includes("nani") || lowerRace.includes("dwarf")) {
            firstList = dwarfFirst;
            lastList = dwarfLast;
        } else if (lowerRace.includes("gnomo") || lowerRace.includes("gnomi") || lowerRace.includes("gnome")) {
            firstList = gnomeFirst;
            lastList = [];
        } else if (lowerRace.includes("vran") || lowerRace.includes("bobolak")) {
            firstList = vranFirst;
            lastList = [];
        } else if (lowerRace.includes("witcher")) {
            firstList = ["Geralt", "Vesemir", "Lambert", "Eskel", "Coën", "Brehen", "Gaetan", "Kiyan", "Erland", "Ivar", "Treyse", "Warin", "Keldar", "Barmin", "Reinald"];
            lastList = ["della Scuola del Lupo", "della Scuola del Gatto", "della Scuola della Vipera", "della Scuola del Grifone", "della Scuola dell'Orso", "della Scuola della Manticora"];
        }

        const first = firstList[Math.floor(Math.random() * firstList.length)];
        const last = lastList.length > 0 ? " " + lastList[Math.floor(Math.random() * lastList.length)] : "";
        return `${first}${last}`;
    }

    async _rollName() {
        const raceName = this.characterData.race?.name || "umano";
        const rolledName = this._getRandomFantasyName(raceName);
        this.characterData.name = rolledName;
        this.render(true);
    }

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
            const limits = this._getAgeLimits();
            this.characterData.age = Math.floor(Math.random() * (limits.max - limits.min + 1)) + limits.min;
            this.characterData.name = this._getRandomFantasyName(race.name);
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
            
            const names = this._getProfessionSkillNames();
            names.forEach(name => {
                const s = this._findSkillByKeyOrName(name);
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

    async _addCombatSkill(event, target) {
        const skillKey = this.element.querySelector("select[name='new-combat-skill']")?.value;
        if (skillKey && !this.characterData.selectedCombatSkills.includes(skillKey)) {
            this.characterData.selectedCombatSkills.push(skillKey);
            this.characterData.skills[skillKey] = 1;
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

    _rollStats(event, target) {
        const statsKeys = ["int", "ref", "dex", "body", "spd", "emp", "cra", "will", "luck"];
        let total = Object.values(this.characterData.stats).reduce((a, b) => a + Number(b), 0);
        let remaining = 60 - total;
        if (remaining <= 0) return;

        while (remaining > 0) {
            const eligible = statsKeys.filter(k => (this.characterData.stats[k] || 0) < 10);
            if (eligible.length === 0) break;
            const randomKey = eligible[Math.floor(Math.random() * eligible.length)];
            this.characterData.stats[randomKey] = (this.characterData.stats[randomKey] || 0) + 1;
            remaining--;
        }
        this.render(true);
    }

    _adjustSkill(event, target) {
        const skillId = target.dataset.skill;
        const delta = parseInt(target.dataset.delta || 0);
        let val = (this.characterData.skills[skillId] || 0) + delta;
        if (event.type === "change") val = parseInt(target.value);

        const type = target.dataset.type;
        const isProg = type === "profession";

        const skill = this.allSkills.find(s => s._id === skillId);
        const isNative = skill ? this._isNativeLanguage(skill.name) : false;

        let minVal, maxVal;
        if (isNative) {
            minVal = 8;
            maxVal = 10;
        } else {
            minVal = isProg ? 1 : 0;
            maxVal = 6;
        }

        val = Math.max(minVal, Math.min(maxVal, val));

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
            const text = await this._rollTable(t);
            this.characterData.background.socialStatus = text;
        } else {
            ui.notifications.warn(`Tabella '${tableName}' non trovata nel mondo o nei compendi.`);
        }
        this.render(true);
    }

    async _rollFamilyFate() {
        const origin = this._getOriginCategory();
        let tableName = "";
        let hints = [];
        if (origin === "Terre Antiche") {
            tableName = "Sorte della Famiglia (Terre Antiche)";
            hints = ["Sorte della Famiglia (Terre Antiche)", "Sorte della Famiglia - Terre Antiche", "Destino della Famiglia (Terre Antiche)", "Destino della Famiglia - Terre Antiche", "Terre Antiche"];
        } else if (origin === "Nilfgaardiana") {
            tableName = "Sorte della Famiglia (Nilfgaardiana)";
            hints = ["Sorte della Famiglia (Nilfgaardiana)", "Sorte della Famiglia - Nilfgaardiana", "Destino della Famiglia (Nilfgaardiana)", "Destino della Famiglia - Nilfgaardiana", "Nilfgaardiana"];
        } else {
            tableName = "Sorte della Famiglia (Settentrionale)";
            hints = ["Sorte della Famiglia (Settentrionale)", "Sorte della Famiglia - Settentrionale", "Destino della Famiglia (Settentrionale)", "Destino della Famiglia - Settentrionale", "Settentrionale"];
        }
        
        // Fallbacks
        hints.push("Sorte della Famiglia", "Sorte Familiare", "Destino della Famiglia", "Destino Familiare", "Family Fate", "Family Background");

        const t = await this._findTable(hints);
        if (t) {
            const text = await this._rollTable(t);
            this.characterData.background.familyFate = text;
        } else {
            ui.notifications.warn(`Tabella '${tableName}' non trovata nel mondo o nei compendi.`);
        }
        this.render(true);
    }

    async _rollParentsFate() {
        const origin = this._getOriginCategory();
        let tableName = "";
        let hints = [];
        if (origin === "Terre Antiche") {
            tableName = "Sorte dei Genitori (Terre Antiche)";
            hints = ["Sorte dei Genitori (Terre Antiche)", "Sorte dei Genitori - Terre Antiche", "Terre Antiche"];
        } else if (origin === "Nilfgaardiana") {
            tableName = "Sorte dei Genitori (Nilfgaardiana)";
            hints = ["Sorte dei Genitori (Nilfgaardiana)", "Sorte dei Genitori - Nilfgaardiana", "Nilfgaardiana"];
        } else {
            tableName = "Sorte dei Genitori (Settentrionale)";
            hints = ["Sorte dei Genitori (Settentrionale)", "Sorte dei Genitori - Settentrionale", "Settentrionale"];
        }
        
        // Fallbacks
        hints.push("Sorte dei Genitori", "Sorte Genitori", "Parents Fate", "Parents Background");

        const t = await this._findTable(hints);
        if (t) {
            const text = await this._rollTable(t);
            this.characterData.background.parentsFate = text;
        } else {
            ui.notifications.warn(`Tabella '${tableName}' non trovata nel mondo o nei compendi.`);
        }
        this.render(true);
    }

    async _rollLifeEvents() {
        const age = this.characterData.age || 20;
        const maxEvents = Math.floor((age - 20) / 10) + 1;
        const existing = this.characterData.background.events;

        if (maxEvents <= 0) {
            ui.notifications.warn("Il personaggio è troppo giovane per avere eventi della vita (età minima 20 anni).");
            return;
        }

        if (existing.length >= maxEvents) {
            ui.notifications.warn(`Hai già tirato il numero massimo di eventi consentiti per l'età di ${age} anni (${maxEvents} eventi).`);
            return;
        }

        const nextAge = existing.length > 0 ? existing[existing.length - 1].age + 10 : 20;
        const roll1 = Math.floor(Math.random() * 10) + 1;
        let eventText = "";

        if (roll1 >= 1 && roll1 <= 4) {
            // Category: Fortuna o Sfortuna
            const roll2 = Math.floor(Math.random() * 10) + 1;
            const isEven = (roll2 % 2 === 0);
            const subTableName = isEven ? "Fortuna" : "Sfortuna";
            const table = await this._findTable([subTableName]);
            
            if (table) {
                const text = await this._rollTable(table);
                eventText = `<strong>Fortuna o Sfortuna: ${subTableName}</strong> ➔ ${text}`;
            } else {
                ui.notifications.warn(`Tabella '${subTableName}' non trovata nel mondo o nei compendi.`);
                return;
            }
        } else if (roll1 >= 5 && roll1 <= 7) {
            // Category: Alleati o Nemici
            const roll2 = Math.floor(Math.random() * 10) + 1;
            const isEven = (roll2 % 2 === 0);
            const subTableName = isEven ? "Alleati" : "Nemici";
            const table = await this._findTable([subTableName]);
            
            if (table) {
                const text = await this._rollTable(table);
                eventText = `<strong>Alleati o Nemici: ${isEven ? "Alleato" : "Nemico"}</strong> ➔ ${text}`;
            } else {
                ui.notifications.warn(`Tabella '${subTableName}' non trovata nel mondo o nei compendi.`);
                return;
            }
        } else {
            // Category: Relazione Amorosa (8-10)
            const roll2 = Math.floor(Math.random() * 10) + 1;
            let romanceOutcome = "";
            let subTableToRoll = "";

            if (roll2 === 1) {
                romanceOutcome = "Felice Storia d'Amore";
            } else if (roll2 >= 2 && roll2 <= 4) {
                romanceOutcome = "Tragedia Sentimentale";
                subTableToRoll = "Tragedia Sentimentale";
            } else if (roll2 >= 5 && roll2 <= 6) {
                romanceOutcome = "Amore Problematico";
                subTableToRoll = "Amore Problematico";
            } else {
                romanceOutcome = "Puttane e Dissolutezze";
            }

            if (subTableToRoll) {
                const table = await this._findTable([subTableToRoll]);
                if (table) {
                    const text = await this._rollTable(table);
                    eventText = `<strong>Relazione Amorosa: ${romanceOutcome}</strong> ➔ ${text}`;
                } else {
                    ui.notifications.warn(`Tabella '${subTableToRoll}' non trovata nel mondo o nei compendi.`);
                    return;
                }
            } else {
                eventText = `<strong>Relazione Amorosa: ${romanceOutcome}</strong>`;
            }
        }

        existing.push({ age: nextAge, text: eventText });
        this.render(true);
    }

    _updateBackground(event, target) {
        const name = target.name || target.dataset?.name;
        const value = target.value || target.dataset?.value || "";
        let needsRender = false;

        if (name === "background.socialStatus") {
            this.characterData.background.socialStatus = value;
            if (target.tagName === "SELECT" || target.tagName === "BUTTON") needsRender = true;
        } else if (name === "background.familyState") {
            this.characterData.background.familyState = value;
            needsRender = true;
            if (value === "alive") {
                this.characterData.background.familyFate = "Almeno parte della famiglia è ancora viva.";
            } else {
                this.characterData.background.familyFate = "";
                this.characterData.background.parentsState = "";
                this.characterData.background.parentsFate = "";
            }
        } else if (name === "background.familyFate") {
            this.characterData.background.familyFate = value;
            if (target.tagName === "SELECT" || target.tagName === "BUTTON") needsRender = true;
        } else if (name === "background.parentsState") {
            this.characterData.background.parentsState = value;
            needsRender = true;
            this.characterData.background.parentsFate = "";
            this.characterData.background.socialStatus = "";
        } else if (name === "background.parentsFate") {
            this.characterData.background.parentsFate = value;
            if (target.tagName === "SELECT" || target.tagName === "BUTTON") needsRender = true;
        }

        if (target.tagName === "BUTTON") {
            const wrapper = target.closest?.('.manual-dropdown');
            if (wrapper) wrapper.removeAttribute('open');
        }

        if (needsRender) {
            this.render(true);
        }
    }

    _openListModal(event, target) {
        const field = target.dataset.field;
        const title = target.dataset.title || "Seleziona opzione";
        let options = [];

        if (field === "background.socialStatus") {
            options = this.socialStatusOptions || [];
        } else if (field === "background.familyFate") {
            options = this.familyFateOptions || [];
        } else if (field === "background.parentsFate") {
            options = this.parentsFateOptions || [];
        }

        if (!options.length) return;

        const currentValue = field === "background.socialStatus" 
            ? this.characterData.background.socialStatus
            : (field === "background.familyFate" ? this.characterData.background.familyFate : this.characterData.background.parentsFate);

        let html = `<div class="list-modal-search">
            <input type="search" placeholder="Cerca opzione..." class="list-modal-filter">
        </div>
        <div class="list-modal-items">`;

        options.forEach(opt => {
            const selected = opt === currentValue ? ' data-selected="true"' : '';
            html += `<button type="button" class="list-modal-item" data-value="${opt}"${selected}>
                ${opt}
            </button>`;
        });

        html += `</div>`;

        const dialog = new Dialog({
            title: title,
            content: html,
            buttons: {
                cancel: {
                    label: "Annulla",
                    callback: () => {}
                }
            },
            default: "cancel"
        }, {
            width: 700,
            classes: ["dialog", "witcher-wizard-modal", "witcher-style"]
        });

        dialog.render(true);

        setTimeout(() => {
            const modal = dialog.element[0] || dialog.element;
            if (!modal) return;

            const filterInput = modal.querySelector('.list-modal-filter');
            const items = modal.querySelectorAll('.list-modal-item');

            if (filterInput) {
                filterInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    items.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(query) ? '' : 'none';
                    });
                });
                filterInput.focus();
            }

            items.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;
                    const synthTarget = {
                        name: field,
                        value: value,
                        tagName: 'BUTTON',
                        dataset: {}
                    };
                    this._updateBackground(null, synthTarget);
                    dialog.close();
                });
            });
        }, 100);
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

    _hasResults(t) {
        if (!t) return false;
        const r = t.results;
        if (!r) return false;
        if (typeof r.size === "number") return r.size > 0;
        if (typeof r.length === "number") return r.length > 0;
        return true;
    }

    async _findTable(hints) {
        console.log("TheWitcherItaNewSystem | _findTable | Searching for table with hints:", hints);
        const lowerHints = hints.map(h => h.toLowerCase());

        // 1. Search world tables for exact match
        for (const lh of lowerHints) {
            const t = game.tables.find(t => t.name && t.name.toLowerCase() === lh && this._hasResults(t));
            if (t) {
                console.log("TheWitcherItaNewSystem | _findTable | Found exact match in world tables:", t.name);
                return t;
            }
        }

        // 2. Search registered compendium packs of type RollTable for exact match
        const rollTablePacks = game.packs.filter(p => p.documentName === "RollTable" || p.metadata.type === "RollTable" || p.metadata.documentName === "RollTable");
        console.log("TheWitcherItaNewSystem | _findTable | Found RollTable packs:", rollTablePacks.map(p => p.collection || p.metadata.id));
        for (const pack of rollTablePacks) {
            const index = pack.index.size > 0 ? pack.index : await pack.getIndex();
            for (const lh of lowerHints) {
                const entry = index.find(e => e.name && e.name.toLowerCase() === lh);
                if (entry) {
                    console.log(`TheWitcherItaNewSystem | _findTable | Found exact entry in pack ${pack.collection}:`, entry.name);
                    const doc = await pack.getDocument(entry._id);
                    if (doc) {
                        const hasResults = this._hasResults(doc);
                        console.log(`TheWitcherItaNewSystem | _findTable | Loaded document: ${doc.name}, hasResults: ${hasResults}, results:`, doc.results);
                        if (hasResults) return doc;
                    }
                }
            }
        }

        // 3. Search world tables for fuzzy match (includes)
        for (const lh of lowerHints) {
            const t = game.tables.find(t => t.name && t.name.toLowerCase().includes(lh) && this._hasResults(t));
            if (t) {
                console.log("TheWitcherItaNewSystem | _findTable | Found fuzzy match in world tables:", t.name);
                return t;
            }
        }

        // 4. Search registered compendium packs of type RollTable for fuzzy match (includes)
        for (const pack of rollTablePacks) {
            const index = pack.index.size > 0 ? pack.index : await pack.getIndex();
            for (const lh of lowerHints) {
                const entry = index.find(e => e.name && e.name.toLowerCase().includes(lh));
                if (entry) {
                    console.log(`TheWitcherItaNewSystem | _findTable | Found fuzzy entry in pack ${pack.collection}:`, entry.name);
                    const doc = await pack.getDocument(entry._id);
                    if (doc) {
                        const hasResults = this._hasResults(doc);
                        console.log(`TheWitcherItaNewSystem | _findTable | Loaded fuzzy document: ${doc.name}, hasResults: ${hasResults}, results:`, doc.results);
                        if (hasResults) return doc;
                    }
                }
            }
        }
        console.warn("TheWitcherItaNewSystem | _findTable | Table not found with hints:", hints);
        return null;
    }

    async _rollTable(t) {
        if (!t) return "";
        try {
            const r = await t.roll({ displayChat: false });
            if (!r || !r.results || r.results.length === 0) {
                throw new Error("Empty results from native roll");
            }
            const text = r.results[0]?.name || r.results[0]?.description || r.results[0]?._source?.text || r.results[0]?._source?.description || "";
            if (!text) {
                throw new Error("Empty text resolved from native roll results");
            }
            return text;
        } catch (err) {
            console.warn("TheWitcherItaNewSystem | Error rolling table, using fallback:", err);
            // Fallback manual roll
            const formula = t.formula || "1d10";
            const roll = new Roll(formula);
            await roll.evaluate();
            const total = roll.total;
            const res = t.results.find(r => {
                const range = r.range;
                if (!Array.isArray(range) || range.length < 2) return false;
                return total >= range[0] && total <= range[1];
            });
            return res?.name || res?.description || res?._source?.text || res?._source?.description || "";
        }
    }

    _selectAvatar() { 
        new FilePicker({ type: "image", callback: (p) => { this.characterData.img = p; this.render(true); } }).browse(); 
    }

    async _finish() {
        const name = this.characterData.name || "New Hero";
        
        // 1. Compile Background Biography HTML
        let bgHtml = "";
        const bg = this.characterData.background;
        if (bg.socialStatus) {
            bgHtml += `<p><strong>Situazione Familiare:</strong> ${bg.socialStatus}</p>`;
        }
        if (bg.familyState) {
            const famStr = bg.familyState === "alive" ? "Almeno parte della famiglia è ancora viva." : "Qualcosa è Accaduto alla Famiglia";
            bgHtml += `<p><strong>Stato della Famiglia:</strong> ${famStr}</p>`;
            if (bg.familyFate) {
                bgHtml += `<p><strong>Sorte della Famiglia:</strong> ${bg.familyFate}</p>`;
            }
        }
        if (bg.parentsState) {
            const parStr = bg.parentsState === "alive" ? "Genitori Vivi" : "Qualcosa è Accaduto ai Genitori";
            bgHtml += `<p><strong>Stato dei Genitori:</strong> ${parStr}</p>`;
            if (bg.parentsFate) {
                bgHtml += `<p><strong>Sorte dei Genitori:</strong> ${bg.parentsFate}</p>`;
            }
        }
        if (bg.events && bg.events.length > 0) {
            bgHtml += `<h3>Eventi della Vita:</h3><ul>`;
            for (const ev of bg.events) {
                bgHtml += `<li><strong>Età ${ev.age}:</strong> ${ev.text}</li>`;
            }
            bgHtml += `</ul>`;
        }

        // 2. Prepare base actor data
        const actorData = {
            name,
            type: "character",
            img: this.characterData.img || "icons/svg/mystery-man.svg",
            system: {
                gender: this.characterData.gender || "",
                stats: {},
                details: {
                    race: this.characterData.race?.name || "",
                    profession: this.characterData.profession?.name || "",
                    homeland: this.characterData.homeland || "",
                    age: this.characterData.age || 20
                },
                general: {
                    age: this.characterData.age || 20,
                    socialStanding: bg.socialStatus || "",
                    homeland: {
                        value: this.characterData.homeland || ""
                    },
                    background: {
                        value: bgHtml
                    },
                    lifeEvents: {}
                },
                currency: {
                    crown: Number(this.characterData.money) || 0
                }
            }
        };

        // Populate lifeEvents in general
        for (const ev of bg.events) {
            const decadeKey = ev.age;
            if (decadeKey >= 10 && decadeKey <= 200) {
                actorData.system.general.lifeEvents[decadeKey] = {
                    value: ev.text || "",
                    details: "",
                    isOpened: false
                };
            }
        }

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
            
            // Apply defining skill level if present
            if (this.characterData.skills["definingSkill"] !== undefined && p.system.definingSkill) {
                p.system.definingSkill.level = this.characterData.skills["definingSkill"];
            }
            
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
            if (skillId === "definingSkill") continue; // Handled within profession item
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
