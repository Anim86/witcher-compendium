const fs = require('fs');
const filepath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TheWitcherItaNewSystem/module/app/WitcherCharacterWizard.js';
let js = fs.readFileSync(filepath, 'utf8');

// 1. Add mappings and update ACTIONS
const gearMap = `
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
`;

// Insert gearMap before ACTIONS
js = js.replace('static ACTIONS = {', gearMap + '\n    static ACTIONS = {');

// Update ACTIONS to include toggleProfessionGear
js = js.replace('switchSkillTab: function(event, target) { this._switchSkillTab(event, target); }', 
               'switchSkillTab: function(event, target) { this._switchSkillTab(event, target); },\n        toggleProfessionGear: function(event, target) { this._toggleProfessionGear(event, target); }');

// Update constructor for selectedProfessionGear
js = js.replace('money: 0', 'money: 0,\n            selectedProfessionGear: []');

// Update _prepareContext to include profession gear logic
const prepareContextNew = `
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
`;

js = js.replace('// 2. Load Gear', prepareContextNew + '\n            // 2. Load Gear');

// Pass new data to return object in _prepareContext
js = js.replace('gearCost: gearCost,', `gearCost: gearCost,
                professionGearList: professionGearList,
                professionGearRemaining: professionGearRemaining,
                professionGearChoose: gearConfig?.choose || 0,`);

// Add _toggleProfessionGear method
const toggleGearMethod = `
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
                ui.notifications.warn(\`Puoi scegliere solo \${gearConfig.choose} oggetti per la tua dotazione.\`);
            }
        }
        this.render(true);
    }
`;

js = js.replace('_switchSkillTab(event, target) {', toggleGearMethod + '\n    _switchSkillTab(event, target) {');

// Update _selectProfession to reset selectedProfessionGear and pre-select first 5
const selectProfUpdate = `
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
`;

js = js.replace('this.characterData.selectedPickupSkills = [];', 'this.characterData.selectedProfessionGear = [];\n            ' + selectProfUpdate);

// Update _finish to include professional gear
const finishUpdate = `
        // Add selected profession gear
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
`;

js = js.replace('itemsToCreate.push(...gearArr);', 'itemsToCreate.push(...gearArr);\n\n        ' + finishUpdate);

fs.writeFileSync(filepath, js);
console.log('Done script');
