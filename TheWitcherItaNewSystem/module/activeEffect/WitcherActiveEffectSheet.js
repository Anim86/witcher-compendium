import { baseMixin } from './mixins/baseMixin.js';
import { temporaryItemImprovementMixin } from './mixins/temporaryItemImprovementMixin.js';
import { getEffectChangePriority, normalizeEffectChange } from './effectChangeCompatibility.js';

const DialogV2 = foundry.applications.api.DialogV2;

export class WitcherActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {
    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            wizard: WitcherActiveEffectConfig.wizardAction
        }
    };

    /** @override */
    static PARTS = {
        header: { template: 'templates/sheets/active-effect/header.hbs' },
        tabs: { template: 'templates/generic/tab-navigation.hbs' },
        details: { template: 'systems/TheWitcherItaNewSystem/templates/sheets/activeEffect/details.hbs', scrollable: [''] },
        duration: { template: 'templates/sheets/active-effect/duration.hbs' },
        changes: {
            template: 'systems/TheWitcherItaNewSystem/templates/sheets/activeEffect/active-effect-changes.hbs',
            scrollable: ['ol[data-changes]']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.systemFields = this.document.system.schema.fields;
        context.changeTypes = Object.fromEntries(
            Object.entries(ActiveEffect.CHANGE_TYPES ?? {}).map(([type, config]) => [
                type,
                game.i18n.localize(config.label ?? type)
            ])
        );
        context.priorities = Object.fromEntries(
            Object.keys(context.changeTypes).map(type => [type, getEffectChangePriority({ type })])
        );
        context.source.changes = (context.source.changes ?? []).map(change => normalizeEffectChange(change));
        return context;
    }

    static async wizardAction() {
        let selects;

        switch (this.document.type) {
            case 'base':
                selects = this.getActiveEffectsBasePaths();
                break;
            case 'temporaryItemImprovement':
                selects = this.getActiveEffectsItemImprovementPaths();
                break;
        }

        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/dialog/activeEffects/wizard.hbs',
            {
                selects: selects
            }
        );

        DialogV2.prompt({
            content: dialogTemplate,
            modal: true,
            ok: {
                callback: (event, button, dialog) => {
                    let paths = button.form.elements.path.value.split(',');
                    let newChanges = this.document.changes;
                    paths.forEach(path => {
                        newChanges.push({
                            key: path
                        });
                    });

                    this.document.update({
                        changes: newChanges
                    });
                }
            }
        });
    }
}

Object.assign(WitcherActiveEffectConfig.prototype, baseMixin);
Object.assign(WitcherActiveEffectConfig.prototype, temporaryItemImprovementMixin);
