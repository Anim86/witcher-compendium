const LEGACY_MODE_TYPES = {
    0: 'custom',
    1: 'multiply',
    2: 'add',
    3: 'downgrade',
    4: 'upgrade',
    5: 'override'
};

const LEGACY_TYPE_MODES = Object.fromEntries(Object.entries(LEGACY_MODE_TYPES).map(([mode, type]) => [type, Number(mode)]));

function getLegacyMode(change) {
    const source = change._source ?? change;
    return Object.prototype.hasOwnProperty.call(source, 'mode') ? source.mode : undefined;
}

export function normalizeEffectChange(change) {
    const changeData = { ...change };
    delete changeData.effect;
    const normalized = foundry.utils.deepClone(changeData);

    if (!normalized.type) {
        normalized.type = LEGACY_MODE_TYPES[getLegacyMode(change)] ?? 'add';
    }

    delete normalized.mode;
    normalized.priority ??= getEffectChangePriority(normalized);
    return normalized;
}

export function migrateEffectChangesSource(source) {
    if (!Array.isArray(source?.changes)) return source;

    for (const change of source.changes) {
        if (!change.type && change.mode !== undefined) change.type = LEGACY_MODE_TYPES[change.mode] ?? 'add';
        delete change.mode;
    }

    return source;
}

export function getEffectChangePriority(change) {
    if (Number.isNumeric(change.priority)) return change.priority;

    const type = change.type ?? LEGACY_MODE_TYPES[getLegacyMode(change)] ?? 'add';
    const configuredType = ActiveEffect.CHANGE_TYPES?.[type];
    if (Number.isNumeric(configuredType?.defaultPriority)) return configuredType.defaultPriority;

    const configuredPriority = foundry.CONST.ACTIVE_EFFECT_CHANGE_TYPES?.[type];
    if (Number.isNumeric(configuredPriority)) return configuredPriority;

    const legacyMode = getLegacyMode(change);
    if (Number.isNumeric(legacyMode)) return legacyMode * 10;

    return 20;
}

export function applyEffectChange(target, change) {
    const normalized = normalizeEffectChange(change);

    if (typeof ActiveEffect.applyChange === 'function') {
        return ActiveEffect.applyChange(target, normalized, { modifyTarget: false });
    }

    if (typeof change.effect?.applyChange === 'function') {
        return change.effect.applyChange(target, {
            ...normalized,
            mode: LEGACY_TYPE_MODES[normalized.type] ?? 2
        });
    }

    return {};
}
