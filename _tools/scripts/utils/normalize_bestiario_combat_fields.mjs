import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PACK_DIRS = [
    '_tools/src-packs/BESTIARIO/witcher-animals',
    '_tools/src-packs/BESTIARIO/witcher-monsters',
    '_tools/src-packs/BESTIARIO/witcher-characters'
];

const SKILL_GROUP = {
    awareness: 'int',
    business: 'int',
    commonsp: 'int',
    deduction: 'int',
    education: 'int',
    eldersp: 'int',
    monster: 'int',
    socialetq: 'int',
    streetwise: 'int',
    tactics: 'int',
    teaching: 'int',
    wilderness: 'int',

    brawling: 'ref',
    dodge: 'ref',
    melee: 'ref',
    riding: 'ref',
    sailing: 'ref',
    smallblades: 'ref',
    staffspear: 'ref',
    swordsmanship: 'ref',

    archery: 'dex',
    athletics: 'dex',
    crossbow: 'dex',
    sleight: 'dex',
    stealth: 'dex',

    endurance: 'body',
    physique: 'body',

    charisma: 'emp',
    deceit: 'emp',
    finearts: 'emp',
    gambling: 'emp',
    grooming: 'emp',
    leadership: 'emp',
    perception: 'emp',
    performance: 'emp',
    persuasion: 'emp',
    seduction: 'emp',

    alchemy: 'cra',
    crafting: 'cra',
    disguise: 'cra',
    firstaid: 'cra',
    forgery: 'cra',
    picklock: 'cra',
    trapcraft: 'cra',

    courage: 'will',
    hexweave: 'will',
    intimidation: 'will',
    resistcoerc: 'will',
    resistmagic: 'will',
    ritcraft: 'will',
    spellcast: 'will'
};

const MELEE_SKILLS = new Set(['brawling', 'melee', 'smallblades', 'staffspear', 'swordsmanship']);
const RANGED_SKILLS = new Set(['archery', 'athletics', 'crossbow']);
const CATEGORY_SKILL = {
    sword: 'swordsmanship',
    smallBlade: 'smallblades',
    axe: 'melee',
    bludgeoning: 'melee',
    staff: 'melee',
    polearm: 'staffspear',
    brawling: 'brawling',
    melee: 'melee',
    bow: 'archery',
    crossbow: 'crossbow',
    thrown: 'athletics',
    bomb: 'athletics'
};

const TEXT_TOKEN_MAP = new Map([
    ['sanguinamento', 'bleeding'],
    ['sanguinare', 'bleeding'],
    ['tagliente', 'slashing'],
    ['taglio', 'slashing'],
    ['perforante', 'piercing'],
    ['perforazione', 'piercing'],
    ['contundente', 'bludgeoning'],
    ['fuoco', 'fire'],
    ['fiamme', 'fire'],
    ['ghiaccio', 'ice'],
    ['gelo', 'ice'],
    ['elettricita', 'electricity'],
    ['elettricità', 'electricity'],
    ['veleno', 'poison'],
    ['veleni', 'poison'],
    ['stordimento', 'stun'],
    ['stordire', 'stun'],
    ['elementale', 'elemental']
]);

const stats = {
    filesChanged: 0,
    skillsMoved: 0,
    defensesSet: 0,
    attacksCompleted: 0,
    reliabilitySet: 0,
    automatedArraysEnsured: 0,
    textResistancesMigrated: 0,
    textImmunitiesMigrated: 0,
    contradictionsRemoved: 0
};

function listJsonFiles(dir) {
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(dir, file));
}

function numberValue(value) {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && typeof value.value === 'number') return value.value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function statValue(actor, stat) {
    return numberValue(actor.system?.stats?.[stat]);
}

function skillValue(actor, skill) {
    const group = SKILL_GROUP[skill];
    return numberValue(actor.system?.skills?.[group]?.[skill]);
}

function setArray(system, key) {
    if (Array.isArray(system[key])) return system[key];
    system[key] = [];
    stats.automatedArraysEnsured++;
    return system[key];
}

function addUnique(list, value) {
    if (!value || list.includes(value)) return false;
    list.push(value);
    return true;
}

