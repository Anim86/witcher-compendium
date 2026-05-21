import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), '_tools', 'src-packs');
const BACKUP_ROOT = path.join(process.cwd(), '_tools', 'src-packs-backup');
const BESTIARY_ROOT = path.join(ROOT, 'BESTIARIO');

function inferDamageTypeFromFlags(typeObj) {
  if (!typeObj || typeof typeObj !== 'object') return null;
  if (typeObj.piercing) return 'piercing';
  if (typeObj.slashing) return 'slashing';
  if (typeObj.bludgeoning) return 'bludgeoning';
  if (typeObj.elemental) return 'elemental';
  return null;
}

function inferDamageTypeFromName(name) {
  if (!name || typeof name !== 'string') return null;
  const low = name.toLowerCase();
  if (/(morso|becco|aculei|pugnale|stiletto|coltelli|balestrino|arco|frecc|dardo|lancia|giavellotto|incornata)/.test(low)) return 'piercing';
  if (/(artigli|artiglio|spada|falchion|scimitarra|machete|katana|spadone|lama|sciabola|ascia|alabarda|corna|frusta|spazzata|coda|testata|calcio|chele|lancio masso|colpo d'ala|colpo d ala|colpo della coda)/.test(low)) return 'slashing';
  if (/(zoccoli|pugno|pugni|bastone|martello|mazza|clava|randello|mazzaforte|mazzino|lancio masso|testata|calcio)/.test(low)) return 'bludgeoning';
  if (/(fuoco|ghiaccio|elettr|elemental|magia|energia)/.test(low)) return 'elemental';
  return 'slashing';
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(res));
    else if (entry.isFile() && res.endsWith('.json')) files.push(res);
  }
  return files;
}

async function loadCanonicalDamageTypes() {
  const files = await walk(ROOT);
  const map = new Map();
  for (const file of files) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const data = JSON.parse(raw);
      if (data?.name && data?.system) {
        if (data.system.damageType) {
          map.set(data.name, data.system.damageType);
          continue;
        }
        const inferred = inferDamageTypeFromFlags(data.system.type);
        if (inferred) map.set(data.name, inferred);
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return map;
}

async function main() {
  await fs.mkdir(BACKUP_ROOT, { recursive: true });
  const canonical = await loadCanonicalDamageTypes();
  const files = await walk(BESTIARY_ROOT);
  const changes = [];

  for (const file of files) {
    let raw = await fs.readFile(file, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.items)) continue;
    let changed = false;
    for (const item of data.items) {
      if (!item?.system) continue;
      if (typeof item.system.damage === 'string' && item.system.damage.trim() !== '' && item.system.damageType == null) {
        let damageType = canonical.get(item.name);
        if (!damageType) damageType = inferDamageTypeFromFlags(item.system.type);
        if (!damageType) damageType = inferDamageTypeFromName(item.name);
        if (damageType) {
          item.system.damageType = damageType;
          changed = true;
          changes.push({file: path.relative(process.cwd(), file), actor: data.name, item: item.name, damage: item.system.damage, damageType});
        }
      }
    }
    if (changed) {
      const backupPath = path.join(BACKUP_ROOT, path.relative(ROOT, file));
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, raw, 'utf8');
      await fs.writeFile(file, JSON.stringify(data, null, 4) + '\n', 'utf8');
    }
  }

  console.log(`Patched ${changes.length} embedded items.`);
  for (const change of changes) {
    console.log(`${change.file}: [${change.actor}] ${change.item} => ${change.damageType}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
