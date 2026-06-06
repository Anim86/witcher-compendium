#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const BESTIARY_DIRS = [
  '_tools/src-packs/BESTIARIO/witcher-animals',
  '_tools/src-packs/BESTIARIO/witcher-monsters',
];

const SOURCE_DIRS = {
  MB: 'Manuali/Witcher-v1.3_Estrazione/Testi',
  DW: 'Manuali/Diario di un Witcher_Estrazione/Testi',
  TC: 'Manuali/the-witcher-tomo-del-caos_Estrazione/Testi',
  LR: 'Manuali/Witcher - Libro dei Racconti (italian)_Estrazione/Testi',
  MS: 'Manuali/DLC/The-Witcher-DLC-Mostri-sulla-Strada_Estrazione/Testi',
  VS: 'Manuali/DLC/The-Witcher-DLC-Viaggiatori-sulla-Strada_Estrazione/Testi',
};

const SOURCEBOOK_FALLBACKS = new Map([
  ['alp_98a5d96883ceea1f.json', 'MS 4'],
  ['gatto_mannaro_b15180fc4f723850.json', 'MS 6'],
  ['glustyworp_0275fca75d31b216.json', 'MS 8'],
  ['armatura_marionetta_b0d266ed3861ded7.json', 'LR 18'],
  ['cultista_del_coram_agh_tera_418c67ecf457abcb.json', 'LR 18'],
  ['la_damigella_circondata_di_farfalle_5d75b59543f2c2c3.json', 'LR 18'],
  ['contrabbandiere_5ce4763143d24f7b.json', 'VS 8'],
  ['scout_e5e302f2e54a41d4.json', 'VS 6'],
  ['corriere_6b97c66525e348b6.json', 'VS 4'],
]);

const ISSUE_META = {
  JSON_INVALID: { severity: 100, title: 'JSON non valido' },
  SOURCEBOOK_MISSING: { severity: 95, title: 'sourcebook mancante' },
  SOURCE_PAGE_MISSING: { severity: 90, title: 'pagina sorgente non risolta' },
  STAT_BLOCK_EMPTY: { severity: 85, title: 'stat block vuoto o quasi vuoto' },
  ATTACKS_IN_SOURCE_NO_WEAPONS: { severity: 80, title: 'attacchi nel manuale ma nessuna arma' },
  ATTACKS_IN_SOURCE_WEAPON_BASE_MISSING: { severity: 75, title: 'armi senza ATT Base' },
  LOOT_IN_SOURCE_NO_LOOT_ITEMS: { severity: 70, title: 'bottino nel manuale ma nessun item loot' },
  CAPABILITIES_IN_SOURCE_NO_ABILITY_ITEMS: { severity: 65, title: 'capacita nel manuale ma nessun item ability' },
  COMMON_LORE_MISSING: { severity: 55, title: 'superstizione comune mancante' },
  MONSTER_LORE_MISSING: { severity: 55, title: 'conoscenza/comportamento mancante' },
  PHYSICALS_MISSING: { severity: 45, title: 'dati fisici/ambiente incompleti' },
  RESISTANCES_IN_SOURCE_EMPTY_AUTOMATED: { severity: 40, title: 'resistenze sorgente non automatizzate' },
  IMMUNITIES_IN_SOURCE_EMPTY_AUTOMATED: { severity: 40, title: 'immunita sorgente non automatizzate' },
  VULNERABILITIES_IN_SOURCE_EMPTY: { severity: 35, title: 'vulnerabilita sorgente non registrate' },
  LEGACY_RESISTANCE_TEXT: { severity: 25, title: 'resistenze/immunita ancora testuali' },
  VULNERABILITY_TEXT_NOT_AUTOMATED: { severity: 20, title: 'vulnerabilita testuale non automatizzata' },
};

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function listJsonFiles(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(abs, entry.name);
    if (entry.isDirectory()) return listJsonFiles(path.join(dir, entry.name));
    return entry.isFile() && entry.name.endsWith('.json') ? [file] : [];
  });
}

