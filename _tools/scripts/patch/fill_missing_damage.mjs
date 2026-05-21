import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), '_tools', 'src-packs');
const BACKUP = path.join(process.cwd(), '_tools', 'src-packs-backup');

async function walk(dir) {
  let files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await walk(res));
    else if (entry.isFile() && res.endsWith('.json')) files.push(res);
  }
  return files;
}

function isNA(val) {
  if (val === null || val === undefined) return true;
  if (typeof val !== 'string') return false;
  return val.trim().toUpperCase() === 'N/A' || val.trim() === '';
}

async function main() {
  await fs.mkdir(BACKUP, { recursive: true });
  const files = await walk(ROOT);
  const nameToDamage = new Map();

  // First pass: collect canonical damage formulas from weapon/equipment files and top-level items
  for (const file of files) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const data = JSON.parse(raw);

      // Top-level object with damage
      if (data?.system?.damage && !isNA(data.system.damage) && data.type === 'weapon') {
        if (!nameToDamage.has(data.name)) nameToDamage.set(data.name, data.system.damage);
      }

      // Items array inside an actor/monster
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item?.system?.damage && !isNA(item.system.damage) && (item.type === 'weapon' || item.type === 'item')) {
            if (!nameToDamage.has(item.name)) nameToDamage.set(item.name, item.system.damage);
          }
        }
      }
    } catch (err) {
      console.error('Skipping (parse error):', file, err.message);
    }
  }

  // Second pass: update N/A damage using map
  const changes = [];
  for (const file of files) {
    let changed = false;
    try {
      const raw = await fs.readFile(file, 'utf8');
      const data = JSON.parse(raw);

      // backup original
      const rel = path.relative(ROOT, file);
      const backupPath = path.join(BACKUP, rel);
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, raw, 'utf8');

      // Top-level
      if (data?.system?.damage && isNA(data.system.damage)) {
        const replacement = nameToDamage.get(data.name);
        if (replacement) {
          data.system.damage = replacement;
          changed = true;
          changes.push({ file: rel, name: data.name, old: 'N/A', new: replacement });
        }
      }

      // Items array
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item?.system?.damage && isNA(item.system.damage)) {
            const replacement = nameToDamage.get(item.name);
            if (replacement) {
              item.system.damage = replacement;
              changed = true;
              changes.push({ file: rel, name: item.name, old: 'N/A', new: replacement });
            }
          }
        }
      }

      if (changed) {
        await fs.writeFile(file, JSON.stringify(data, null, 4) + '\n', 'utf8');
      }
    } catch (err) {
      console.error('Skipping (error):', file, err.message);
    }
  }

  console.log('Done. Replacements:', changes.length);
  for (const c of changes) console.log(`- ${c.file}: ${c.name} -> ${c.new}`);
}

main().catch(err => { console.error(err); process.exit(1); });
