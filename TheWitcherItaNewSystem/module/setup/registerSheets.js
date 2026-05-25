import WitcherCharacterSheet from '../actor/sheets/WitcherCharacterSheet.js';
import WitcherMonsterSheet from '../actor/sheets/WitcherMonsterSheet.js';
import WitcherLootSheet from '../actor/sheets/WitcherLootSheet.js';

import WitcherWeaponSheet from '../item/sheets/WitcherWeaponSheet.js';
import WitcherDiagramSheet from '../item/sheets/WitcherDiagramSheet.js';
import WitcherContainerSheet from '../item/sheets/WitcherContainerSheet.js';

import WitcherMysterySheet from '../actor/sheets/investigation/WitcherMysterySheet.js';
import WitcherClueSheet from '../item/sheets/investigation/WitcherClueSheet.js';
import WitcherObstacleSheet from '../item/sheets/investigation/WitcherObstacleSheet.js';
import WitcherSpellSheet from '../item/sheets/WitcherSpellSheet.js';
import WitcherAlchemicalSheet from '../item/sheets/WitcherAlchemicalSheet.js';
import WitcherArmorSheet from '../item/sheets/WitcherArmorSheet.js';
import WitcherValuableSheet from '../item/sheets/WitcherValuableSheet.js';
import { WitcherActiveEffectConfig } from '../activeEffect/WitcherActiveEffectSheet.js';
import WitcherProfessionSheet from '../item/sheets/WitcherProfessionSheet.js';
import WitcherSkillItemSheet from '../item/sheets/WitcherSkillItemSheet.js';
import WitcherMutagenSheet from '../item/sheets/WitcherMutagenSheet.js';
import WitcherEnhancementSheet from '../item/sheets/WitcherEnhancementSheet.js';
import WitcherHexSheet from '../item/sheets/WitcherHexSheet.js';
import WitcherRitualSheet from '../item/sheets/WitcherRitualSheet.js';
import WitcherRaceSheet from '../item/sheets/WitcherRaceSheet.js';
import WitcherItemSheet from '../item/sheets/WitcherItemSheet.js';
import WitcherCriticalWoundSheet from '../item/sheets/WitcherCriticalWoundSheet.js';
import WitcherMountSheet from '../item/sheets/WitcherMountSheet.js';
import WitcherComponentSheet from '../item/sheets/WitcherComponentSheet.js';
import WitcherHomelandSheet from '../item/sheets/WitcherHomelandSheet.js';
import WitcherNoteSheet from '../item/sheets/WitcherNoteSheet.js';


export const registerSheets = () => {
    // In V14, ensure we use the globally available document classes and the correct namespace for DocumentSheetConfig
    const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
    
    // Helper to register for V14 (V2 sheets with legacy registry fallback)
    const register = (docClass, label, sheetClass, options = {}) => {
        const docName = docClass.documentName;
        if (!docName) return;

        // Manual population of legacy CONFIG registry to satisfy core V14 internals
        const registry = CONFIG[docName].sheetClasses;
        const types = options.types || ["base"];
        
        for (let t of types) {
            if (!registry[t]) registry[t] = {};
            registry[t][`${label}.${sheetClass.name}`] = {
                cls: sheetClass,
                default: !!options.makeDefault,
                id: `${label}.${sheetClass.name}`,
                label: sheetClass.name,
                canBeDefault: !!options.makeDefault,
                canConfigure: true
            };
        }

        // Official V14 ApplicationV2 registration
        DocumentSheetConfig.registerSheet(docClass, label, sheetClass, options);
    };

    // Note: We avoid unregistering core sheets by name if not imported, 
    // as setting makeDefault: true is sufficient in V14.

    // Items
    register(Item, 'witcher', WitcherItemSheet, { makeDefault: true });

    register(Item, 'witcher', WitcherNoteSheet, {
        makeDefault: true,
        types: ['note']
    });

    register(Item, 'witcher', WitcherAlchemicalSheet, {
        makeDefault: true,
        types: ['alchemical']
    });
    register(Item, 'witcher', WitcherArmorSheet, {
        makeDefault: true,
        types: ['armor']
    });
    register(Item, 'witcher', WitcherContainerSheet, {
        makeDefault: true,
        types: ['container']
    });
    register(Item, 'witcher', WitcherComponentSheet, {
        makeDefault: true,
        types: ['component']
    });
    register(Item, 'witcher', WitcherDiagramSheet, {
        makeDefault: true,
        types: ['diagrams']
    });
    register(Item, 'witcher', WitcherEnhancementSheet, {
        makeDefault: true,
        types: ['enhancement']
    });
    register(Item, 'witcher', WitcherHomelandSheet, {
        makeDefault: true,
        types: ['homeland']
    });
    register(Item, 'witcher', WitcherMutagenSheet, {
        makeDefault: true,
        types: ['mutagen']
    });
    register(Item, 'witcher', WitcherProfessionSheet, {
        makeDefault: true,
        types: ['profession']
    });
    register(Item, 'witcher', WitcherSpellSheet, {
        makeDefault: true,
        types: ['spell']
    });
    register(Item, 'witcher', WitcherHexSheet, {
        makeDefault: true,
        types: ['hex']
    });
    register(Item, 'witcher', WitcherRaceSheet, {
        makeDefault: true,
        types: ['race']
    });
    register(Item, 'witcher', WitcherMountSheet, {
        makeDefault: true,
        types: ['mount']
    });
    register(Item, 'witcher', WitcherRitualSheet, {
        makeDefault: true,
        types: ['ritual']
    });
    register(Item, 'witcher', WitcherValuableSheet, {
        makeDefault: true,
        types: ['valuable']
    });
    register(Item, 'witcher', WitcherWeaponSheet, {
        makeDefault: true,
        types: ['weapon']
    });
    register(Item, 'witcher', WitcherItemSheet, {
        makeDefault: true,
        types: ['item']
    });
    register(Item, 'witcher', WitcherCriticalWoundSheet, {
        makeDefault: true,
        types: ['criticalWound']
    });

    // Actors
    register(Actor, 'witcher', WitcherCharacterSheet, {
        makeDefault: true,
        types: ['character']
    });
    register(Actor, 'witcher', WitcherMonsterSheet, {
        makeDefault: true,
        types: ['monster']
    });
    register(Actor, 'witcher', WitcherLootSheet, {
        makeDefault: true,
        types: ['loot']
    });
    register(Actor, 'witcher', WitcherCharacterSheet, {
        makeDefault: true,
        types: ['npc', 'Actor']
    });

    register(Actor, 'witcher', WitcherMysterySheet, {
        makeDefault: true,
        types: ['mystery']
    });
    register(Item, 'witcher', WitcherClueSheet, {
        makeDefault: true,
        types: ['clue']
    });
    register(Item, 'witcher', WitcherObstacleSheet, {
        makeDefault: true,
        types: ['obstacle']
    });

    register(Item, 'witcher', WitcherSkillItemSheet, {
        makeDefault: true,
        types: ['skill']
    });

    // Active Effects - handle separately if needed, but registry is similar
    register(ActiveEffect, 'witcher', WitcherActiveEffectConfig, {
        makeDefault: true
    });
};