function fold(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function valueOfStat(node) {
  if (typeof node === 'number') return node;
  if (node && typeof node.value === 'number') return node.value;
  if (node && typeof node.value === 'string') return Number(node.value) || 0;
  return 0;
}

function nonBlank(value) {
  if (Array.isArray(value)) return value.length > 0;
  return String(value ?? '').trim().length > 0;
}

function sourcebookOf(file, system) {
  const raw = String(system.sourcebook ?? '').trim();
  const fallback = SOURCEBOOK_FALLBACKS.get(path.basename(file)) || '';
  if (!raw) return fallback;
  if (!fallback) return raw;
  if (parseSourceRefs(raw).length === 0) return fallback;
  return `${raw} / ${fallback}`;
}

function parseSourceRefs(sourcebook) {
  const refs = [];
  const pattern = /\b([A-Z]{2})\s*(?:p\.?|pag\.?)?\s*(\d{1,3})\b/g;
  let match;
  while ((match = pattern.exec(sourcebook)) !== null) {
    refs.push({ code: match[1], page: Number(match[2]) });
  }
  return refs;
}

function sourceFilesForRef(ref) {
  const dir = SOURCE_DIRS[ref.code];
  if (!dir) return [];
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return [];
  const pagePattern = new RegExp(`^Pag0*${ref.page}(?:_|\\b)`, 'i');
  return fs
    .readdirSync(absDir)
    .filter((name) => pagePattern.test(name))
    .map((name) => path.join(absDir, name));
}

const SECTION_LABELS = [
    'resistenze',
    'immunita',
    'vulnerabilita',
    'armatura',
    'schivare',
    'riposizionare',
    'blocco',
    'altezza',
    'peso',
    'ambiente',
    'organizzazione',
    'bottino',
    'superstizione',
    'conoscenza',
    'attacchi',
  'capacita',
];

function sectionHasValue(folded, label) {
  const lines = folded.split(/\r?\n/).map((line) => line.replace(/\s+/g, ' ').trim());
  const statLine = /^(int|rif|des|fis|vel|emp|man|vol|gri|cor|bal|res|ing|rec|ps|pda)\b\s*[\d-]/;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith(label)) continue;
    const fragments = [];
    const inlineValue = line.slice(label.length).replace(/[|:]/g, ' ').trim();
    if (inlineValue) fragments.push(inlineValue);
    for (let j = i + 1; j < Math.min(lines.length, i + 9); j += 1) {
      const candidate = lines[j];
      if (!candidate) continue;
      if (SECTION_LABELS.some((next) => next !== label && candidate.startsWith(next))) break;
      if (statLine.test(candidate)) continue;
      fragments.push(candidate);
    }
    const value = fragments.join(' ').trim();
    if (!value) return false;
    if (/^[\s\-–—]+$/.test(value)) return false;
    if (/\b(nessuna|nessuno|na|n\/a)\b/.test(value)) return false;
    return /[a-z]/.test(value);
  }
  return false;
}

function sourceSignals(text) {
  const f = fold(text);
  return {
    hasStatBlock: /\bint\b[\s\S]{0,360}\brif\b[\s\S]{0,360}\bdes\b/.test(f) || /\bcor\b[\s\S]{0,240}\bbal\b[\s\S]{0,240}\bps\b/.test(f),
    hasAttacks: f.includes('attacchi') && (f.includes('att base') || f.includes('n att')),
    hasLoot: f.includes('bottino'),
    hasCapabilities: /(^|\n)\s*capacita[:\s]/.test(f),
    hasCommonLore: f.includes('superstizione comune'),
    hasMonsterLore: f.includes('conoscenza dei witcher') || f.includes('conoscenza e comportamento'),
    hasPhysicals: f.includes('altezza') || f.includes('ambiente') || f.includes('organizzazione'),
    hasResistanceValue: sectionHasValue(f, 'resistenze'),
    hasImmunityValue: sectionHasValue(f, 'immunita'),
    hasVulnerabilityValue: sectionHasValue(f, 'vulnerabilita'),
  };
}

