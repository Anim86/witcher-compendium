export const registerSettings = function () {
    //optional rules
    game.settings.register('TheWitcherItaNewSystem', 'useOptionalAdrenaline', {
        name: 'WITCHER.Settings.Adrenaline',
        hint: 'WITCHER.Settings.AdrenalineDetails',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherItaNewSystem', 'useOptionalVerbalCombat', {
        name: 'WITCHER.Settings.useVerbalCombatRule',
        hint: 'WITCHER.Settings.useVerbalCombatRuleHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    //rules interpretation
    game.settings.register('TheWitcherItaNewSystem', 'woundsAffectSkillBase', {
        name: 'WITCHER.Settings.WoundsAffectSkillBase',
        hint: 'WITCHER.Settings.WoundsAffectSkillBaseDetails',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    //sage rulings
    game.settings.register('TheWitcherItaNewSystem', 'silverTrait', {
        name: 'WITCHER.Settings.silverTrait',
        hint: 'WITCHER.Settings.silverTraitHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register('TheWitcherItaNewSystem', 'displayRollsDetails', {
        name: 'WITCHER.Settings.displayRollDetails',
        hint: 'WITCHER.Settings.displayRollDetailsHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherItaNewSystem', 'useWitcherFont', {
        name: 'WITCHER.Settings.specialFont',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherItaNewSystem', 'displayRep', {
        name: 'WITCHER.Settings.displayReputation',
        hint: 'WITCHER.Settings.displayReputationHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
    game.settings.register('TheWitcherItaNewSystem', 'clickableImageItemTypes', {
        name: 'WITCHER.Settings.clickableImageItemTypes',
        hint: 'WITCHER.Settings.clickableImageItemTypesHint',
        scope: 'world',
        config: true,
        type: String,
        default: 'valuable'
    });
    game.settings.register('TheWitcherItaNewSystem', 'clickableImageCheckboxForGMOnly', {
        name: 'WITCHER.Settings.clickableImageCheckboxForGMOnly',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register('TheWitcherItaNewSystem', 'allowPlayerWizard', {
        name: 'WITCHER.Settings.allowPlayerWizard',
        hint: 'WITCHER.Settings.allowPlayerWizardHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register('TheWitcherItaNewSystem', 'disableAutoPause', {
        name: 'WITCHER.Settings.disableAutoPause',
        hint: 'WITCHER.Settings.disableAutoPauseHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });
};
