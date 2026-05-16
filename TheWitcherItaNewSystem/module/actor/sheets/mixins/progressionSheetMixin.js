import WitcherImprovementDialog from "../../app/WitcherImprovementDialog.js";

export let progressionSheetMixin = {
    progressionListener(html) {
        const thisActor = this.actor;
        
        // Stats
        html.querySelectorAll('.spend-ip-stat').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const stat = event.currentTarget.closest('.stat-display').dataset.stat;
                new WitcherImprovementDialog(thisActor, stat, { type: 'stat' }).render(true);
            });
        });

        // Skills
        html.querySelectorAll('.spend-ip-skill').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const skill = event.currentTarget.closest('.skill-card').dataset.skill;
                new WitcherImprovementDialog(thisActor, skill, { type: 'skill' }).render(true);
            });
        });

        // Profession Skills
        html.querySelectorAll('.spend-ip-profession').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const display = event.currentTarget.closest('.profession-display');
                const name = display.dataset.name;
                const path = display.dataset.path;
                const index = display.dataset.index;
                new WitcherImprovementDialog(thisActor, name, { 
                    type: 'skill', 
                    isProfession: true,
                    path: path,
                    index: index
                }).render(true);
            });
        });

        // Magic Training
        html.querySelectorAll('.magic-training').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const itemId = event.currentTarget.closest('.item').dataset.itemId;
                const item = thisActor.items.get(itemId);
                new WitcherImprovementDialog(thisActor, item, { type: 'magic' }).render(true);
            });
        });
    }
};
