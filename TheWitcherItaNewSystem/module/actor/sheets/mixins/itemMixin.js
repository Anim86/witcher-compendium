import { WITCHER } from '../../../setup/config.js';
import WitcherItem from '../../../item/witcherItem.js';

export let itemMixin = {
    async _onDropItem(event, item) {
        if (!this.actor.isOwner) return false;

        //TODO remove when everything is v2
        if (!(item instanceof WitcherItem)) {
            const itemConverter = await Item.implementation.fromDropData(item);
            item = itemConverter.toObject();
        }

        // Handle item sorting within the same Actor
        if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, item);

        if (this._isUniqueItem(item)) {
            await this.actor.removeItemsOfType(item.type);
        }

        if (item.type === 'weapon' && this.actor.type === 'monster') {
            item.system.equipped = true;
        } else if (item.type === 'profession') {
            let allSkills = Object.keys(this.actor.system.skills).reduce((collectedAttr, attr) => {
                return {
                    ...collectedAttr,
                    ...Object.keys(this.actor.system.skills[attr]).reduce((collectedSkills, skill) => {
                        return {
                            ...collectedSkills,
                            [`system.skills.${attr}.${skill}.isProfession`]: false
                        };
                    }, {})
                };
            }, {});

            await this.actor.update(allSkills);

            let delta = {};
            item.system.professionSkills.forEach(profSkill => {
                //find skill
                let attr = Object.keys(this.actor.system.skills).find(attr =>
                    Object.keys(this.actor.system.skills[attr]).find(skill => skill === profSkill)
                );

                delta = {
                    ...delta,
                    [`system.skills.${attr}.${profSkill}.isProfession`]: true
                };
            });
            this.actor.update(delta);
        }
        this.actor.addItem(item, 1);
    },

    _isUniqueItem(item) {
        return this.uniqueTypes.includes(item.type);
    },

    async _onItemAdd(event) {
        let element = event.currentTarget;
        const itemtype = element.dataset.itemtype;

        if (['profession', 'race', 'homeland', 'weapon', 'armor', 'component', 'diagrams', 'alchemical', 'valuable', 'spell', 'ritual', 'hex'].includes(itemtype)) {
            const packMap = {
                'profession': 'witcher-compendium.witcher-professions',
                'race': 'witcher-compendium.witcher-races',
                'homeland': 'witcher-compendium.witcher-homelands',
                'weapon': 'witcher-compendium.witcher-weapons',
                'armor': 'witcher-compendium.witcher-armor',
                'component': 'witcher-compendium.witcher-components',
                'diagrams': 'witcher-compendium.witcher-schematics',
                'alchemical': 'witcher-compendium.witcher-alchemy',
                'valuable': 'witcher-compendium.witcher-equipment',
                'spell': 'witcher-compendium.witcher-spells',
                'ritual': 'witcher-compendium.witcher-rituals',
                'hex': 'witcher-compendium.witcher-hexes'
            };

            const spellType = element.dataset.spelltype;
            let packId = packMap[itemtype];
            if (spellType) {
                const spellPackMap = {
                    'spellNovice': 'witcher-compendium.witcher-spells',
                    'spellJourneyman': 'witcher-compendium.witcher-spells',
                    'spellMaster': 'witcher-compendium.witcher-spells',
                    'spell': 'witcher-compendium.witcher-spells',
                    'invocation': 'witcher-compendium.witcher-invocations',
                    'sign': 'witcher-compendium.witcher-signs',
                    'signBasic': 'witcher-compendium.witcher-signs',
                    'signAlternate': 'witcher-compendium.witcher-signs',
                    'ritual': 'witcher-compendium.witcher-rituals',
                    'hex': 'witcher-compendium.witcher-hexes',
                    'magicalgift': 'witcher-compendium.witcher-gifts',
                    'goetia': 'witcher-compendium.witcher-rituals',
                    'necromancy': 'witcher-compendium.witcher-spells',
                    'curses': 'witcher-compendium.witcher-curses'
                };
                if (spellPackMap[spellType]) {
                    packId = spellPackMap[spellType];
                }
            }
            return this._onCompendiumItemSelect(itemtype, packId, spellType);
        }

        let itemData = {
            name: `new ${itemtype}`,
            type: itemtype
        };

        switch (element.dataset.spelltype) {
            case 'spellNovice':
                itemData.system = { class: 'Spells', level: 'novice' };
                break;
            case 'spellJourneyman':
                itemData.system = { class: 'Spells', level: 'journeyman' };
                break;
            case 'spellMaster':
                itemData.system = { class: 'Spells', level: 'master' };
                break;
            case 'magicalgift':
                itemData.system = { class: 'MagicalGift' };
                break;
        }

        if (element.dataset.itemtype == 'component') {
            if (element.dataset.subtype == 'alchemical') {
                itemData.system = { type: element.dataset.subtype };
            } else if (element.dataset.subtype) {
                itemData.system = { type: 'substances', substanceType: element.dataset.subtype };
            } else {
                itemData.system = { type: 'component', substanceType: element.dataset.subtype };
            }
        }

        if (element.dataset.itemtype == 'valuable') {
            itemData.system = { type: 'general' };
        }

        if (element.dataset.itemtype == 'diagram') {
            itemData.system = { type: 'alchemical', level: 'novice', isFormulae: true };
        }

        await Item.create(itemData, { parent: this.actor });
    },

    async _onProfessionSelect() {
        return this._onCompendiumItemSelect('profession', 'witcher-compendium.witcher-professions');
    },

    async _onCompendiumItemSelect(itemtype, packId, spellType = null) {
        let pack = game.packs.get(packId);
        
        // Map itemtypes to their localized labels
        const labels = {
            'profession': game.i18n.localize('WITCHER.Actor.Prof'),
            'race': game.i18n.localize('WITCHER.Actor.Race'),
            'homeland': game.i18n.localize('WITCHER.Actor.homeland'),
            'weapon': game.i18n.localize('TYPES.Item.weapon'),
            'armor': game.i18n.localize('TYPES.Item.armor'),
            'component': game.i18n.localize('TYPES.Item.component'),
            'diagrams': game.i18n.localize('TYPES.Item.diagrams'),
            'alchemical': game.i18n.localize('TYPES.Item.alchemical'),
            'valuable': game.i18n.localize('TYPES.Item.valuable'),
            'spell': game.i18n.localize('TYPES.Item.spell'),
            'ritual': game.i18n.localize('TYPES.Item.ritual'),
            'hex': game.i18n.localize('TYPES.Item.hex')
        };
        const typeLabel = labels[itemtype] || itemtype;

        // If specific pack not found, try to find any pack containing this item type
        if (!pack) {
            pack = game.packs.find(p => (p.documentName === "Item" || p.metadata.type === "Item" || p.metadata.documentName === "Item") && !p.metadata.name.includes("skill"));
        }

        if (!pack) return ui.notifications.error(`Compendio per ${typeLabel} non trovato.`);

        const filterFunc = (i) => {
            if (spellType) {
                if (spellType === 'spellNovice') {
                    return i.type === 'spell' && ['Spells', 'Invocations', 'Witcher', 'Mage'].includes(i.system?.class) && i.system?.level === 'novice';
                }
                if (spellType === 'spellJourneyman') {
                    return i.type === 'spell' && ['Spells', 'Invocations', 'Witcher', 'Mage'].includes(i.system?.class) && i.system?.level === 'journeyman';
                }
                if (spellType === 'spellMaster') {
                    return i.type === 'spell' && ['Spells', 'Invocations', 'Witcher', 'Mage'].includes(i.system?.class) && i.system?.level === 'master';
                }
                if (spellType === 'spell') {
                    return i.type === 'spell' && (i.system?.class === 'Spells' || i.system?.class === 'Mage');
                }
                if (spellType === 'invocation') {
                    return i.type === 'spell' && i.system?.class === 'Invocations';
                }
                if (spellType === 'sign') {
                    return i.type === 'spell' && i.system?.class === 'Witcher';
                }
                if (spellType === 'signBasic') {
                    return i.type === 'spell' && i.system?.class === 'Witcher' && i.system?.level === 'basic';
                }
                if (spellType === 'signAlternate') {
                    return i.type === 'spell' && i.system?.class === 'Witcher' && i.system?.level === 'alternate';
                }
                if (spellType === 'ritual') {
                    return i.type === 'ritual' && (i.system?.class === 'ritual' || !i.system?.class);
                }
                if (spellType === 'hex') {
                    return i.type === 'hex' && (i.system?.class === 'hex' || !i.system?.class);
                }
                if (spellType === 'magicalgift') {
                    return i.type === 'spell' && i.system?.class === 'MagicalGift';
                }
                if (spellType === 'goetia') {
                    return i.type === 'ritual' && i.system?.class === 'Goetia';
                }
                if (spellType === 'necromancy') {
                    return i.system?.class === 'Necromanzia';
                }
                if (spellType === 'curses') {
                    return i.type === 'hex' && i.system?.class === 'Curses';
                }
            }
            return i.type === itemtype;
        };

        let filteredIndex = [];
        if (pack) {
            const index = await pack.getIndex({fields: ["img", "name", "type", "system.class", "system.level"]});
            filteredIndex.push(...index.filter(filterFunc));
        }

        // Also search in all other Item packs to gather all matching items (e.g., witcher-special or homebrew packs)
        for (const p of game.packs.filter(p => (p.documentName === "Item" || p.metadata.type === "Item" || p.metadata.documentName === "Item") && p !== pack)) {
            const idx = await p.getIndex({fields: ["img", "name", "type", "system.class", "system.level"]});
            const matches = idx.filter(filterFunc);
            for (const match of matches) {
                if (!filteredIndex.some(existing => existing.uuid === match.uuid)) {
                    filteredIndex.push(match);
                }
            }
        }

        if (filteredIndex.length === 0) return ui.notifications.error(`Nessun oggetto di tipo ${typeLabel} trovato nei compendi.`);

        // Sort alphabetically
        filteredIndex.sort((a, b) => a.name.localeCompare(b.name));

        let optionsHtml = filteredIndex.map(i => `
            <option value="${i.uuid}">${i.name}</option>
        `).join('');

        const content = `
            <div class="compendium-select-dialog" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <p style="margin: 0; font-style: italic; opacity: 0.8;">Seleziona ${typeLabel.toLowerCase()} dal compendio:</p>
                <input type="text" name="searchFilter" placeholder="${game.i18n.localize('WITCHER.Actor.Button.Search')}..." style="width: 100%; height: 35px; padding: 0 10px; background: rgba(0,0,0,0.3); color: white; border: 1px solid var(--w-gold); font-family: 'Goudy Old Style', serif; font-size: 16px; border-radius: 4px; outline: none; box-sizing: border-box;" autofocus />
                <select name="itemUuid" style="width: 100%; height: 35px; background: rgba(0,0,0,0.3); color: white; border: 1px solid var(--w-gold); font-family: 'Goudy Old Style', serif; font-size: 16px; border-radius: 4px; outline: none; box-sizing: border-box;">
                    ${optionsHtml}
                </select>
            </div>
        `;

        const dialog = new foundry.applications.api.DialogV2({
            window: { 
                title: `${game.i18n.localize('WITCHER.Actor.Button.Add')} ${typeLabel}`,
                icon: "fas fa-list"
            },
            content,
            buttons: [
                {
                    action: "confirm",
                    label: game.i18n.localize('WITCHER.Actor.Button.Add'),
                    class: "standard-button gold",
                    default: true,
                    callback: async (event, button, instance) => {
                        const element = instance.element || instance || document.querySelector('.compendium-select-dialog');
                        const itemUuid = element?.querySelector('[name="itemUuid"]')?.value;
                        if (!itemUuid) return;
                        const item = await fromUuid(itemUuid);
                        this._onDropItem(event, item);
                    }
                },
                {
                    action: "cancel",
                    label: game.i18n.localize('WITCHER.Button.Cancel')
                }
            ],
            render: (instance, html) => {
                // Determine the correct raw DOM element, handling jQuery objects and instance properties
                let rawElement = null;
                if (html) {
                    rawElement = html.jquery ? html[0] : html;
                } else if (instance) {
                    if (instance.element) {
                        rawElement = instance.element.jquery ? instance.element[0] : instance.element;
                    } else if (instance.jquery) {
                        rawElement = instance[0];
                    } else if (instance instanceof HTMLElement) {
                        rawElement = instance;
                    }
                }
                
                // Fallback to searching the entire document
                if (!rawElement) {
                    rawElement = document.querySelector('.compendium-select-dialog')?.closest('.window-content') 
                              || document.querySelector('.compendium-select-dialog');
                }
                
                if (!rawElement) {
                    console.error("Witcher TRPG | Impossibile trovare l'elemento DOM del dialogo.");
                    return;
                }

                const searchInput = rawElement.querySelector('[name="searchFilter"]');
                const selectElement = rawElement.querySelector('[name="itemUuid"]');
                if (!searchInput || !selectElement) {
                    console.error("Witcher TRPG | Elementi di ricerca o select non trovati nel dialogo.", { searchInput, selectElement });
                    return;
                }

                // Keep a copy of all original options
                const originalOptions = Array.from(selectElement.options).map(opt => ({
                    value: opt.value,
                    text: opt.text
                }));

                // Focus search input
                setTimeout(() => {
                    if (searchInput) searchInput.focus();
                }, 50);

                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase().trim();
                    
                    // Clear the select
                    selectElement.innerHTML = '';
                    
                    // Filter matching options
                    const filtered = originalOptions.filter(opt => 
                        opt.text.toLowerCase().includes(query)
                    );
                    
                    // Populate with filtered options
                    filtered.forEach(opt => {
                        const newOpt = document.createElement('option');
                        newOpt.value = opt.value;
                        newOpt.text = opt.text;
                        selectElement.appendChild(newOpt);
                    });
                });

                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        // Find the confirm button in the dialog's footer
                        const confirmBtn = rawElement.closest('.window-content')?.parentElement.querySelector('footer.window-footer button[data-button-action="confirm"]')
                                     || rawElement.querySelector('button[data-button-action="confirm"]')
                                     || document.querySelector('footer.window-footer button[data-button-action="confirm"]');
                        if (confirmBtn) {
                            confirmBtn.click();
                        }
                    }
                });
            }
        });
        dialog.render(true);
    },

    async _onItemEquip(event) {
        event.preventDefault();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        let isEquipping = !item.system.equipped;

        // Validation for armor layering rules
        if (isEquipping && item.type === 'armor') {
            // Rule: Only one shield at a time
            if (item.system.location?.includes('Shield')) {
                const otherShields = this.actor.items.filter(i => 
                    i.type === 'armor' && 
                    i.system.equipped && 
                    i.system.location?.includes('Shield') && 
                    i.id !== item.id
                );
                for (let s of otherShields) {
                    await s.update({ 'system.equipped': false });
                }
            }

            if (item.system.type !== 'Natural') {
                const locations = ['head', 'torso', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];
                const armorType = item.system.type;

                for (let loc of locations) {
                    const spKey = loc + 'Stopping';
                    // Only check locations covered by this item
                    if ((item.system[spKey] ?? 0) > 0) {
                        const locArmor = this.actor.getLocationArmor({ name: loc }, {});
                        const worn = locArmor.armorSet.worn;

                        // 1. Max 3 layers per single body location
                        if (worn.length >= 3) {
                            ui.notifications.warn(`${game.i18n.localize('WITCHER.Armor.tooMuch')} (${loc.toUpperCase()}: Max 3 layers)`);
                            return;
                        }

                        // 2. Max 1 Heavy and 1 Medium per location
                        if (armorType === 'Medium' && worn.some(a => a.system.type === 'Medium')) {
                            ui.notifications.warn(`${game.i18n.localize('WITCHER.Armor.tooMuch')} (${loc.toUpperCase()}: Max 1 Medium)`);
                            return;
                        }
                        if (armorType === 'Heavy' && worn.some(a => a.system.type === 'Heavy')) {
                            ui.notifications.warn(`${game.i18n.localize('WITCHER.Armor.tooMuch')} (${loc.toUpperCase()}: Max 1 Heavy)`);
                            return;
                        }
                    }
                }
            }
        }

        const updateData = { 'system.equipped': !item.system.equipped };
        if (item.type === 'valuable' && updateData['system.equipped']) {
            updateData['system.isCarried'] = true;
        }

        await item.update(updateData);
    },

    async _onItemCarried(event) {
        event.preventDefault();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        const updateData = { 'system.isCarried': !item.system.isCarried };
        if (item.system.isCarried && item.system.equipped) {
            updateData['system.equipped'] = false;
        }

        await item.update(updateData);
    },

    async _onItemLearned(event) {
        event.preventDefault();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        await item.update({ 'system.learned': !item.system.learned });
    },

    _onItemInlineEdit(event) {
        event.preventDefault();
        event.stopPropagation();
        let element = event.currentTarget;
        let itemId = element.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        let field = element.dataset.field;
        // Edit checkbox values
        let value = element.value;
        if (value == 'false') {
            value = true;
        }
        if (value == 'true' || value == 'checked') {
            value = false;
        }

        return item.update({ [field]: value });
    },

    _onItemEdit(event) {
        event.preventDefault();
        event.stopPropagation();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.sheet.render(true);
    },

    async _onItemShow(event) {
        event.preventDefault;
        event.stopPropagation();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);

        const dialog = new foundry.applications.api.DialogV2({
            window: { 
                title: item.name,
                resizable: true
            },
            content: `<img src="${item.img}" alt="${item.img}" width="100%" />`,
            buttons: [{
                action: "ok",
                label: game.i18n.localize('WITCHER.Button.Ok'),
                default: true
            }]
        });
        dialog.render(true);
    },

    async _onItemDelete(event) {
        event.preventDefault();
        event.stopPropagation();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        this.actor.items.get(itemId).delete();
    },

    async _chooseEnhancement(event) {
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        let type = event.currentTarget.closest('.item').dataset.type;

        let content = '';
        let enhancements = this.actor.getList('enhancement');
        if (type == 'weapon') {
            enhancements = enhancements.filter(
                e => e.system.applied == false && (e.system.type == 'rune' || e.system.type == 'weapon')
            );
        } else {
            enhancements = enhancements.filter(
                e => e.system.applied == false && (e.system.type == 'armor' || e.system.type == 'glyph')
            );
        }

        if (enhancements.length == 0) {
            content += `<div class="error-display">${game.i18n.localize('WITCHER.Enhancement.NoEnhancement')}</div>`;
        } else {
            let enhancementsOption = ``;
            enhancements.forEach(element => {
                enhancementsOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
            });
            content += `<div><label>${game.i18n.localize('WITCHER.Dialog.Enhancement')}: <select name="enhancement">${enhancementsOption}</select></label></div>`;
        }

        const dialog = new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize('WITCHER.Enhancement.ChooseTitle') },
            content,
            buttons: [
                {
                    action: "cancel",
                    label: game.i18n.localize('WITCHER.Button.Cancel')
                },
                {
                    action: "apply",
                    label: game.i18n.localize('WITCHER.Dialog.Apply'),
                    default: true,
                    callback: async (event, button, instance) => {
                        const html = instance.element;
                        let enhancementId = undefined;
                        const selector = html.querySelector('[name=enhancement]');
                        if (selector) {
                            enhancementId = selector.value;
                        }
                        if (enhancementId) {
                            let newEnhancementList = item.system.enhancementItemIds;
                            newEnhancementList.push(enhancementId);
                            await item.update({ 'system.enhancementItemIds': newEnhancementList });

                            let choosenEnhancement = this.actor.items.get(enhancementId);
                            if (
                                choosenEnhancement.system.type == 'armor' ||
                                choosenEnhancement.system.type == 'glyph'
                            ) {
                                await item.update({
                                    'system.headStopping':
                                        item.system.headStopping + choosenEnhancement.system.stopping,
                                    'system.headMaxStopping':
                                        item.system.headMaxStopping + choosenEnhancement.system.stopping,
                                    'system.torsoStopping':
                                        item.system.torsoStopping + choosenEnhancement.system.stopping,
                                    'system.torsoMaxStopping':
                                        item.system.torsoMaxStopping + choosenEnhancement.system.stopping,
                                    'system.leftArmStopping':
                                        item.system.leftArmStopping + choosenEnhancement.system.stopping,
                                    'system.leftArmMaxStopping':
                                        item.system.leftArmMaxStopping + choosenEnhancement.system.stopping,
                                    'system.rightArmStopping':
                                        item.system.rightArmStopping + choosenEnhancement.system.stopping,
                                    'system.rightArmMaxStopping':
                                        item.system.rightArmMaxStopping + choosenEnhancement.system.stopping,
                                    'system.leftLegStopping':
                                        item.system.leftLegStopping + choosenEnhancement.system.stopping,
                                    'system.leftLegMaxStopping':
                                        item.system.leftLegMaxStopping + choosenEnhancement.system.stopping,
                                    'system.rightLegStopping':
                                        item.system.rightLegStopping + choosenEnhancement.system.stopping,
                                    'system.rightLegMaxStopping':
                                        item.system.rightLegMaxStopping + choosenEnhancement.system.stopping,
                                    'system.bludgeoning': choosenEnhancement.system.bludgeoning,
                                    'system.slashing': choosenEnhancement.system.slashing,
                                    'system.piercing': choosenEnhancement.system.piercing,
                                    'system.effects': item.system.effects.concat(choosenEnhancement.system.effects)
                                });
                            }

                            let newName = choosenEnhancement.name + '(Applied)';
                            let newQuantity = choosenEnhancement.system.quantity;
                            await choosenEnhancement.update({
                                'name': newName,
                                'system.applied': true,
                                'system.quantity': 1
                            });
                            if (newQuantity > 1) {
                                newQuantity -= 1;
                                await this.actor.addItem(choosenEnhancement, newQuantity, true);
                            }
                        }
                    }
                }
            ]
        });
        dialog.render(true);
    },

    _onItemDisplayInfo(event) {
        event.preventDefault();
        event.stopPropagation();
        let itemId = event.currentTarget.closest('.item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        if (item) {
            item.sheet.render(true);
        }
    },

    _onDisplayList(event) {
        event.preventDefault();
        event.stopPropagation();

        let section = event.currentTarget.closest('.weapon-section');
        let editor = section.querySelector('.weapon-list');
        editor.classList.toggle('invisible');

        let icon = event.currentTarget.querySelector('.fa-chevron-up');
        icon.classList.toggle('rotate-180');
    },

    _onEnhancementInfo(event) {
        event.preventDefault();
        event.stopPropagation();
        let section = event.currentTarget.closest('.weapon-enhancement');
        let editor = $(section).find('.enhancement-info');
        editor.toggleClass('invisible');
    },

    async _onItemRoll(event) {
        this.actor.useItem(event.currentTarget.closest('.item').dataset.itemId, {
            alt: event?.altKey,
            ctrl: event?.ctrlKey,
            shift: event?.shiftKey
        });
    },

    _onSpellDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.spell');
        const spellType = section.dataset.spelltype;
        const key = `system.pannels.${spellType}IsOpen`;
        const currentState = foundry.utils.getProperty(this.actor, key);

        if (this.isEditable) {
            this.actor.update({ [key]: !currentState });
        } else {
            this._tempPannels = this._tempPannels || {};
            this._tempPannels[key] = !currentState;
            this.render();
        }
    },

    _onSubstanceDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.substance');
        const subType = section.dataset.subtype;
        const key = `system.pannels.${subType}IsOpen`;
        const currentState = foundry.utils.getProperty(this.actor, key);

        if (this.isEditable) {
            this.actor.update({ [key]: !currentState });
        } else {
            this._tempPannels = this._tempPannels || {};
            this._tempPannels[key] = !currentState;
            this.render();
        }
    },

    async _onItemMessage(event) {
        let itemId = event.currentTarget.closest('.list-item').dataset.itemId;
        let item = this.actor.items.get(itemId);
        const dialogData = {
            item: item,
            type: item.type,
            config: WITCHER
        };

        ChatMessage.create({
            content: await foundry.applications.handlebars.renderTemplate(
                'systems/TheWitcherItaNewSystem/templates/chat/item/item-description.hbs',
                dialogData
            ),
            speaker: ChatMessage.getSpeaker({ actor: this.actor.name }),
            ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.IC } : { type: CONST.CHAT_MESSAGE_TYPES?.IC ?? 1 })
        });
    },

    itemListener(html) {
        html = $(html);
        html.find('.add-item').on('click', this._onItemAdd.bind(this));
        html.find('.item-equip').on('click', this._onItemEquip.bind(this));
        html.find('.item-carried').on('click', this._onItemCarried.bind(this));
        html.find('.item-learned').on('click', this._onItemLearned.bind(this));
        html.find('.item-edit').on('click', this._onItemEdit.bind(this));
        html.find('.item-show').on('click', this._onItemShow.bind(this));
        html.find('.item-delete').on('click', this._onItemDelete.bind(this));
        html.find('.inline-edit').change(this._onItemInlineEdit.bind(this));
        html.find('.inline-edit').on('click', e => e.stopPropagation());

        html.find('.enhancement-weapon-slot').on('click', this._chooseEnhancement.bind(this));
        html.find('.enhancement-armor-slot').on('click', this._chooseEnhancement.bind(this));

        html.find('.weapon-list-display').on('click', this._onDisplayList.bind(this));

        html.find('.item-weapon-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-armor-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-display-info').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-valuable-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-spell-display').on('click', this._onItemDisplayInfo.bind(this));
        html.find('.item-substance-display').on('click', this._onSubstanceDisplay.bind(this));

        html.find('.enhancement-label').on('click', this._onEnhancementInfo.bind(this));

        html.find('.spell-display').on('click', this._onSpellDisplay.bind(this));

        html.find('.item-roll').on('click', this._onItemRoll.bind(this));
        html.find('.spell-roll').on('click', this._onItemRoll.bind(this));
        html.find('.item-chat').on('click', this._onItemMessage.bind(this));
    }
};
