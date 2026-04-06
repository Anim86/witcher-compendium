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
            homeland: null,
            background: {
                socialStatus: "",
                family: "",
                events: []
            },
            profession: null,
            stats: {
                int: 0, ref: 0, dex: 0, body: 0, spd: 0, emp: 0, cra: 0, will: 0, luck: 0
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
        navigation: { template: "systems/TheWitcherTRPG/templates/app/wizard/navigation.hbs" },
        content: { template: "systems/TheWitcherTRPG/templates/app/wizard/content.hbs" },
        footer: { template: "systems/TheWitcherTRPG/templates/app/wizard/footer.hbs" }
    };

    /* -------------------------------------------- */
    /*  Data Preparation                            */
    /* -------------------------------------------- */

    async _prepareContext(options) {
        // Load Compendiums if not already loaded
        if (this.races.length === 0) {
            const racePack = game.packs.get("witcher-compendium.witcher-races");
            const docs = racePack ? await racePack.getDocuments() : [];
            // Deduplicate by name and ID
            const unique = new Map();
            docs.forEach(d => unique.set(d.name, d));
            this.races = Array.from(unique.values());
        }
        if (this.professions.length === 0) {
            const profPack = game.packs.get("witcher-compendium.witcher-professions");
            const docs = profPack ? await profPack.getDocuments() : [];
            // Deduplicate by name and ID
            const unique = new Map();
            docs.forEach(d => unique.set(d.name, d));
            this.professions = Array.from(unique.values());
        }
        
        // Load Gear Packs
        if (!this.weapons) {
            const weaponPack = game.packs.get("witcher-compendium.witcher-weapons");
            this.weapons = weaponPack ? await weaponPack.getDocuments() : [];
            const armorPack = game.packs.get("witcher-compendium.witcher-armor");
            this.armor = armorPack ? await armorPack.getDocuments() : [];
            const gearPack = game.packs.get("witcher-compendium.witcher-equipment");
            this.gear = gearPack ? await gearPack.getDocuments() : [];
        }

        // Load Skill Compendium (Explicit for Wizard)
        if (Object.keys(this.characterData.skills).length === 0 && !this.allSkills) {
            const skillPack = game.packs.get("witcher-compendium.witcher-skills");
            if (skillPack) {
                this.allSkills = await skillPack.getDocuments();
                console.log("TheWitcherTRPG | Loaded skills from compendium:", this.allSkills.length);
            }
        }

        // Calculate Points
        const statsTotal = Object.values(this.characterData.stats).reduce((a, b) => a + b, 0);
        const statsRemaining = 60 - statsTotal;

        const stats = {};
        for (const [key, statDef] of Object.entries(CONFIG.WITCHER.statMap)) {
            if (statDef.origin === "stats") {
                stats[key] = {
                    label: statDef.labelShort || statDef.label,
                    value: this.characterData.stats[key] || 0
                };
            }
        }

        // Transform CONFIG objects into arrays for the template with robust fallbacks
        const homelandsMap = CONFIG.WITCHER.homelands || {
            "Aedirn": "Aedirn", "Cidaris": "Cidaris", "Cintra": "Cintra", "Kaedwen": "Kaedwen", 
            "Lyria": "Lyria", "Nilfgaard": "Nilfgaard", "Redania": "Redania", "Skellige": "Skellige", 
            "Temeria": "Temeria", "Verden": "Verden"
        };
        const socialStandingMap = CONFIG.WITCHER.socialStanding || {
            "Equal": "Paritario", "Tolerated": "Tollerato", "Oppressed": "Oppresso", "Hated": "Odiato"
        };

        const homelands = Object.entries(homelandsMap).map(([value, label]) => ({ value, label }));
        const socialStandings = Object.entries(socialStandingMap).map(([value, label]) => ({ value, label }));



        // Sanitize Gear for V13 DataModel Validation
        const sanitizeItem = (i) => {
            const obj = i.toObject();
            if (obj.system && (obj.system.reliability === null || obj.system.reliability === undefined)) {
                obj.system.reliability = 0;
            }
            return {
                ...obj,
                selected: this.characterData.gear.some(g => g._id === i._id)
            };
        };

        return {
            step: this.step,
            maxSteps: this.maxSteps,
            steps: this._getStepList(),
            character: this.characterData,
            races: this.races,
            professions: this.professions,
            stats: stats,
            homelands: homelands,
            socialStandings: socialStandings,
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
            selectedGear: this.characterData.gear
        };
    }



    _calculateDerivedStats() {
        const stats = this.characterData.stats;
        const resValue = Math.floor((stats.body + stats.will) / 2);
        const res = Math.max(10, resValue * 5);
        const rec = Math.floor(res / 5);

        return {
            hp: res,
            sta: res,
            rec: rec,
            stun: rec,
            run: stats.spd * 3,
            leap: Math.floor((stats.spd * 3) / 5),
            enc: stats.body * 10
        };
    }

    _getProfessionSkills() {
        if (!this.characterData.profession) return {};
        const profSkills = this.characterData.profession.system?.skills || {};
        const skills = {};
        for (const [key, skillData] of Object.entries(profSkills)) {
            const skillConfig = CONFIG.WITCHER.skillMap[key] || {};
            const cost = skillConfig.cost !== undefined ? skillConfig.cost : 1;
            skills[key] = {
                label: skillConfig.label || key,
                value: this.characterData.skills[key] || 0,
                cost: cost
            };
        }
        return skills;
    }

    _getPickupSkills() {
        const profSkills = this.characterData.profession?.system?.skills ? Object.keys(this.characterData.profession.system.skills) : [];
        const skills = {};
        const skillMap = CONFIG.WITCHER.skillMap || {};
        for (const [key, skill] of Object.entries(skillMap)) {
            if (!profSkills.includes(key)) {
                const skillConfig = CONFIG.WITCHER.skillMap[key] || {};
                const cost = skillConfig.cost !== undefined ? skillConfig.cost : 1;
                skills[key] = {
                    label: skillConfig.label || key,
                    value: this.characterData.skills[key] || 0,
                    cost: cost,
                    isProfession: false
                };
            }
        }
        return skills;
    }

    _calculateSkillPoints(type) {
        if (type === "profession") {
            const spent = Object.values(this._getProfessionSkills()).reduce((a, b) => a + (b.value * b.cost), 0);
            return 44 - spent;
        } else {
            const stats = this.characterData.stats;
            const totalAvailable = (stats.int || 0) + (stats.ref || 0);
            const spent = Object.values(this._getPickupSkills()).reduce((a, b) => a + (b.value * b.cost), 0);
            return totalAvailable - spent;
        }
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
        const templates = {
            1: "systems/TheWitcherTRPG/templates/app/wizard/steps/race.hbs",
            2: "systems/TheWitcherTRPG/templates/app/wizard/steps/background.hbs",
            3: "systems/TheWitcherTRPG/templates/app/wizard/steps/profession.hbs",
            4: "systems/TheWitcherTRPG/templates/app/wizard/steps/stats.hbs",
            5: "systems/TheWitcherTRPG/templates/app/wizard/steps/skills.hbs",
            6: "systems/TheWitcherTRPG/templates/app/wizard/steps/gear.hbs",
            7: "systems/TheWitcherTRPG/templates/app/wizard/steps/finish.hbs"
        };
        return templates[step];
    }

    _onRender(context, options) {
        super._onRender(context, options);
        
        // Robust Scroll Position Restoration
        if (this._scrollPos !== undefined) {
             const content = this.element.querySelector(".wizard-content");
             if (content) {
                 // Double frame delay to ensure template partial animation/render finished
                 requestAnimationFrame(() => {
                     requestAnimationFrame(() => {
                         content.scrollTop = this._scrollPos;
                         console.log("TheWitcherTRPG | Restored scroll to", this._scrollPos);
                     });
                 });
             }
        }

        // Manual Action Delegation (Robust V13)
        const html = $(this.element);
        
        const saveScroll = () => {
            this._scrollPos = this.element.querySelector(".witcher-wizard-content")?.scrollTop || 0;
            console.log("TheWitcherTRPG | Saved scroll", this._scrollPos);
        };

        // Click handlers (Buttons, Links)
        html.find("[data-action]").not("select, input[type='text'], input[type='number'], textarea").on("click", (event) => {
            const action = event.currentTarget.dataset.action;
            const handler = this.constructor.ACTIONS[action];
            if (handler) {
                saveScroll();
                handler.call(this, event, event.currentTarget);
            }
        });

        // Change handlers (Selects, Inputs)
        html.find("select[data-action], input[data-action]").on("change", (event) => {
            const action = event.currentTarget.dataset.action;
            const handler = this.constructor.ACTIONS[action];
            if (handler) {
                saveScroll();
                handler.call(this, event, event.currentTarget);
            }
        });
    }

    /* -------------------------------------------- */
    /*  Action Handlers                             */
    /* -------------------------------------------- */

    async _nextStep(event, target) {
        console.log("TheWitcherTRPG | Wizard Next Step", this.step);
        if (this.step < this.maxSteps) {
            this.step++;
            this.render(true);
        }
    }

    async _prevStep(event, target) {
        console.log("TheWitcherTRPG | Wizard Prev Step", this.step);
        if (this.step > 1) {
            this.step--;
            this.render(true);
        }
    }

    async _goToStep(event, target) {
        const targetStep = parseInt(target.dataset.step);
        if (isNaN(targetStep)) return;
        
        // Validation: can only skip back freely, or skip forward if prerequisites met
        if (targetStep < this.step) {
            this.step = targetStep;
            this.render(true);
        } else if (targetStep > this.step) {
            // Forward validation
            if (this.step === 1 && !this.characterData.race) return ui.notifications.warn("Scegli prima una razza.");
            if (this.step === 3 && !this.characterData.profession) return ui.notifications.warn("Scegli prima una professione.");
            
            this.step = targetStep;
            this.render(true);
        }
    }

    async _selectRace(event, target) {
        const raceId = target.dataset.raceId;
        console.log("TheWitcherTRPG | Selecting Race:", raceId);
        const race = this.races.find(r => r.id === raceId);
        if (race) {
            this.characterData.race = race.toObject();
            this.characterData.race._id = raceId; 
            // Default image if none set
            if (!this.characterData.img) this.characterData.img = race.img;
            this.render(true);
        }
    }

    _adjustStat(event, target) {
        const stat = target.dataset.stat;
        const delta = parseInt(target.dataset.delta || 0);
        let next;
        
        if (event.type === "change") {
            next = parseInt(target.value);
        } else {
            const current = this.characterData.stats[stat] || 0;
            next = current + delta;
        }

        // Validation: 1-10
        next = Math.max(1, Math.min(10, next));
        
        // Point Buy: 60 points total
        const currentInState = this.characterData.stats[stat] || 0;
        const total = Object.values(this.characterData.stats).reduce((a, b) => a + b, 0) - currentInState + next;
        
        if (total <= 60) {
            this.characterData.stats[stat] = next;
            this.render(true);
        } else {
            ui.notifications.warn("Hai superato i punti statistica disponibili (60).");
            this.render(true); // Reset to valid value
        }
    }

    _adjustSkill(event, target) {
        const skill = target.dataset.skill;
        const delta = parseInt(target.dataset.delta || 0);
        let next;

        if (event.type === "change") {
            next = parseInt(target.value);
        } else {
            const current = this.characterData.skills[skill] || 0;
            next = current + delta;
        }
        
        this.characterData.skills[skill] = Math.max(0, Math.min(10, next));
        this.render(true);
    }

    async _selectProfession(event, target) {
        const profId = target.dataset.profId;
        console.log("TheWitcherTRPG | Selecting Profession (ID):", profId);
        const prof = this.professions.find(p => p.id === profId || p._id === profId);
        if (prof) {
            this.characterData.profession = prof.toObject();
            this.characterData.profession._id = profId; 
            
            // Auto-initialize profession skills at 1
            this.characterData.skills = {};
            if (prof.system.skills) {
                Object.keys(prof.system.skills).forEach(s => {
                    this.characterData.skills[s] = 1;
                });
            }
            this.render(true);
        }
    }



    async _updateAge(event, target) {
        let age = parseInt(target.value);
        if (isNaN(age)) age = 25;
        this.characterData.age = age;
        console.log("TheWitcherTRPG | Wizard Update Age", age);
        this.render(true);
    }

    async _updateBackground(event, target) {
        const name = target.name.split(".").pop();
        this.characterData.background[name] = target.value;
        this.render(true);
    }

    async _rollBackground(event, target) {
        const socialTable = await this._findTable(["Social Standing", "Stato Sociale", "Sociale"]);
        const familyTable = await this._findTable(["Family Fate", "Destino della Famiglia", "Famiglia"]);
        
        let message = `<h2>${game.i18n.localize("WITCHER.Wizard.Step.Background.Title")}</h2>`;

        if (socialTable) {
            const roll = await socialTable.roll();
            const result = roll.results[0];
            this.characterData.background.socialStatus = result.text || result.name;
            message += `<p><strong>${game.i18n.localize("WITCHER.Wizard.Background.SocialStatus")}:</strong> ${this.characterData.background.socialStatus}</p>`;
        }
        
        if (familyTable) {
            const roll = await familyTable.roll();
            const result = roll.results[0];
            this.characterData.background.familyFate = result.text || result.name;
            message += `<p><strong>${game.i18n.localize("WITCHER.Wizard.Background.FamilyFate")}:</strong> ${this.characterData.background.familyFate}</p>`;
        }

        ui.notifications.info("Roll completato! Controlla la chat.");
        ChatMessage.create({ content: message, speaker: ChatMessage.getSpeaker() });
        this.render(true);
    }

    async _rollLifeEvents(event, target) {
        if (!this.characterData.age) return ui.notifications.warn("Imposta prima l'età.");

        const yearsToRoll = Math.max(0, Math.floor((this.characterData.age - 10) / 10));
        this.characterData.background.events = [];
        
        const table = await this._findTable(["Life Events", "Eventi della Vita", "Eventi", "Life", "Events"]);
        
        // Simple translation map for common English results
        const translate = (text) => {
            const tableMap = {
                "Fortune or Misfortune": "Fortuna o Sfortuna",
                "Make a Friend": "Fatto un Amico",
                "Make an Enemy": "Fatto un Nemico",
                "Romantic Tragedy": "Tragedia Romantica",
                "Work": "Lavoro",
                "You found a friend": "Hai trovato un amico",
                "You made an enemy": "Ti sei fatto un nemico",
                "Tragic loss": "Perdita tragica",
                "A windfall": "Un colpo di fortuna"
            };
            for (let [en, it] of Object.entries(tableMap)) {
                if (text.includes(en)) return text.replace(en, it);
            }
            return text;
        };

        if (table) {
            let message = `<h2>${game.i18n.localize("WITCHER.Wizard.Background.LifeEvents")}</h2><ul>`;
            for (let i = 0; i < yearsToRoll; i++) {
                const roll = await table.roll();
                const result = roll.results[0];
                const rawText = result.text || result.name;
                const eventData = {
                    age: 10 + (i * 10),
                    text: translate(rawText)
                };
                this.characterData.background.events.push(eventData);
                message += `<li><strong>Età ${eventData.age}:</strong> ${eventData.text}</li>`;
            }
            message += "</ul>";
            ui.notifications.info("Eventi della vita generati in chat.");
            ChatMessage.create({ content: message, speaker: ChatMessage.getSpeaker() });
            this.render(true);
        } else {
            ui.notifications.error("Tabella Eventi della Vita non trovata.");
        }
    }

    _updateHomeland(event, target) {
        this.characterData.homeland = target.value;
        this.render(true);
    }

    _toggleGear(event, target) {
        const itemId = target.dataset.itemId;
        const itemType = target.dataset.itemType;
        
        const existingIndex = this.characterData.gear.findIndex(g => g._id === itemId);
        if (existingIndex > -1) {
            this.characterData.gear.splice(existingIndex, 1);
        } else {
            let source = [];
            if (itemType === "weapon") source = this.weapons;
            else if (itemType === "armor") source = this.armor;
            else source = this.gear;

            const item = source.find(i => i._id === itemId);
            if (item) this.characterData.gear.push(item.toObject());
        }
        this.render(true);
    }

    async _findTable(hints) {
        // 1. Search in world
        for (const hint of hints) {
            const table = game.tables.find(t => t.name.toLowerCase().includes(hint.toLowerCase()));
            if (table) return table;
        }

        // 2. Search in common Witcher TRPG packs (italiano prima)
        const packsToSearch = [
            "witcher-compendium.witcher-tables", // Potenziale pack it del modulo
            "TheWitcherTRPG.Life_Event_Sub-tables",
            "TheWitcherTRPG.Character-gen",
            "TheWitcherTRPG.Character-gen_Sub-tables",
            "TheWitcherTRPG.Witcher_Lifepath_and_BG_Sub-tables"
        ];

        for (const packId of packsToSearch) {
            const pack = game.packs.get(packId);
            if (!pack) continue;
            
            const index = await pack.getIndex();
            // Cerca match esatto in italiano o inglese
            for (const hint of hints) {
                const entry = index.find(e => e.name.toLowerCase() === hint.toLowerCase() || e.name.toLowerCase().includes(hint.toLowerCase()));
                if (entry) {
                    console.log(`TheWitcherTRPG | Found table ${entry.name} in pack ${packId}`);
                    return await pack.getDocument(entry._id);
                }
            }
        }
        return null;
    }

    async _selectAvatar(event, target) {
        new FilePicker({
            type: "image",
            current: this.characterData.img,
            callback: (path) => {
                this.characterData.img = path;
                this.render(true);
            }
        }).browse();
    }

    async _finish(event, target) {
        // Final name capture from the input in the Finish step
        const nameInput = this.element.querySelector("input[name='name']");
        if (nameInput) this.characterData.name = nameInput.value || "New Hero";

        // Initialize COMPLETE actorData for the system's DataModel
        const actorData = {
            name: this.characterData.name,
            type: "character",
            img: this.characterData.img || this.characterData.race?.img || "icons/svg/mystery-man.svg",
            system: {
                stats: {},
                derivedStats: {},
                details: {
                    race: this.characterData.race?.name || "",
                    profession: this.characterData.profession?.name || "",
                    homeland: this.characterData.homeland || "",
                    socialStanding: this.characterData.background.socialStatus || "",
                    age: this.characterData.age || 20
                },
                notes: [{ 
                    title: "Background", 
                    value: `Famiglia: ${this.characterData.background.familyFate}\n` + 
                           `Eventi: ${this.characterData.background.events.map(e => `[Età ${e.age}] ${e.text}`).join("\n")}`
                }]
            }
        };

        // 1. Initialize Stats with FULL structure to avoid migration errors
        for (const [key, statDef] of Object.entries(CONFIG.WITCHER.statMap)) {
            if (statDef.origin === "stats") {
                actorData.system.stats[key] = {
                    value: this.characterData.stats[key] || 0,
                    unmodifiedMax: this.characterData.stats[key] || 0,
                    max: this.characterData.stats[key] || 0,
                    label: statDef.labelShort || statDef.label,
                    modifiers: [],
                    totalModifiers: 0
                };
            } else if (statDef.origin === "derivedStats") {
                actorData.system.derivedStats[key] = {
                    value: 0,
                    unmodifiedMax: 0,
                    max: 0,
                    label: statDef.labelShort || statDef.label,
                    modifiers: [],
                    totalModifiers: 0
                };
            }
        }

        // 2. Initialize Skills structure
        actorData.system.skills = {};
        
        // Get all possible skills from config to ensure complete structure
        for (const [skillKey, skillDef] of Object.entries(CONFIG.WITCHER.skillMap)) {
            const attr = skillDef.attribute.name; // e.g. int, ref
            const skillName = skillDef.name; // e.g. awareness, commonsp
            
            if (!actorData.system.skills[attr]) actorData.system.skills[attr] = {};
            
            const value = this.characterData.skills[skillKey] || 0;
            const profSkills = this.characterData.profession?.system?.skills ? Object.keys(this.characterData.profession.system.skills) : [];
            const isProf = profSkills.includes(skillKey);
            
            // The DataModel expects 'skillName' as the key (e.g. commonsp, eldersp)
            actorData.system.skills[attr][skillName] = {
                value: value,
                isProfession: isProf,
                isPickup: !isProf && value > 0,
                label: skillDef.label
            };
        }

        // 3. Create Actor
        console.log("TheWitcherTRPG | Creating Actor with full data:", actorData);
        const actor = await Actor.create(actorData);
        
        // 4. Add Race and Profession Items (linked, to grant perks)
        const itemsToAdd = [];
        if (this.characterData.race) {
            const item = foundry.utils.deepClone(this.characterData.race);
            delete item._id;
            itemsToAdd.push(item);
        }
        if (this.characterData.profession) {
            const item = foundry.utils.deepClone(this.characterData.profession);
            delete item._id;
            itemsToAdd.push(item);
        }
        
        if (itemsToAdd.length > 0) {
            await actor.createEmbeddedDocuments("Item", itemsToAdd);
        }

        // 5. Add Gear
        if (this.characterData.gear.length > 0) {
            await actor.createEmbeddedDocuments("Item", this.characterData.gear);
        }

        ui.notifications.info(`${this.characterData.name} created successfully!`);
        this.close();
        if (actor.sheet) actor.sheet.render(true);
    }
}