function resolveSource(sourcebook) {
  const refs = parseSourceRefs(sourcebook);
  const candidates = [];
  for (const ref of refs) {
    for (const file of sourceFilesForRef(ref)) {
      const text = fs.readFileSync(file, 'utf8');
      const signals = sourceSignals(text);
      const score = [
        signals.hasStatBlock,
        signals.hasAttacks,
        signals.hasLoot,
        signals.hasCapabilities,
        signals.hasCommonLore,
        signals.hasMonsterLore,
      ].filter(Boolean).length;
      candidates.push({ ref, file, text, signals, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return { refs, selected: candidates[0], candidates };
}

function jsonSignals(data) {
  const system = data.system ?? data.data ?? {};
  const items = Array.isArray(data.items) ? data.items : [];
  const stats = system.stats ?? {};
  const statKeys = ['int', 'ref', 'dex', 'body', 'spd', 'emp', 'cra', 'will'];
  const statValues = statKeys.map((key) => valueOfStat(stats[key]));
  const nonZeroStats = statValues.filter((value) => value > 0).length;
  const weapons = items.filter((item) => item.type === 'weapon');
  const abilities = items.filter((item) => item.type === 'ability');
  const loot = items.filter((item) => {
    if (!['component', 'valuable'].includes(item.type)) return false;
    return !/^trofeo\b/i.test(String(item.name ?? '').trim());
  });
  const weaponAttackBases = weapons.map((item) => valueOfStat((item.system ?? {}).attackBase));
  return {
    system,
    items,
    weapons,
    abilities,
    loot,
    nonZeroStats,
    automatedResistances: Array.isArray(system.automatedResistances) ? system.automatedResistances : [],
    automatedVulnerabilities: Array.isArray(system.automatedVulnerabilities) ? system.automatedVulnerabilities : [],
    automatedImmunities: Array.isArray(system.automatedImmunities) ? system.automatedImmunities : [],
    hasWeaponAttackBase: weapons.length > 0 && weaponAttackBases.some((value) => value > 0),
    hasCommonLore: nonBlank(system.common) && nonBlank(system.commonSkillValue),
    hasMonsterLore: nonBlank(system.monsterLore) && nonBlank(system.monsterLoreSkillValue),
    physicalsComplete: ['height', 'weight', 'environment', 'organization'].every((key) => nonBlank(system[key])),
    legacyResistanceText: nonBlank(system.resistances) || nonBlank(system.immunities),
    vulnerabilityText: String(system.vulnerability ?? '').trim(),
  };
}

function pushIssue(issues, code, detail = '') {
  issues.push({
    code,
    severity: ISSUE_META[code]?.severity ?? 0,
    title: ISSUE_META[code]?.title ?? code,
    detail,
  });
}

function auditFile(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return {
      file,
      name: path.basename(file),
      issues: [{ code: 'JSON_INVALID', severity: 100, title: ISSUE_META.JSON_INVALID.title, detail: error.message }],
    };
  }

  const json = jsonSignals(data);
  const sourcebook = sourcebookOf(file, json.system);
  const source = resolveSource(sourcebook);
  const issues = [];

  if (!sourcebook) {
    pushIssue(issues, 'SOURCEBOOK_MISSING');
  } else if (source.refs.length === 0 || !source.selected) {
    pushIssue(issues, 'SOURCE_PAGE_MISSING', sourcebook);
  }

  if (source.selected) {
    const signals = source.selected.signals;
    if (signals.hasStatBlock && json.nonZeroStats <= 1) pushIssue(issues, 'STAT_BLOCK_EMPTY', `${json.nonZeroStats} statistiche non-zero`);
    if (signals.hasAttacks && json.weapons.length === 0) pushIssue(issues, 'ATTACKS_IN_SOURCE_NO_WEAPONS');
    if (signals.hasAttacks && json.weapons.length > 0 && !json.hasWeaponAttackBase) pushIssue(issues, 'ATTACKS_IN_SOURCE_WEAPON_BASE_MISSING');
    if (signals.hasLoot && json.loot.length === 0) pushIssue(issues, 'LOOT_IN_SOURCE_NO_LOOT_ITEMS');
    if (signals.hasCapabilities && json.abilities.length === 0) pushIssue(issues, 'CAPABILITIES_IN_SOURCE_NO_ABILITY_ITEMS');
    if (signals.hasCommonLore && !json.hasCommonLore) pushIssue(issues, 'COMMON_LORE_MISSING');
    if (signals.hasMonsterLore && !json.hasMonsterLore) pushIssue(issues, 'MONSTER_LORE_MISSING');
    if (signals.hasPhysicals && !json.physicalsComplete) pushIssue(issues, 'PHYSICALS_MISSING');
    if (signals.hasResistanceValue && json.automatedResistances.length === 0) pushIssue(issues, 'RESISTANCES_IN_SOURCE_EMPTY_AUTOMATED');
    if (signals.hasImmunityValue && json.automatedImmunities.length === 0) pushIssue(issues, 'IMMUNITIES_IN_SOURCE_EMPTY_AUTOMATED');
    if (signals.hasVulnerabilityValue && !json.vulnerabilityText && json.automatedVulnerabilities.length === 0) pushIssue(issues, 'VULNERABILITIES_IN_SOURCE_EMPTY');
  }

  if (json.legacyResistanceText) pushIssue(issues, 'LEGACY_RESISTANCE_TEXT');
  if (json.vulnerabilityText && json.automatedVulnerabilities.length === 0) {
    pushIssue(issues, 'VULNERABILITY_TEXT_NOT_AUTOMATED', json.vulnerabilityText);
  }

  issues.sort((a, b) => b.severity - a.severity || a.code.localeCompare(b.code));

  return {
    file,
    name: data.name ?? path.basename(file),
    sourcebook,
    sourcePage: source.selected ? rel(source.selected.file) : '',
    sourceSignals: source.selected?.signals ?? {},
    jsonSummary: {
      stats: json.nonZeroStats,
      weapons: json.weapons.length,
      abilities: json.abilities.length,
      loot: json.loot.length,
      automatedResistances: json.automatedResistances.length,
      automatedVulnerabilities: json.automatedVulnerabilities.length,
      automatedImmunities: json.automatedImmunities.length,
    },
    issues,
  };
}

function issueCounts(results) {
  const counts = new Map();
  for (const result of results) {
    for (const issue of result.issues) {
      counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([code, count]) => ({ code, count, severity: ISSUE_META[code]?.severity ?? 0, title: ISSUE_META[code]?.title ?? code }))
    .sort((a, b) => b.severity - a.severity || b.count - a.count || a.code.localeCompare(b.code));
}

function formatReport(results) {
  const withIssues = results.filter((result) => result.issues.length > 0);
  const lines = [];
  lines.push('# Audit contenutistico bestiario');
  lines.push('');
  lines.push(`File controllati: ${results.length}`);
  lines.push(`File con segnalazioni: ${withIssues.length}`);
  lines.push('');
  lines.push('## Conteggio problemi');
  lines.push('');
  lines.push('| Codice | N | Significato |');
  lines.push('| --- | ---: | --- |');
  for (const row of issueCounts(results)) {
    lines.push(`| ${row.code} | ${row.count} | ${row.title} |`);
  }
  lines.push('');
  lines.push('## Dettaglio');
  lines.push('');
  for (const result of withIssues.sort((a, b) => (b.issues[0]?.severity ?? 0) - (a.issues[0]?.severity ?? 0) || rel(a.file).localeCompare(rel(b.file)))) {
    lines.push(`### ${result.name}`);
    lines.push('');
    lines.push(`- File: \`${rel(result.file)}\``);
    lines.push(`- Sourcebook: \`${result.sourcebook || '(mancante)'}\``);
    lines.push(`- Pagina risolta: \`${result.sourcePage || '(nessuna)'}\``);
    lines.push(`- JSON: stats ${result.jsonSummary.stats}, armi ${result.jsonSummary.weapons}, ability ${result.jsonSummary.abilities}, loot ${result.jsonSummary.loot}, res/vuln/imm auto ${result.jsonSummary.automatedResistances}/${result.jsonSummary.automatedVulnerabilities}/${result.jsonSummary.automatedImmunities}`);
    lines.push('- Problemi:');
    for (const issue of result.issues) {
      lines.push(`  - ${issue.code}: ${issue.title}${issue.detail ? ` (${issue.detail})` : ''}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

const results = BESTIARY_DIRS.flatMap(listJsonFiles).map(auditFile);
const withIssues = results.filter((result) => result.issues.length > 0);
const counts = issueCounts(results);

console.log(`File controllati: ${results.length}`);
console.log(`File con segnalazioni: ${withIssues.length}`);
for (const row of counts) {
  console.log(`${row.code}: ${row.count}`);
}

const reportPath = path.join(ROOT, '_tools/reports/bestiario_content_audit.md');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, formatReport(results), 'utf8');
console.log(`Report: ${rel(reportPath)}`);
