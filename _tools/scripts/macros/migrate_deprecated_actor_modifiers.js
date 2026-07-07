// Foundry macro - TheWitcherItaNewSystem
// Converts deprecated actor stat/skill modifiers to Active Effects, then clears the old arrays.
// Set DRY_RUN to false after checking the report in the console.

const DRY_RUN = true;
const EFFECT_NAME = 'Migrazione Modificatori';
const EFFECT_ICON = 'icons/svg/upgrade.svg';

if (!game.user.isGM) {
  ui.notifications.error('Solo il GM puo eseguire questa migrazione.');
  return;
}

const report = [];

function collectModifiers(list, path, label) {
  if (!Array.isArray(list) || list.length === 0) return [];

  return list
    .map(mod => ({
      key: path,
      value: Number(mod.value) || 0,
      type: 'add',
      label: mod.name || mod.source || label
    }))
    .filter(change => Number(change.value) !== 0);
}

for (const actor of game.actors) {
  if (!actor.isOwner || actor.type === 'mystery' || actor.type === 'loot') continue;

  const changes = [];
  const updateData = {};
  let reputationDelta = 0;

  for (const [statKey, stat] of Object.entries(actor.system.stats ?? {})) {
    const statChanges = collectModifiers(
      stat.modifiers,
      `system.stats.${statKey}.totalModifiers`,
      statKey
    );
    changes.push(...statChanges);
    if (stat.modifiers?.length) updateData[`system.stats.${statKey}.modifiers`] = [];
  }

  for (const [statKey, stat] of Object.entries(actor.system.derivedStats ?? {})) {
    const statChanges = collectModifiers(
      stat.modifiers,
      `system.derivedStats.${statKey}.totalModifiers`,
      statKey
    );
    changes.push(...statChanges);
    if (stat.modifiers?.length) updateData[`system.derivedStats.${statKey}.modifiers`] = [];
  }

  for (const [statKey, skillGroup] of Object.entries(actor.system.skills ?? {})) {
    for (const [skillKey, skill] of Object.entries(skillGroup ?? {})) {
      const skillChanges = collectModifiers(
        skill.modifiers,
        `system.skills.${statKey}.${skillKey}.activeEffectModifiers`,
        skillKey
      );
      changes.push(...skillChanges);
      if (skill.modifiers?.length) updateData[`system.skills.${statKey}.${skillKey}.modifiers`] = [];
    }
  }

  const repModifiers = actor.system.reputation?.modifiers ?? [];
  if (repModifiers.length > 0) {
    reputationDelta = repModifiers.reduce((sum, mod) => sum + (Number(mod.value) || 0), 0);
    updateData['system.reputation.modifiers'] = [];
    updateData['system.reputation.unmodifiedMax'] = (Number(actor.system.reputation.unmodifiedMax) || 0) + reputationDelta;
  }

  if (changes.length === 0 && Object.keys(updateData).length === 0) continue;

  report.push({
    actor: actor.name,
    activeEffectChanges: changes.map(change => `${change.key} ${change.value} (${change.label})`),
    reputationDelta,
    clearedPaths: Object.keys(updateData).filter(path => path.endsWith('.modifiers'))
  });

  if (DRY_RUN) continue;

  const previousMigrationEffects = actor.effects.filter(effect => effect.name === EFFECT_NAME).map(effect => effect.id);
  if (previousMigrationEffects.length > 0) {
    await actor.deleteEmbeddedDocuments('ActiveEffect', previousMigrationEffects);
  }

  if (changes.length > 0) {
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      name: EFFECT_NAME,
      icon: EFFECT_ICON,
      origin: actor.uuid,
      changes
    }]);
  }

  await actor.update(updateData);
}

console.table(report.map(row => ({
  actor: row.actor,
  activeEffectChanges: row.activeEffectChanges.length,
  reputationDelta: row.reputationDelta,
  clearedPaths: row.clearedPaths.length
})));

console.log('Dettaglio migrazione modificatori:', report);

ui.notifications.info(
  DRY_RUN
    ? `Dry run completato: ${report.length} attori da migrare. Controlla la console, poi imposta DRY_RUN = false.`
    : `Migrazione completata: ${report.length} attori aggiornati.`
);
