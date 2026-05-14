export let progressionSheetMixin = {
    progressionListener(html) {
        const thisActor = this.actor;
        
        // Stats
        html.querySelectorAll('.spend-ip-stat').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const stat = event.currentTarget.closest('.stat-display').dataset.stat;
                thisActor.spendIp(`system.stats.${stat}`);
            });
        });

        // Skills
        html.querySelectorAll('.spend-ip-skill').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const skill = event.currentTarget.closest('.skill-card').dataset.skill;
                const stat = event.currentTarget.closest('.skill-card').dataset.stat;
                thisActor.spendIp(`system.skills.${stat}.${skill}`);
            });
        });

        // Profession Skills
        html.querySelectorAll('.spend-ip-profession').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const name = event.currentTarget.closest('.profession-display').dataset.name;
                thisActor.spendIp(`system.profession.skills.${name}`);
            });
        });
    }
};