function normalizeText(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function tokensFromText(text) {
    const normalized = normalizeText(text);
    const values = [];
    for (const [token, value] of TEXT_TOKEN_MAP) {
        const normalizedToken = normalizeText(token);
        if (normalized.includes(normalizedToken) && !values.includes(value)) values.push(value);
    }
    return values;
}

function normalizeSkillGroups(actor) {
    const skills = actor.system?.skills;
    if (!skills || typeof skills !== 'object') return;

    for (const group of ['int', 'ref', 'dex', 'body', 'emp', 'cra', 'will']) {
        if (!skills[group] || typeof skills[group] !== 'object') skills[group] = {};
    }

    for (const [currentGroup, groupSkills] of Object.entries(skills)) {
        if (!groupSkills || typeof groupSkills !== 'object') continue;
        for (const [skill, data] of Object.entries({ ...groupSkills })) {
            const expectedGroup = SKILL_GROUP[skill];
            if (!expectedGroup || expectedGroup === currentGroup) continue;

            const existing = skills[expectedGroup][skill];
            if (!existing || numberValue(data) > numberValue(existing)) {
                skills[expectedGroup][skill] = data;
            }
            delete groupSkills[skill];
            stats.skillsMoved++;
        }
    }
}

function setDefenses(actor) {
    const system = actor.system;
    if (!system) return;

    const desired = {
        dodgeBase: statValue(actor, 'ref') + skillValue(actor, 'dodge'),
        repositionBase: statValue(actor, 'dex') + skillValue(actor, 'athletics'),
        blockBase: statValue(actor, 'ref') + skillValue(actor, 'brawling')
    };

    for (const [key, value] of Object.entries(desired)) {
        if (system[key] !== undefined && system[key] !== null && system[key] !== '') continue;
        if (system[key] === value) continue;
        system[key] = value;
        stats.defensesSet++;
    }
}

function bestNaturalSkill(actor) {
    const candidates = ['melee', 'brawling', 'swordsmanship'];
    let best = 'melee';
    let bestValue = -1;
    for (const skill of candidates) {
        const value = skillValue(actor, skill);
        if (value > bestValue) {
            best = skill;
            bestValue = value;
        }
    }
    return best;
}

function attackSkillForWeapon(actor, weapon) {
    const system = weapon.system || {};
    if (system.meleeAttackSkill) return { option: 'melee', skill: system.meleeAttackSkill };
    if (system.rangedAttackSkill) return { option: 'ranged', skill: system.rangedAttackSkill };
    if (system.attackSkill) {
        const option = RANGED_SKILLS.has(system.attackSkill) ? 'ranged' : 'melee';
        return { option, skill: system.attackSkill };
    }

    const categorySkill = CATEGORY_SKILL[system.category];
    if (categorySkill) {
        const option = RANGED_SKILLS.has(categorySkill) ? 'ranged' : 'melee';
        return { option, skill: categorySkill };
    }

    return { option: 'melee', skill: bestNaturalSkill(actor) };
}

function completeWeapon(actor, weapon) {
    if (weapon.type !== 'weapon') return;
    if (!weapon.system || typeof weapon.system !== 'object') weapon.system = {};
    const system = weapon.system;
    const { option, skill } = attackSkillForWeapon(actor, weapon);

    if (!Array.isArray(system.attackOptions) || !system.attackOptions.includes(option)) {
        system.attackOptions = [option];
        stats.attacksCompleted++;
    }

    if (option === 'melee' && system.meleeAttackSkill !== skill) {
        system.meleeAttackSkill = skill;
        if (system.rangedAttackSkill === undefined) system.rangedAttackSkill = '';
        stats.attacksCompleted++;
    }
    if (option === 'ranged' && system.rangedAttackSkill !== skill) {
        system.rangedAttackSkill = skill;
        if (system.meleeAttackSkill === undefined) system.meleeAttackSkill = '';
        stats.attacksCompleted++;
    }

    const stat = RANGED_SKILLS.has(skill) ? 'dex' : 'ref';
    if (system.attackBase === undefined || system.attackBase === null || system.attackBase === '') {
        system.attackBase = statValue(actor, stat) + skillValue(actor, skill);
        stats.attacksCompleted++;
    }

    if (system.reliability === undefined || system.reliability === null || system.reliability === '') {
        system.reliability = 0;
        stats.reliabilitySet++;
    }
    if (system.reliabilityMax === undefined || system.reliabilityMax === null || system.reliabilityMax === '') {
        system.reliabilityMax = Number(system.reliability) || 0;
        stats.reliabilitySet++;
    }
}

function normalizeAutomatedDefenses(actor) {
    const system = actor.system || {};
    const resistances = setArray(system, 'automatedResistances');
    const vulnerabilities = setArray(system, 'automatedVulnerabilities');
    const immunities = setArray(system, 'automatedImmunities');

    for (const value of tokensFromText(system.resistances)) {
        if (addUnique(resistances, value)) stats.textResistancesMigrated++;
    }
    if (tokensFromText(system.resistances).length > 0) system.resistances = '';

    for (const value of tokensFromText(system.immunities)) {
        if (addUnique(immunities, value)) stats.textImmunitiesMigrated++;
    }
    if (tokensFromText(system.immunities).length > 0) system.immunities = '';

    for (let i = resistances.length - 1; i >= 0; i--) {
        if (!immunities.includes(resistances[i])) continue;
        resistances.splice(i, 1);
        stats.contradictionsRemoved++;
    }

    system.automatedResistances = [...new Set(resistances)].sort();
    system.automatedVulnerabilities = [...new Set(vulnerabilities)].sort();
    system.automatedImmunities = [...new Set(immunities)].sort();
}

for (const relativeDir of PACK_DIRS) {
    const dir = path.join(ROOT, relativeDir);
    for (const file of listJsonFiles(dir)) {
        const before = fs.readFileSync(file, 'utf8');
        const actor = JSON.parse(before);

        normalizeSkillGroups(actor);
        setDefenses(actor);
        normalizeAutomatedDefenses(actor);
        for (const item of actor.items || []) completeWeapon(actor, item);

        const after = JSON.stringify(actor, null, 4) + '\n';
        if (after !== before) {
            fs.writeFileSync(file, after, 'utf8');
            stats.filesChanged++;
        }
    }
}

console.log(JSON.stringify(stats, null, 2));
