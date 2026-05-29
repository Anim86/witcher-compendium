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
            gnomeSkills: [],
            gear: [],
            money: 0,
            selectedProfessionGear: []
        };

        this.gearCategoryVisibility = {
            weapons: false,
            armor: false,
            equipment: false
        };

        this.gearFilterText = {
            weapons: "",
            armor: "",
            equipment: ""
        };

        this.startingGoldRolled = false;

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
        "Druido": { choose: 5, items: ["Bastone", "Sacco", "Borsello", "Attrezzatura alchemica", "Clessidra", "Lanterna", "Erbe Anestetiche", "Fodero da Giarrettiera"] },
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
        rollAllBackground: function(event, target) { this._rollAllBackground(event, target); },
        rollBackground: function(event, target) { this._rollBackground(event, target); },
        rollLifeEvents: function(event, target) { this._rollLifeEvents(event, target); },
        rollFamilyFate: function(event, target) { this._rollFamilyFate(event, target); },
        rollParentsFate: function(event, target) { this._rollParentsFate(event, target); },
        updateBackground: function(event, target) { this._updateBackground(event, target); },
        toggleGear: function(event, target) { this._toggleGear(event, target); },
        removeGear: function(event, target) { this._removeGear(event, target); },
        selectAvatar: function(event, target) { this._selectAvatar(event, target); },
        openListModal: function(event, target) { this._openListModal(event, target); },
        goToStep: function(event, target) { this._goToStep(event, target); },
        addPickupSkill: function(event, target) { this._addPickupSkill(event, target); },
        removePickupSkill: function(event, target) { this._removePickupSkill(event, target); },
        addCombatSkill: function(event, target) { this._addCombatSkill(event, target); },
        removeCombatSkill: function(event, target) { this._removeCombatSkill(event, target); },
        addBardLanguage: function(event, target) { this._addBardLanguage(event, target); },
        removeBardLanguage: function(event, target) { this._removeBardLanguage(event, target); },
        finish: function(event, target) { this._finish(event, target); },
        switchSkillTab: function(event, target) { this._switchSkillTab(event, target); },
        toggleGnomeSkill: function(event, target) { this._toggleGnomeSkill(event, target); },
        toggleProfessionGear: function(event, target) { this._toggleProfessionGear(event, target); },
        randomProfessionGear: function(event, target) { this._randomProfessionGear(event, target); },
        toggleGearCategory: function(event, target) { this._toggleGearCategory(event, target); },
        rollAllSkills: function(event, target) { this._rollAllSkills(event, target); },
        rollStartingGold: function(event, target) { this._rollStartingGold(event, target); },
        toggleMagicItem: function(event, target) { this._toggleMagicItem(event, target); }
    };

    static PARTS = {
        navigation: { template: "systems/TheWitcherItaNewSystem/templates/app/wizard/navigation.hbs" },
        content: { template: "systems/TheWitcherItaNewSystem/templates/app/wizard/content.hbs" },
        footer: { template: "systems/TheWitcherItaNewSystem/templates/app/wizard/footer.hbs" }
    };

    static STARTING_GOLD_MULTIPLIER = {
        "armigero": 120,
        "artigiano": 120,
        "bardo": 100,
        "criminale": 150,
        "mago": 200,
        "medico": 150,
        "mercante": 180,
        "prete": 75,
        "witcher": 50,
        "druido": 75,
        "villico": 20
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
                this.allSkills = docs;
            }

            if (this._isSpellcaster()) {
                if (!this.allSpells) {
                    const pack = game.packs.get("witcher-compendium.witcher-spells");
                    const docs = pack ? await pack.getDocuments() : [];
                    this.allSpells = docs.filter(d => {
                        const lvl = d.system?.level || "";
                        const cls = d.system?.class || "";
                        return lvl === "novice" && ["Spells", "Mage"].includes(cls);
                    });
                }
                if (!this.allInvocations) {
                    const pack = game.packs.get("witcher-compendium.witcher-invocations");
                    const docs = pack ? await pack.getDocuments() : [];
                    this.allInvocations = docs.filter(d => {
                        const lvl = d.system?.level || "";
                        const src = d.system?.source || "";
                        const prof = this.characterData.profession?.name?.toLowerCase() || "";
                        if (prof.includes("druido")) {
                            return lvl === "novice" && src === "Druid";
                        } else {
                            return lvl === "novice" && src === "Priest";
                        }
                    });
                }
                if (!this.allRituals) {
                    const pack = game.packs.get("witcher-compendium.witcher-rituals");
                    const docs = pack ? await pack.getDocuments() : [];
                    this.allRituals = docs.filter(d => (d.system?.level || "") === "novice");
                }
                if (!this.allHexes) {
                    const pack = game.packs.get("witcher-compendium.witcher-hexes");
                    const docs = pack ? await pack.getDocuments() : [];
                    this.allHexes = docs.filter(d => (d.system?.level || "") === "novice");
                }
            }

            if (!this.patriaList) {
                const gmPack = game.packs.get("witcher-compendium.witcher-rolltable-strumentigm");
                const gmDocs = gmPack ? await gmPack.getDocuments() : [];
                const patriaTable = gmDocs.find(d => d.name === "Patria");
                this.patriaList = patriaTable ? patriaTable.results.map(r => r.flags?.witcher || { regione: r.regione, patria: r.patria, bonus: r.bonus, abilita: r.abilita, text: r.text }) : [];
            }
            
            // 1.1 Calculate Budget and Gear Cost
            const gearCost = this.characterData.gear.reduce((acc, item) => {
                const cost = Number(item.system?.cost?.value || item.system?.cost || 0);
                return acc + cost;
            }, 0);
            const isOverBudget = this._isOverBudget(false);
            const isOverBudgetPickup = this._isOverBudget(true);
            
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

            const selectedGear = this.characterData.gear.map(i => {
                const obj = i.toObject ? i.toObject() : { ...i };
                obj._id = obj._id || obj.id || i.id;
                obj.id = obj.id || obj._id;
                return obj;
            });
            
            
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
                const raceName = this.characterData.race.name || "";
                filteredProfessions = this.professions.filter(p => {
                    const pName = p.name || "";
                    
                    if (this._isWitcherName(raceName)) {
                        return this._isWitcherName(pName);
                    }

                    if (this._isWitcherName(pName)) {
                        return false;
                    }

                    if (this._isMagicProfessionName(pName)) {
                        return this._isMagicRaceName(raceName);
                    }
                    
                    return true;
                });
            }
            filteredProfessions = [...filteredProfessions].sort((a, b) => (a.name || "").localeCompare(b.name || "", "it", { sensitivity: "base" }));

            const regionsRaw = [...new Set((this.patriaList || []).map(p => p.regione))];
            const regionLabels = {
                north: "Regni Settentrionali",
                nilfgaard: "Impero di Nilfgaard",
                elder: "Terre degli Antichi"
            };
            const computedOriginRegions = regionsRaw.map(r => ({ value: r, label: regionLabels[r] || r }));

            let filteredHomelands = [];
            if (this.characterData.originRegion && this.patriaList) {
                filteredHomelands = this.patriaList
                    .filter(p => p.regione === this.characterData.originRegion)
                    .map(p => ({ value: p.patria, label: p.text }));
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

            // Bard language logic
            let availableBardLanguages = [];
            let bardLanguagesRemaining = 0;
            const isBardo = this.characterData.profession?.name?.toLowerCase() === "bardo";
            const isMercante = this.characterData.profession?.name?.toLowerCase() === "mercante";
            if (isBardo || isMercante) {
                if (!this.characterData.selectedBardLanguages) this.characterData.selectedBardLanguages = [];
                const maxBardLanguages = isMercante ? 2 : 1;
                const selectedCount = this.characterData.selectedBardLanguages.length;
                bardLanguagesRemaining = Math.max(0, maxBardLanguages - selectedCount);

                if (bardLanguagesRemaining > 0) {
                    const langKeys = ["commonspeech", "eldersp", "dwarven"];
                    const validLangIds = langKeys.map(k => this._findSkillByKeyOrName(k)?._id).filter(Boolean);
                    
                    availableBardLanguages = this.allSkills.filter(s => 
                        validLangIds.includes(s._id) && 
                        !this._isNativeLanguage(s.name) &&
                        !this.characterData.selectedBardLanguages.includes(s._id)
                    ).map(s => {
                        return {
                            key: s._id,
                            name: s.name,
                            cost: this._getSkillCost(s)
                        };
                    });
                }
            }

            let availableGnomeSkills = [];
            let gnomeSkillsRemaining = 0;
            if (this.characterData.race?.name === "Gnomo") {
                availableGnomeSkills = [
                    { id: "alchemy", label: "Alchimia (Difficile)", selected: this.characterData.gnomeSkills?.includes("alchemy") },
                    { id: "crafting", label: "Artigianato (Difficile)", selected: this.characterData.gnomeSkills?.includes("crafting") },
                    { id: "disguise", label: "Camuffamento", selected: this.characterData.gnomeSkills?.includes("disguise") },
                    { id: "firstaid", label: "Pronto Soccorso", selected: this.characterData.gnomeSkills?.includes("firstaid") },
                    { id: "forgery", label: "Falsificare", selected: this.characterData.gnomeSkills?.includes("forgery") },
                    { id: "picklock", label: "Scassinare", selected: this.characterData.gnomeSkills?.includes("picklock") },
                    { id: "trapcraft", label: "Costruire Trappole (Difficile)", selected: this.characterData.gnomeSkills?.includes("trapcraft") }
                ];
                gnomeSkillsRemaining = 3 - (this.characterData.gnomeSkills?.length || 0);
            }

            let magicSpells = [];
            let magicInvocations = [];
            let magicRituals = [];
            let magicHexes = [];

            let selectedSpellsCount = 0;
            let selectedInvocationsCount = 0;
            let selectedRitualsCount = 0;
            let selectedHexesCount = 0;

            if (this._isSpellcaster()) {
                const isMagicSelected = (item) => {
                    const sel = this.characterData.selectedMagic || [];
                    return sel.some(m => m.id === item.id || m._id === item.id);
                };
                const sanitizeMagic = (i) => {
                    const obj = i.toObject ? i.toObject() : i;
                    obj.id = obj._id || obj.id || i.id;
                    obj._id = obj.id;
                    return {
                        ...obj,
                        selected: isMagicSelected(obj)
                    };
                };

                const selected = this.characterData.selectedMagic || [];
                selectedSpellsCount = selected.filter(m => m.type === "spell" && ["Spells", "Mage"].includes(m.system?.class)).length;
                selectedInvocationsCount = selected.filter(m => m.type === "spell" && m.system?.class === "Invocations").length;
                selectedRitualsCount = selected.filter(m => m.type === "ritual").length;
                selectedHexesCount = selected.filter(m => m.type === "hex").length;

                if (this.allSpells) magicSpells = this.allSpells.map(sanitizeMagic);
                if (this.allInvocations) magicInvocations = this.allInvocations.map(sanitizeMagic);
                if (this.allRituals) magicRituals = this.allRituals.map(sanitizeMagic);
                if (this.allHexes) magicHexes = this.allHexes.map(sanitizeMagic);
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
                genders: [
                    { value: "male", label: "Maschio" },
                    { value: "female", label: "Femmina" },
                    { value: "other", label: "Altro" }
                ],
                regions: computedOriginRegions,
                homelands: filteredHomelands,
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
                availableGnomeSkills: availableGnomeSkills,
                gnomeSkillsRemaining: gnomeSkillsRemaining,
                currentTemplate: this._getTemplateForStep(this.step),
                availableCombatSkills: availableCombatSkills,
                combatSkillsRemaining: combatSkillsRemaining,
                isArmigero: isArmigero,
                availableBardLanguages: availableBardLanguages,
                bardLanguagesRemaining: bardLanguagesRemaining,
                isBardo: isBardo || isMercante,
                allGear: {
                    weapons: (this.weapons || []).filter(i => (i.system?.cost || 0) > 0).map(sanitizeItem),
                    armor: (this.armor || []).filter(i => (i.system?.cost || 0) > 0).map(sanitizeItem),
                    equipment: (this.gear || []).filter(i => (i.system?.cost || 0) > 0).map(sanitizeItem)
                },
                gearCategoryVisibility: this.gearCategoryVisibility,
                gearFilterText: this.gearFilterText,
                gearCost: gearCost,
                selectedGear: selectedGear,
                professionGearList: professionGearList,
                professionGearRemaining: professionGearRemaining,
                professionGearChoose: gearConfig?.choose || 0,
                isOverBudget: isOverBudget,
                isOverBudgetPickup: isOverBudgetPickup,
                startingGoldRolled: this.startingGoldRolled,
                professionGear: this.characterData.profession?.system?.notes || "",
                magic: {
                    spells: magicSpells,
                    invocations: magicInvocations,
                    rituals: magicRituals,
                    hexes: magicHexes,
                    limits: this._getMagicLimits(),
                    counts: {
                        spells: selectedSpellsCount,
                        invocations: selectedInvocationsCount,
                        rituals: selectedRitualsCount,
                        hexes: selectedHexesCount
                    },
                    isMage: (this.characterData.profession?.name?.toLowerCase() || "").includes("mago"),
                    isPriestOrDruid: (this.characterData.profession?.name?.toLowerCase() || "").includes("prete") || (this.characterData.profession?.name?.toLowerCase() || "").includes("druido")
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
        
        const finalSkills = {};

        // 1. Base chosen skills
        for (const [key, value] of Object.entries(this.characterData.skills)) {
            if (key !== "definingSkill" && value > 0) {
                const s = this.allSkills.find(s => s._id === key);
                if (s) finalSkills[s.name] = value;
            }
        }

        // 2. Defining Skill
        if (this.characterData.skills["definingSkill"] !== undefined && this.characterData.profession?.system?.definingSkill?.skillName) {
            finalSkills[this.characterData.profession.system.definingSkill.skillName] = this.characterData.skills["definingSkill"];
        }

        // 3. Homeland Bonus
        let homelandBonusSkillName = null;
        let homelandBonusValue = 0;
        if (this.characterData.homeland && this.patriaList) {
            const p = this.patriaList.find(x => x.patria === this.characterData.homeland);
            if (p) {
                homelandBonusSkillName = p.abilita;
                homelandBonusValue = parseInt(p.bonus.replace('+','')) || 1;
            }
        }
        if (homelandBonusSkillName) {
            const skillItem = this.allSkills.find(s => s.name.toLowerCase() === homelandBonusSkillName.toLowerCase());
            const finalName = skillItem ? skillItem.name : homelandBonusSkillName;
            finalSkills[finalName] = (finalSkills[finalName] || 0) + homelandBonusValue;
        }

        // 4. Gnome Bonus
        if (this.characterData.race?.name === "Gnomo" && this.characterData.gnomeSkills?.length > 0) {
            this.characterData.gnomeSkills.forEach(skillId => {
                const s = this.allSkills.find(sk => sk._id === skillId);
                if (s) {
                    finalSkills[s.name] = (finalSkills[s.name] || 0) + 2;
                }
            });
        }

        const skills = Object.entries(finalSkills).map(([label, value]) => ({ label, value })).sort((a,b) => a.label.localeCompare(b.label));

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

        const selectedMagic = (this.characterData.selectedMagic || []).map(m => {
            let labelType = "Magia";
            if (m.type === "ritual") labelType = "Rituale";
            else if (m.type === "hex") labelType = "Fattura";
            else if (m.type === "spell") {
                if (m.system?.class === "Invocations") labelType = "Invocazione";
                else labelType = "Incantesimo";
            }
            return {
                id: m.id || m._id,
                name: m.name,
                img: m.img,
                type: m.type,
                labelType: labelType,
                description: m.system?.description || ""
            };
        });

        return { stats, skills, professionGear: profGear, selectedMagic };
    }

    _getProfessionSkillNames() {
        if (!this.characterData.profession) return [];
        const raw = this.characterData.profession.system?.professionSkills;
        let names = [];
        if (raw instanceof Set) names = Array.from(raw);
        else if (Array.isArray(raw)) names = [...raw];
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

        if (this.characterData.selectedBardLanguages && this.characterData.selectedBardLanguages.length > 0) {
            for (const id of this.characterData.selectedBardLanguages) {
                const s = this.allSkills.find(sk => sk._id === id);
                if (s) names.push(s.name);
            }
        }

        return names;
    }

    _normalizeSkillKey(keyOrName) {
        if (!keyOrName) return keyOrName;
        const normalized = keyOrName.toString().trim().toLowerCase();
        const legacyAliases = {
            wildernesssurvival: 'wilderness',
            commonspeech: 'commonspeech',
            elderspeech: 'eldersp',
            dwarvenspeech: 'dwarven',
            monsterlore: 'monster',
            socialetiquette: 'socialetq',
            dodgeescape: 'dodge',
            sleightofhand: 'sleight',
            firstaid: 'firstaid',
            prontosoccorso: 'firstaid',
            primosoccorso: 'firstaid',
            picklock: 'picklock',
            trapcrafting: 'trapcraft',
            finearts: 'finearts',
            groomingandstyle: 'grooming',
            humanperception: 'perception',
            resistcoercion: 'resistcoerc',
            resistmagic: 'resistmagic',
            hexweaving: 'hexweave',
            spellcasting: 'spellcast',
            ritualcrafting: 'ritcraft'
        };
        return legacyAliases[normalized] || normalized;
    }

    _findSkillByKeyOrName(keyOrName) {
        if (!keyOrName) return null;
        keyOrName = this._normalizeSkillKey(keyOrName);
        const lowerKeyOrName = keyOrName.toLowerCase();

        // 1. Try to find entry in CONFIG.WITCHER.skillMap by key or by entry.name
        let entry = CONFIG.WITCHER.skillMap[keyOrName];
        if (!entry) {
            entry = Object.values(CONFIG.WITCHER.skillMap).find(e => {
                if (e.name && e.name.toLowerCase() === lowerKeyOrName) return true;
                if (e.rollLabel && game.i18n.localize(e.rollLabel).toLowerCase() === lowerKeyOrName) return true;
                return game.i18n.localize(e.label).toLowerCase() === lowerKeyOrName;
            });
        }

        // Get the localized label and the technical name
        const localizedLabel = entry ? game.i18n.localize(entry.label).toLowerCase() : lowerKeyOrName;
        const localizedRollLabel = entry && entry.rollLabel ? game.i18n.localize(entry.rollLabel).toLowerCase() : null;
        const technicalName = entry?.name ? entry.name.toLowerCase() : lowerKeyOrName;

        // 2. Search in allSkills matching localized label, technical name, or keyOrName
        const cleanLabel = localizedLabel.replace(/\s*\(\d+\)\s*$/, '');
        return this.allSkills.find(s => {
            const sName = s.name.toLowerCase();
            const sNameClean = sName.replace(/\s*\(\d+\)\s*$/, '');
            return sNameClean === cleanLabel || 
                   sNameClean === localizedLabel ||
                   sNameClean === localizedRollLabel || 
                   sName === technicalName || 
                   sName === lowerKeyOrName;
        });
    }

    _getSkillInfo(skill) {
        const sNameClean = skill.name.toLowerCase().replace(/\s*\(\d+\)\s*$/, '');
        const entry = Object.values(CONFIG.WITCHER.skillMap).find(e => {
            if (e.name && e.name.toLowerCase() === sNameClean) return true;
            if (e.rollLabel && game.i18n.localize(e.rollLabel).toLowerCase() === sNameClean) return true;
            const labelClean = game.i18n.localize(e.label).toLowerCase().replace(/\s*\(\d+\)\s*$/, '');
            return labelClean === sNameClean;
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

    _cleanSkillName(value) {
        return (value || "")
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^linguaggio:\s*/, "")
            .replace(/\s*\(\d+\)\s*$/, "");
    }

    _resolveSkillMapEntry(skillOrName) {
        if (!skillOrName || !CONFIG.WITCHER?.skillMap) return null;

        const skillName = typeof skillOrName === "string" ? skillOrName : skillOrName.name;
        const rawCandidates = [
            skillName,
            typeof skillOrName === "string" ? skillOrName : skillOrName.system?.key,
            typeof skillOrName === "string" ? null : skillOrName.system?.skill
        ].filter(Boolean);

        for (const candidate of rawCandidates) {
            const key = this._normalizeSkillKey(candidate);
            if (CONFIG.WITCHER.skillMap[key]) {
                return { mapKey: key, entry: CONFIG.WITCHER.skillMap[key] };
            }
        }

        const normalizedCandidates = rawCandidates.map(candidate => this._cleanSkillName(candidate));

        for (const [mapKey, entry] of Object.entries(CONFIG.WITCHER.skillMap)) {
            const labels = [
                mapKey,
                entry.name,
                entry.label ? game.i18n.localize(entry.label) : null,
                entry.rollLabel ? game.i18n.localize(entry.rollLabel) : null
            ].filter(Boolean).map(label => this._cleanSkillName(label));

            if (normalizedCandidates.some(candidate => labels.includes(candidate))) {
                return { mapKey, entry };
            }
        }

        return null;
    }

    _getActorSkillPath(skillOrName) {
        const resolved = this._resolveSkillMapEntry(skillOrName);
        if (!resolved?.entry?.attribute?.name) return null;

        return {
            stat: resolved.entry.attribute.name,
            key: resolved.entry.name || resolved.mapKey,
            entry: resolved.entry,
            mapKey: resolved.mapKey
        };
    }

    _getWizardProfessionSkillPaths() {
        const paths = new Set();
        for (const name of this._getProfessionSkillNames()) {
            const skill = this._findSkillByKeyOrName(name);
            const actorPath = this._getActorSkillPath(skill || name);
            if (actorPath) paths.add(`${actorPath.stat}.${actorPath.key}`);
        }
        return paths;
    }

    async _applyWizardSkillsToActor(actor) {
        if (!actor) return;

        const updates = {};
        const professionSkillPaths = this._getWizardProfessionSkillPaths();

        for (const [skillId, value] of Object.entries(this.characterData.skills)) {
            if (skillId === "definingSkill") continue;

            const numericValue = Number(value) || 0;
            if (numericValue <= 0) continue;

            const skillItem = this.allSkills.find(s => s._id === skillId) || this._findSkillByKeyOrName(skillId);
            const actorPath = this._getActorSkillPath(skillItem || skillId);

            if (!actorPath) {
                console.warn(`TheWitcherItaNewSystem | Wizard | Unable to map skill to actor data: "${skillId}"`);
                continue;
            }

            const pathKey = `${actorPath.stat}.${actorPath.key}`;
            const basePath = `system.skills.${pathKey}`;
            const isProfession = professionSkillPaths.has(pathKey);
            const multiplier = skillItem ? this._getSkillCost(skillItem) : (Number(actorPath.entry.cost) || 1);

            updates[`${basePath}.value`] = numericValue;
            updates[`${basePath}.isProfession`] = isProfession;
            updates[`${basePath}.isPickup`] = !isProfession;
            updates[`${basePath}.isLearned`] = true;
            updates[`${basePath}.multiplier`] = multiplier;
            updates[`${basePath}.isCombatSkill`] = Boolean(skillItem?.system?.isCombatSkill);
        }

        if (Object.keys(updates).length > 0) {
            await actor.update(updates);
        }
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
                const isManualCombatSkill = this.characterData.selectedCombatSkills && this.characterData.selectedCombatSkills.includes(skill._id);
                const isManualBardLanguage = this.characterData.selectedBardLanguages && this.characterData.selectedBardLanguages.includes(skill._id);
                result.push({
                    key: skill._id,
                    name: skill.name,
                    value: this.characterData.skills[skill._id] || 1, // Start at 1
                    cost: cost,
                    isDifficult: cost === 2,
                    isNativeLanguage: info.isNativeLanguage,
                    attributeLabel: info.attributeLabel,
                    description: skill.system?.description || "",
                    isManualCombatSkill: isManualCombatSkill,
                    isManualBardLanguage: isManualBardLanguage
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

    _isOverBudget(isPickup) {
        if (isPickup) {
            const available = (Number(this.characterData.stats.int) || 0) + (Number(this.characterData.stats.ref) || 0);
            const spent = this._getPickupSkills().reduce((acc, s) => {
                let val = s.value;
                if (this._isNativeLanguage(s.name)) {
                    val = Math.max(0, s.value - 8);
                }
                return acc + (val * s.cost);
            }, 0);
            return spent > available;
        } else {
            const gearCost = this.characterData.gear.reduce((acc, item) => {
                const cost = Number(item.system?.cost?.value || item.system?.cost || 0);
                return acc + cost;
            }, 0);
            return gearCost > (Number(this.characterData.money) || 0);
        }
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
     */    _isNativeLanguage(skillName) {
        const raceName = this.characterData.race?.name;
        if (!this.characterData.homeland || !this.patriaList) return false;
        
        const patria = this.patriaList.find(p => p.patria === this.characterData.homeland);
        let langKey = "commonspeech";
        
        if (patria) {
            if (patria.regione === "nilfgaard") langKey = "nilfgaardian";
            if (patria.regione === "elder") langKey = "eldersp";
            if (patria.regione === "skellige") langKey = "eldersp";
        }
        
        if (raceName) {
            if (["Elfo", "Vran"].includes(raceName)) langKey = "eldersp";
            if (["Nano", "Gnomo"].includes(raceName)) langKey = "dwarven";
        }

        const nativeSkill = this._findSkillByKeyOrName(langKey);
        return nativeSkill && nativeSkill.name.toLowerCase() === skillName.toLowerCase();
    }

    /**
     * Determines the cost of a skill from the item data.
     * @param {Object} skillItem - The skill item document or object.
     * @returns {number} - 1 for simple, 2 for difficult.
     * @private
     */
    _getSkillCost(skillItem) {
        return skillItem?.system?.isDifficult ? 2 : 1;
    }

    /**
     * Automatically updates the native language skill to +8 based on race and homeland.
     * @private
     */
    _updateNativeLanguage() {
        const raceName = this.characterData.race?.name;
        const homeland = this.characterData.homeland?.toLowerCase();
        
        let langKey = "commonspeech";
        if (raceName === "Elfo" || raceName === "Elfi") langKey = "eldersp";
        else if (raceName === "Nano" || raceName === "Nani" || raceName === "Gnomo") langKey = "dwarven";
        else if (raceName === "Umano" || raceName === "Umani") {
            const elderHomelands = ["nilfgaard", "vicovaro", "etolia", "gemmeria", "ebbing", "maecht", "mettina", "nazair", "gheso", "magturga", "skellige"];
            if (elderHomelands.includes(homeland)) langKey = "eldersp";
        }
        
        // Find the skill in allSkills using the helper
        const langSkill = this._findSkillByKeyOrName(langKey);
        
        if (langSkill) {
            // Clear existing level 8 from any language skill to avoid duplicates
            const langKeys = ["commonspeech", "eldersp", "dwarven"];
            const actorLangKeys = langKeys.map(k => CONFIG.WITCHER.skillMap[k]?.name || k);
            
            for (const skillId in this.characterData.skills) {
                const s = this.allSkills.find(sk => sk._id === skillId);
                const actorPath = this._getActorSkillPath(s || skillId);
                if (actorPath && actorLangKeys.includes(actorPath.key) && this.characterData.skills[skillId] === 8) {
                    this.characterData.skills[skillId] = 0;
                }
            }
            
            // Set the new native language to 8
            this.characterData.skills[langSkill._id] = 8;
        }
    }

    _isSpellcaster() {
        const profName = this.characterData.profession?.name?.toLowerCase() || "";
        return profName.includes("mago") || profName.includes("prete") || profName.includes("druido");
    }

    get maxSteps() {
        return this._isSpellcaster() ? 8 : 7;
    }

    _getMagicLimits() {
        const profName = this.characterData.profession?.name?.toLowerCase() || "";
        if (profName.includes("mago")) {
            return { spells: 5, rituals: 1, hexes: 1 };
        } else if (profName.includes("prete") || profName.includes("druido")) {
            return { invocations: 2, rituals: 2 };
        }
        return {};
    }

    _getStepMapping() {
        const isSpellcaster = this._isSpellcaster();
        if (isSpellcaster) {
            return {
                1: { type: "race", label: "WITCHER.Wizard.Step.Race.Title", icon: "fa-solid fa-person-rays" },
                2: { type: "background", label: "WITCHER.Wizard.Step.Background.Title", icon: "fa-solid fa-scroll" },
                3: { type: "profession", label: "WITCHER.Wizard.Step.Profession.Title", icon: "fa-solid fa-sword" },
                4: { type: "stats", label: "WITCHER.Wizard.Step.Stats.Title", icon: "fa-solid fa-chart-simple" },
                5: { type: "skills", label: "WITCHER.Wizard.Step.Skills.Title", icon: "fa-solid fa-book-open-reader" },
                6: { type: "magic", label: "WITCHER.Wizard.Step.Magic.Title", icon: "fa-solid fa-wand-magic-sparkles" },
                7: { type: "gear", label: "WITCHER.Wizard.Step.Gear.Title", icon: "fa-solid fa-bag-shopping" },
                8: { type: "finish", label: "WITCHER.Wizard.Step.Finalize.Title", icon: "fa-solid fa-check-double" }
            };
        } else {
            return {
                1: { type: "race", label: "WITCHER.Wizard.Step.Race.Title", icon: "fa-solid fa-person-rays" },
                2: { type: "background", label: "WITCHER.Wizard.Step.Background.Title", icon: "fa-solid fa-scroll" },
                3: { type: "profession", label: "WITCHER.Wizard.Step.Profession.Title", icon: "fa-solid fa-sword" },
                4: { type: "stats", label: "WITCHER.Wizard.Step.Stats.Title", icon: "fa-solid fa-chart-simple" },
                5: { type: "skills", label: "WITCHER.Wizard.Step.Skills.Title", icon: "fa-solid fa-book-open-reader" },
                6: { type: "gear", label: "WITCHER.Wizard.Step.Gear.Title", icon: "fa-solid fa-bag-shopping" },
                7: { type: "finish", label: "WITCHER.Wizard.Step.Finalize.Title", icon: "fa-solid fa-check-double" }
            };
        }
    }

    _getStepList() {
        const mapping = this._getStepMapping();
        const raceSelected = !!this.characterData.race;
        const professionSelected = !!this.characterData.profession;
        
        return Object.entries(mapping).map(([stepStr, info]) => {
            const stepNum = parseInt(stepStr);
            let disabled = false;
            if (!raceSelected && stepNum > 1) disabled = true;
            else if (!professionSelected && stepNum > 3) disabled = true;

            return {
                id: stepNum,
                number: stepNum,
                label: info.label,
                icon: info.icon,
                active: this.step === stepNum,
                complete: this.step > stepNum,
                disabled: disabled
            };
        });
    }

    _canGoToStep(step) {
        const mapping = this._getStepMapping();
        const targetType = mapping[step]?.type;
        const currentType = mapping[this.step]?.type;

        if (step > 1 && !this.characterData.race) {
            ui.notifications.warn("Seleziona una razza prima di proseguire.");
            return false;
        }
        if (step >= 3) {
            const missingGender = !this.characterData.gender;
            const missingHomeland = !this.characterData.homeland;
            if (missingGender || missingHomeland) {
                if (missingGender && missingHomeland) {
                    ui.notifications.warn("Seleziona genere e patria prima di proseguire.");
                } else if (missingGender) {
                    ui.notifications.warn("Seleziona il genere prima di proseguire.");
                } else {
                    ui.notifications.warn("Seleziona la patria prima di proseguire.");
                }
                return false;
            }
        }
        if (step >= 4 && !this.characterData.profession) {
            ui.notifications.warn("Seleziona una professione prima di proseguire.");
            return false;
        }

        // Validate leaving Magic step
        if (currentType === "magic" && step > this.step) {
            const limits = this._getMagicLimits();
            const selected = this.characterData.selectedMagic || [];
            
            const spellsCount = selected.filter(m => m.type === "spell" && ["Spells", "Mage"].includes(m.system?.class)).length;
            const ritualsCount = selected.filter(m => m.type === "ritual").length;
            const hexesCount = selected.filter(m => m.type === "hex").length;
            const invocationsCount = selected.filter(m => m.type === "spell" && m.system?.class === "Invocations").length;

            if (limits.spells && spellsCount !== limits.spells) {
                ui.notifications.warn(`Devi selezionare esattamente ${limits.spells} incantesimi novizio (selezionati: ${spellsCount}).`);
                return false;
            }
            if (limits.rituals && ritualsCount !== limits.rituals) {
                ui.notifications.warn(`Devi selezionare esattamente ${limits.rituals} rituali novizio (selezionati: ${ritualsCount}).`);
                return false;
            }
            if (limits.hexes && hexesCount !== limits.hexes) {
                ui.notifications.warn(`Devi selezionare esattamente ${limits.hexes} fatture novizio (selezionati: ${hexesCount}).`);
                return false;
            }
            if (limits.invocations && invocationsCount !== limits.invocations) {
                ui.notifications.warn(`Devi selezionare esattamente ${limits.invocations} invocazioni novizio (selezionati: ${invocationsCount}).`);
                return false;
            }
        }

        // Validate leaving Gear step or entering Finish step
        if (targetType === "finish" && this._isOverBudget(false)) {
            ui.notifications.warn("Non puoi proseguire: sei fuori budget per l'equipaggiamento!");
            return false;
        }

        return true;
    }

    _getTemplateForStep(step) {
        const mapping = this._getStepMapping();
        const type = mapping[step]?.type || "finish";
        return "systems/TheWitcherItaNewSystem/templates/app/wizard/steps/" + type + ".hbs";
    }

    _isWitcherName(name = "") {
        return name.toLowerCase().includes("witcher");
    }

    _isMagicRaceName(name = "") {
        const lower = name.toLowerCase();
        return lower.includes("umano") || lower.includes("umani") || lower.includes("elfo") || lower.includes("elfi");
    }

    _isMagicProfessionName(name = "") {
        const lower = name.toLowerCase();
        return lower.includes("mago") || lower.includes("prete");
    }

    _findRaceByName(name) {
        return this.races.find(r => (r.name || "").toLowerCase() === name.toLowerCase());
    }

    _findProfessionByName(name) {
        return this.professions.find(p => (p.name || "").toLowerCase() === name.toLowerCase());
    }

    _resetProfessionChoices() {
        this.characterData.skills = {};
        this.characterData.selectedProfessionGear = [];
        this.characterData.selectedCombatSkills = [];
        this.characterData.selectedBardLanguages = [];
    }

    _applyProfession(prof) {
        this._resetProfessionChoices();
        this.characterData.profession = prof;
        if (prof.img) this.characterData.img = prof.img;

        const names = this._getProfessionSkillNames();
        names.forEach(name => {
            const s = this._findSkillByKeyOrName(name);
            if (s && (this.characterData.skills[s._id] === undefined || this.characterData.skills[s._id] === 0)) {
                this.characterData.skills[s._id] = 1;
            }
        });

        this._updateNativeLanguage();
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

        html.find(".gear-list-filter").on("input", (event) => {
            const input = event.currentTarget;
            const category = input.dataset.category;
            this.gearFilterText[category] = input.value;
            this._applyGearFilters();
        });

        this._applyGearFilters();

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

    async _nextStep() { if (this.step < this.maxSteps && this._canGoToStep(this.step + 1)) { this.step++; this.render(true); } }
    async _prevStep() { if (this.step > 1) { this.step--; this.render(true); } }

    async _goToStep(event, target) { const step = parseInt(target.dataset.step); if (!this._canGoToStep(step)) return; this.step = step; this.render(true); }

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

    async _toggleMagicItem(event, target) {
        const id = target.dataset.itemId;
        const type = target.dataset.itemType;
        
        if (!this.characterData.selectedMagic) {
            this.characterData.selectedMagic = [];
        }

        const existingIdx = this.characterData.selectedMagic.findIndex(m => m.id === id);
        if (existingIdx !== -1) {
            this.characterData.selectedMagic.splice(existingIdx, 1);
            this.render(true);
            return;
        }

        const limits = this._getMagicLimits();
        const selected = this.characterData.selectedMagic;

        let fullDoc = null;
        if (type === "spell") {
            fullDoc = this.allSpells.find(d => d.id === id);
        } else if (type === "invocation") {
            fullDoc = this.allInvocations.find(d => d.id === id);
        } else if (type === "ritual") {
            fullDoc = this.allRituals.find(d => d.id === id);
        } else if (type === "hex") {
            fullDoc = this.allHexes.find(d => d.id === id);
        }

        if (!fullDoc) return;

        if (type === "spell") {
            const count = selected.filter(m => m.type === "spell" && ["Spells", "Mage"].includes(m.system?.class)).length;
            if (count >= (limits.spells || 0)) {
                ui.notifications.warn(`Hai già selezionato il numero massimo di incantesimi (${limits.spells}).`);
                return;
            }
        } else if (type === "invocation") {
            const count = selected.filter(m => m.type === "spell" && m.system?.class === "Invocations").length;
            if (count >= (limits.invocations || 0)) {
                ui.notifications.warn(`Hai già selezionato il numero massimo di invocazioni (${limits.invocations}).`);
                return;
            }
        } else if (type === "ritual") {
            const count = selected.filter(m => m.type === "ritual").length;
            if (count >= (limits.rituals || 0)) {
                ui.notifications.warn(`Hai già selezionato il numero massimo di rituali (${limits.rituals}).`);
                return;
            }
        } else if (type === "hex") {
            const count = selected.filter(m => m.type === "hex").length;
            if (count >= (limits.hexes || 0)) {
                ui.notifications.warn(`Hai già selezionato il numero massimo di fatture (${limits.hexes}).`);
                return;
            }
        }

        const cleanObj = fullDoc.toObject ? fullDoc.toObject() : fullDoc;
        cleanObj.id = cleanObj._id || cleanObj.id;
        this.characterData.selectedMagic.push(cleanObj);
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
        // Se non è stato selezionato un genere, generane uno casuale (male/female)
        if (!this.characterData.gender) {
            const genders = ["male", "female"];
            this.characterData.gender = genders[Math.floor(Math.random() * genders.length)];
        }
        this.render(true);
    }

    async _updateMoney(event, target) { this.characterData.money = parseInt(target.value); this.render(true); }
    
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

    _randomProfessionGear(event, target) {
        const profName = this.characterData.profession?.name;
        const gearConfig = this.constructor.PROFESSION_GEAR_MAP[profName];
        if (!gearConfig || !gearConfig.items?.length) {
            ui.notifications.warn("Nessuna dotazione casuale disponibile per questa professione.");
            return;
        }

        const searchPacks = [...(this.weapons || []), ...(this.armor || []), ...(this.gear || [])];
        const findItem = (name) => {
            const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return searchPacks.find(i => i.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanName));
        };

        const choices = gearConfig.items.map(name => {
            const item = findItem(name);
            return { id: item?.id || name, name };
        });

        const shuffled = choices.slice().sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, gearConfig.choose || 0).map(entry => entry.id);
        this.characterData.selectedProfessionGear = selected;
        this.render(true);
    }

    _switchSkillTab(event, target) { 
        this.activeSkillTab = target.dataset.tab; 
        this.render(true);
    }

    _toggleGnomeSkill(event, target) {
        const id = target.dataset.skillId;
        if (!this.characterData.gnomeSkills) this.characterData.gnomeSkills = [];
        
        const idx = this.characterData.gnomeSkills.indexOf(id);
        if (idx > -1) {
            this.characterData.gnomeSkills.splice(idx, 1);
        } else {
            if (this.characterData.gnomeSkills.length < 3) {
                this.characterData.gnomeSkills.push(id);
            } else {
                ui.notifications.warn("Puoi scegliere un massimo di 3 abilità di Manualità.");
            }
        }
        this.render(true);
    }

    async _selectRace(event, target) {
        const id = target.dataset.raceId;
        const race = this.races.find(r => r.id === id);
        if (race) { 
            this.characterData.race = race; 
            this.characterData.gnomeSkills = []; // Reset gnome skills choices on race change

            if (this._isWitcherName(race.name)) {
                const witcherProfession = this._findProfessionByName("Witcher");
                if (witcherProfession) this._applyProfession(witcherProfession);
            } else if (this.characterData.profession) {
                const profName = this.characterData.profession.name || "";
                if (this._isWitcherName(profName) || (this._isMagicProfessionName(profName) && !this._isMagicRaceName(race.name))) {
                    this.characterData.profession = null;
                    this._resetProfessionChoices();
                    ui.notifications.info("La professione selezionata non e compatibile con questa razza ed e stata rimossa.");
                }
            }

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
            if (this._isWitcherName(prof.name)) {
                const witcherRace = this._findRaceByName("Witcher");
                if (witcherRace) {
                    this.characterData.race = witcherRace;
                    this.characterData.gnomeSkills = [];
                    const limits = this._getAgeLimits();
                    this.characterData.age = Math.floor(Math.random() * (limits.max - limits.min + 1)) + limits.min;
                    this.characterData.name = this._getRandomFantasyName(witcherRace.name);
                }
            } else if (this.characterData.race && this._isWitcherName(this.characterData.race.name)) {
                ui.notifications.warn("La razza Witcher puo avere solo la professione Witcher.");
                return;
            }

            if (this._isMagicProfessionName(prof.name) && this.characterData.race && !this._isMagicRaceName(this.characterData.race.name)) {
                ui.notifications.warn("Solo Umani ed Elfi possono scegliere la professione del Mago o del Prete.");
                return;
            }

            this._applyProfession(prof);
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

    async _removePickupSkill(event, target) {
        const skillId = target.dataset.skill;
        if (skillId) {
            this.characterData.selectedPickupSkills = this.characterData.selectedPickupSkills.filter(id => id !== skillId);
            delete this.characterData.skills[skillId];
            this.render(true);
        }
    }

    async _removeCombatSkill(event, target) {
        const skillId = target.dataset.skill;
        if (skillId) {
            this.characterData.selectedCombatSkills = this.characterData.selectedCombatSkills.filter(id => id !== skillId);
            delete this.characterData.skills[skillId];
            this.render(true);
        }
    }

    async _addBardLanguage(event, target) {
        const skillKey = this.element.querySelector("select[name='new-bard-language']")?.value;
        if (!this.characterData.selectedBardLanguages) this.characterData.selectedBardLanguages = [];
        if (skillKey && !this.characterData.selectedBardLanguages.includes(skillKey)) {
            this.characterData.selectedBardLanguages.push(skillKey);
            this.characterData.skills[skillKey] = 1;
            this.render(true);
        }
    }

    async _removeBardLanguage(event, target) {
        const skillId = target.dataset.skill;
        if (skillId && this.characterData.selectedBardLanguages) {
            this.characterData.selectedBardLanguages = this.characterData.selectedBardLanguages.filter(id => id !== skillId);
            delete this.characterData.skills[skillId];
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
        // Randomly allocate remaining stat points
        const statsKeys = ["int", "ref", "dex", "body", "spd", "emp", "cra", "will", "luck"];
        let total = Object.values(this.characterData.stats).reduce((a, b) => a + Number(b), 0);
        let remaining = 60 - total;
        if (remaining <= 0) return;

        // Distribute remaining stat points randomly
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
            maxVal = 8;
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
        const body = Number(s.body) || 0;
        const will = Number(s.will) || 0;
        const spd = Number(s.spd) || 0;
        
        const base = Math.floor((body + will) / 2);
        const hpSta = base * 5;
        
        let vigor = 0;
        const profName = this.characterData.profession?.name?.toLowerCase() || "";
        if (profName.includes('witcher') || profName.includes('prete')) {
            vigor = 2;
        } else if (profName.includes('mago')) {
            vigor = 5;
        }

        const meleeBonus = Math.ceil((body - 6) / 2) * 2;
        const punchDmg = 1 * meleeBonus; // to keep number type check
        const kickDmg = 4 + meleeBonus;

        return { 
            hp: hpSta, 
            sta: hpSta, 
            rec: base, 
            stun: base,
            run: spd * 3, 
            leap: Math.floor((spd * 3) / 5), 
            enc: body * 10,
            vigor: vigor,
            meleeBonus: meleeBonus > 0 ? `+${meleeBonus}` : `${meleeBonus}`,
            punch: `1d6${meleeBonus > 0 ? '+'+meleeBonus : (meleeBonus < 0 ? meleeBonus : '')}`,
            kick: `1d6${kickDmg > 0 ? '+'+kickDmg : (kickDmg < 0 ? kickDmg : '')}`
        };
    }

    _getOriginCategory() {
        if (!this.characterData.homeland || !this.patriaList) return "Settentrionale";
        const patria = this.patriaList.find(p => p.patria === this.characterData.homeland);
        if (!patria) return "Settentrionale";

        if (patria.regione === "elder") return "Terre Antiche";
        if (patria.regione === "nilfgaard") return "Nilfgaardiana";
        return "Settentrionale";
    }

    async _rollAllBackground(event, target) {
        // Se non è stato selezionato un genere, generane uno casuale (male/female)
        if (!this.characterData.gender) {
            const genders = ["male", "female"];
            this.characterData.gender = genders[Math.floor(Math.random() * genders.length)];
        }
        if (!this.characterData.originRegion || !this.characterData.homeland) {
            if (this.patriaList && this.patriaList.length > 0) {
                const randomPatria = this.patriaList[Math.floor(Math.random() * this.patriaList.length)];
                this.characterData.originRegion = randomPatria.regione;
                this.characterData.homeland = randomPatria.patria;
                this._updateNativeLanguage();
            } else {
                ui.notifications.warn("Impossibile generare la patria: lista Patria non trovata.");
                return;
            }
        }

        const familyRoll = Math.floor(Math.random() * 10) + 1;
        if (familyRoll % 2 === 0) {
            this.characterData.background.familyState = "alive";
            this.characterData.background.familyFate = "";
            
            const parentsRoll = Math.floor(Math.random() * 10) + 1;
            if (parentsRoll % 2 === 0) {
                this.characterData.background.parentsState = "alive";
                this.characterData.background.parentsFate = "";
                await this._rollBackground(); 
            } else {
                this.characterData.background.parentsState = "something_happened";
                this.characterData.background.socialStatus = "";
                await this._rollParentsFate(); 
            }
        } else {
            this.characterData.background.familyState = "something_happened";
            this.characterData.background.parentsState = "";
            this.characterData.background.socialStatus = "";
            this.characterData.background.parentsFate = "";
            await this._rollFamilyFate(); 
        }

        this.characterData.background.events = [];
        const age = this.characterData.age || 20;
        const maxEvents = Math.floor((age - 20) / 10) + 1;
        
        for (let i = 0; i < maxEvents; i++) {
            await this._rollLifeEvents();
        }

        this.render(true);
    }

    async _rollAllSkills(event, target) {
        const isArmigero = this.characterData.profession?.name?.toLowerCase() === "armigero";
        if (isArmigero) {
            if (!this.characterData.selectedCombatSkills) this.characterData.selectedCombatSkills = [];
            const maxCombatSkills = 5;
            let combatRemaining = Math.max(0, maxCombatSkills - this.characterData.selectedCombatSkills.length);

            while (combatRemaining > 0) {
                const eligibleCombat = this.allSkills.filter(s =>
                    s.system?.isCombatSkill &&
                    !this.characterData.selectedCombatSkills.includes(s._id) &&
                    !this._getProfessionSkillNames().includes(s.name)
                );

                if (eligibleCombat.length === 0) break;

                const randomSkill = eligibleCombat[Math.floor(Math.random() * eligibleCombat.length)];
                this.characterData.selectedCombatSkills.push(randomSkill._id);
                this.characterData.skills[randomSkill._id] = 1;
                combatRemaining--;
            }
        }

        const isBardo = this.characterData.profession?.name?.toLowerCase() === "bardo";
        const isMercante = this.characterData.profession?.name?.toLowerCase() === "mercante";
        if (isBardo || isMercante) {
            if (!this.characterData.selectedBardLanguages) this.characterData.selectedBardLanguages = [];
            const maxLangs = isMercante ? 2 : 1;
            let langsRemaining = Math.max(0, maxLangs - this.characterData.selectedBardLanguages.length);
            const langKeys = ["commonspeech", "eldersp", "dwarven"];
            const validLangIds = langKeys.map(k => this._findSkillByKeyOrName(k)?._id).filter(Boolean);

            while (langsRemaining > 0) {
                const eligibleLangs = this.allSkills.filter(s =>
                    validLangIds.includes(s._id) &&
                    !this._isNativeLanguage(s.name) &&
                    !this.characterData.selectedBardLanguages.includes(s._id)
                );

                if (eligibleLangs.length === 0) break;

                const randomLang = eligibleLangs[Math.floor(Math.random() * eligibleLangs.length)];
                this.characterData.selectedBardLanguages.push(randomLang._id);
                this.characterData.skills[randomLang._id] = 1;
                langsRemaining--;
            }
        }

        // --- 1. Distribute Profession Skills ---
        const profSkills = this._getProfessionSkills();
        for (const s of profSkills) {
            if (s.isNativeLanguage) {
                this.characterData.skills[s.key] = 8;
            } else if (s.isDefining) {
                this.characterData.skills[s.key] = 1;
            } else {
                this.characterData.skills[s.key] = 1;
            }
        }

        let profPointsRemaining = this._calculateSkillPoints("profession");
        let safeCounter = 0;
        while (profPointsRemaining > 0 && safeCounter < 200) {
            safeCounter++;
            const currentProfSkills = this._getProfessionSkills();
            const upgradeable = currentProfSkills.filter(s => {
                const maxLevel = s.isNativeLanguage ? 8 : 6;
                return s.value < maxLevel && profPointsRemaining >= s.cost;
            });
            
            if (upgradeable.length === 0) break;
            
            const targetSkill = upgradeable[Math.floor(Math.random() * upgradeable.length)];
            const currentVal = this.characterData.skills[targetSkill.key] !== undefined ? this.characterData.skills[targetSkill.key] : (targetSkill.isNativeLanguage ? 8 : 1);
            this.characterData.skills[targetSkill.key] = currentVal + 1;
            profPointsRemaining -= targetSkill.cost;
        }

        // --- 2. Add 3 Pickup Skills ---
        this.characterData.selectedPickupSkills = [];
        for (const key in this.characterData.skills) {
            if (!profSkills.find(ps => ps.key === key)) {
                delete this.characterData.skills[key];
            }
        }

        let availablePickup = this._getAvailablePickupSkills();
        for (let i = 0; i < 3; i++) {
            if (availablePickup.length === 0) break;
            const randIndex = Math.floor(Math.random() * availablePickup.length);
            const picked = availablePickup[randIndex];
            this.characterData.selectedPickupSkills.push(picked.key);
            this.characterData.skills[picked.key] = picked.isNativeLanguage ? 8 : 0;
            availablePickup.splice(randIndex, 1);
        }

        // --- 3. Distribute Pickup Points ---
        let pickupPointsRemaining = this._calculateSkillPoints("pickup");
        safeCounter = 0;
        while (pickupPointsRemaining > 0 && safeCounter < 200) {
            safeCounter++;
            const currentPickupSkills = this._getPickupSkills();
            const upgradeable = currentPickupSkills.filter(s => {
                const maxLevel = s.isNativeLanguage ? 8 : 6;
                return s.value < maxLevel && pickupPointsRemaining >= s.cost;
            });

            if (upgradeable.length === 0) break;

            const targetSkill = upgradeable[Math.floor(Math.random() * upgradeable.length)];
            const currentVal = this.characterData.skills[targetSkill.key] !== undefined ? this.characterData.skills[targetSkill.key] : (targetSkill.isNativeLanguage ? 8 : 0);
            this.characterData.skills[targetSkill.key] = currentVal + 1;
            pickupPointsRemaining -= targetSkill.cost;
        }

        this.render(true);
    }

    _rollStartingGold(event, target) {
        const profName = this.characterData.profession?.name?.toLowerCase() || "";
        let multiplier = 0;
        
        for (const [key, val] of Object.entries(this.constructor.STARTING_GOLD_MULTIPLIER)) {
            if (profName.includes(key)) {
                multiplier = val;
                break;
            }
        }
        
        if (multiplier > 0) {
            const roll1 = Math.floor(Math.random() * 6) + 1;
            const roll2 = Math.floor(Math.random() * 6) + 1;
            this.characterData.money = (roll1 + roll2) * multiplier;
            this.startingGoldRolled = true;
            this.render(true);
            ui.notifications.info(`Hai tirato ${roll1} e ${roll2}. (Somma: ${roll1+roll2}) x ${multiplier} = ${this.characterData.money} Corone.`);
        } else {
            ui.notifications.warn("Seleziona una professione valida per calcolare le Corone iniziali.");
        }
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
        if (idx > -1) {
            this.characterData.gear.splice(idx, 1);
        } else {
            const src = type === "weapon" ? this.weapons : (type === "armor" ? this.armor : this.gear);
            const item = src.find(i => i.id === id || i._id === id);
            if (item) {
                const cost = Number(item.system?.cost?.value || item.system?.cost || 0);
                const currentCost = this.characterData.gear.reduce((acc, g) => acc + Number(g.system?.cost?.value || g.system?.cost || 0), 0);
                const budget = Number(this.characterData.money) || 0;
                if (currentCost + cost > budget) {
                    ui.notifications.warn("Il costo totale supera le Corone possedute. Rimuovi un oggetto o aumenta il budget prima di aggiungere questo elemento.");
                    return;
                }
                this.characterData.gear.push(item.toObject ? item.toObject() : item);
            }
        }
        this.render(true);
    }

    _removeGear(event, target) {
        event?.preventDefault?.();
        event?.stopPropagation?.();

        const id = target.dataset.itemId;
        if (!id) return;

        const idx = this.characterData.gear.findIndex(g => g.id === id || g._id === id);
        if (idx > -1) {
            this.characterData.gear.splice(idx, 1);
            this.render(true);
        }
    }

    _toggleGearCategory(event, target) {
        const category = target.dataset.category;
        if (!category || !(category in this.gearCategoryVisibility)) return;
        this.gearCategoryVisibility[category] = !this.gearCategoryVisibility[category];
        this.render(true);
    }

    _applyGearFilters() {
        if (!this.element) return;
        Object.entries(this.gearFilterText).forEach(([category, query]) => {
            const normalized = (query || "").toLowerCase();
            const items = this.element.querySelectorAll(`.gear-category[data-category="${category}"] .gear-item`);
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(normalized) ? "" : "none";
            });
        });
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
        this._updateNativeLanguage();
        
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

        const purchasedGearCost = this.characterData.gear.reduce((acc, item) => {
            return acc + Number(item.system?.cost?.value || item.system?.cost || 0);
        }, 0);
        const remainingCrowns = Math.max(0, (Number(this.characterData.money) || 0) - purchasedGearCost);

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
                    socialStanding: "",
                    homeland: {
                        value: this.characterData.homeland || ""
                    },
                    background: {
                        value: bgHtml
                    },
                    lifeEvents: {}
                },
                currency: {
                    crown: remainingCrowns
                }
            }
        };

        // Auto-calculate social standing based on race and homeland
        if (this.characterData.race && this.characterData.race.system && this.characterData.race.system.socialStanding) {
            const hl = this.characterData.homeland;
            if (hl === "skellige") actorData.system.general.socialStanding = this.characterData.race.system.socialStanding.skellige || "";
            else if (hl === "mahakam") actorData.system.general.socialStanding = this.characterData.race.system.socialStanding.mahakam || "";
            else if (hl === "dolblathanna") actorData.system.general.socialStanding = this.characterData.race.system.socialStanding.dolBlathanna || "";
            else if (this.characterData.originRegion === "nilfgaard") actorData.system.general.socialStanding = this.characterData.race.system.socialStanding.nilfgaard || "";
            else actorData.system.general.socialStanding = this.characterData.race.system.socialStanding.north || "";
        }

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

        const derived = this._calculateDerivedStats();
        const intVal = Number(this.characterData.stats.int) || 0;
        const willVal = Number(this.characterData.stats.will) || 0;
        const resolveVal = (willVal + intVal) * 5;
        const focusVal = (willVal + intVal) * 3;

        actorData.system.derivedStats = {
            hp: {
                value: derived.hp,
                unmodifiedMax: derived.hp,
                max: derived.hp
            },
            sta: {
                value: derived.sta,
                unmodifiedMax: derived.sta,
                max: derived.sta
            },
            rec: {
                value: derived.rec,
                unmodifiedMax: derived.rec,
                max: derived.rec
            },
            stun: {
                value: derived.stun,
                unmodifiedMax: derived.stun,
                max: derived.stun
            },
            run: {
                value: derived.run,
                unmodifiedMax: derived.run,
                max: derived.run
            },
            leap: {
                value: derived.leap,
                unmodifiedMax: derived.leap,
                max: derived.leap
            },
            enc: {
                value: 0,
                unmodifiedMax: derived.enc,
                max: derived.enc
            },
            vigor: {
                value: derived.vigor,
                unmodifiedMax: derived.vigor,
                max: derived.vigor
            },
            woundTreshold: {
                value: derived.rec,
                unmodifiedMax: derived.rec,
                max: derived.rec
            },
            resolve: {
                value: resolveVal,
                unmodifiedMax: resolveVal,
                max: resolveVal
            },
            focus: {
                value: focusVal,
                unmodifiedMax: focusVal,
                max: focusVal
            }
        };

        // 3. Create Actor
        console.log("TheWitcherItaNewSystem | Wizard | Creating Actor:", actorData);
        const actor = await Actor.create(actorData);
        
        // 4. Add Embedded Items
        // Homeland Bonus
        let homelandBonusSkillName = null;
        let homelandBonusValue = 0;
        if (this.characterData.homeland && this.patriaList) {
            const p = this.patriaList.find(x => x.patria === this.characterData.homeland);
            if (p) {
                homelandBonusSkillName = p.abilita;
                homelandBonusValue = parseInt(p.bonus.replace('+','')) || 1;
            }
        }
        if (homelandBonusSkillName) {
            const skillItem = this.allSkills.find(s => s.name.toLowerCase() === homelandBonusSkillName.toLowerCase());
            const finalName = skillItem ? skillItem._id : homelandBonusSkillName;
            this.characterData.skills[finalName] = (this.characterData.skills[finalName] || 0) + homelandBonusValue;
        }

        const raceItemsToCreate = [];
        const itemsToCreate = [];

        if (this.characterData.race) {
            let rData = this.characterData.race.toObject ? this.characterData.race.toObject() : this.characterData.race;
            const { _id, id, ...rClean } = rData;
            const r = foundry.utils.deepClone(rClean);
            
            if (r.name === "Gnomo" && this.characterData.gnomeSkills?.length > 0) {
                if (r.system.perk2) {
                    if (!r.system.perk2.modifiers) r.system.perk2.modifiers = [];
                    this.characterData.gnomeSkills.forEach(skillId => {
                        r.system.perk2.modifiers.push({ target: skillId, value: 2 });
                    });
                }
            }

            raceItemsToCreate.push(r);
        }

        if (raceItemsToCreate.length > 0) {
            await actor.createEmbeddedDocuments("Item", raceItemsToCreate);
        }

        if (this.characterData.profession) {
            let pData = this.characterData.profession.toObject ? this.characterData.profession.toObject() : this.characterData.profession;
            const { _id, id, ...pClean } = pData;
            const p = foundry.utils.deepClone(pClean);
            
            // Apply defining skill level if present
            if (this.characterData.skills["definingSkill"] !== undefined && p.system.definingSkill) {
                p.system.definingSkill.level = this.characterData.skills["definingSkill"];
            }
            
            itemsToCreate.push(p);
        }

        if (this.characterData.gear.length > 0) {
            const gearArr = this.characterData.gear.map(g => {
                let gData = g.toObject ? g.toObject() : g;
                const { _id, id, ...gClean } = gData;
                return foundry.utils.deepClone(gClean);
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
                    let iData = item.toObject ? item.toObject() : item;
                    const { _id, id, ...iClean } = iData;
                    const cloned = foundry.utils.deepClone(iClean);
                    itemsToCreate.push(cloned);
                }
            }

            // Selected items
            for (const id of this.characterData.selectedProfessionGear) {
                const item = findItem(id);
                if (item) {
                    let iData = item.toObject ? item.toObject() : item;
                    const { _id, id, ...iClean } = iData;
                    const cloned = foundry.utils.deepClone(iClean);
                    itemsToCreate.push(cloned);
                }
            }
        }

        if (this.characterData.selectedMagic && this.characterData.selectedMagic.length > 0) {
            const magicArr = this.characterData.selectedMagic.map(m => {
                let mData = m.toObject ? m.toObject() : m;
                const { _id, id, ...mClean } = mData;
                return foundry.utils.deepClone(mClean);
            });
            itemsToCreate.push(...magicArr);
        }

        if (itemsToCreate.length > 0) {
            await actor.createEmbeddedDocuments("Item", itemsToCreate);
        }

        await this._applyWizardSkillsToActor(actor);

        ui.notifications.info(`${name} creato con successo!`);
        this.close();
        if (actor.sheet) actor.sheet.render(true);
    }
}
