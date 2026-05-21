import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), '_tools', 'src-packs');
const BACKUP_ROOT = path.join(process.cwd(), '_tools', 'src-packs-backup');
const BESTIARY_ROOT = path.join(ROOT, 'BESTIARIO');

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

function normalizeKeyPart(value) {
  return String(value || '').trim().toLowerCase();
}

function itemKey(name, type, system) {
  let key = `${normalizeKeyPart(name)}|${normalizeKeyPart(type)}`;
  if (system && typeof system === 'object') {
    const extras = [];
    if (system.class) extras.push(normalizeKeyPart(system.class));
    if (system.category) extras.push(normalizeKeyPart(system.category));
    if (system.source) extras.push(normalizeKeyPart(system.source));
    if (system.sourcebook) extras.push(normalizeKeyPart(system.sourcebook));
    if (system.attackOptions && Array.isArray(system.attackOptions)) extras.push(system.attackOptions.map(normalizeKeyPart).join(','));
    if (extras.length) key += `|${extras.join('|')}`;
  }
  return key;
}

async function loadSourceItems() {
  const files = await walk(ROOT);
  const map = new Map();
  const duplicates = new Set();

  for (const file of files) {
    if (file.startsWith(BESTIARY_ROOT)) continue;
    try {
      const raw = await fs.readFile(file, 'utf8');
      const data = JSON.parse(raw);
      if (!data?.name || !data?.type) continue;
      const key = itemKey(data.name, data.type, data.system);
      if (map.has(key)) {
        duplicates.add(key);
        continue;
      }
      map.set(key, data);
    } catch {
      // ignore invalid JSON
    }
  }

  return { map, duplicates };
}

async function main() {
  await fs.mkdir(BACKUP_ROOT, { recursive: true });
  const { map: sourceMap, duplicates } = await loadSourceItems();
  if (duplicates.size > 0) {
    console.warn('Warnings: duplicate source items found for the following name|type keys:');
    for (const key of duplicates) console.warn(`  - ${key}`);
  }

  const files = await walk(BESTIARY_ROOT);
  const changedFiles = [];

  for (const file of files) {
    let raw = await fs.readFile(file, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.items)) continue;

    let changed = false;
    for (let i = 0; i < data.items.length; i += 1) {
      const item = data.items[i];
      if (!item?.name || !item?.type) continue;
      const key = itemKey(item.name, item.type, item.system);
      const sourceItem = sourceMap.get(key);
      if (!sourceItem) continue;
      const sourceClone = JSON.parse(JSON.stringify(sourceItem));
      sourceClone._id = sourceItem._id;
      data.items[i] = sourceClone;
      changed = true;
    }

    if (changed) {
      const backupPath = path.join(BACKUP_ROOT, path.relative(ROOT, file));
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, raw, 'utf8');
      await fs.writeFile(file, JSON.stringify(data, null, 4) + '\n', 'utf8');
      changedFiles.push(path.relative(process.cwd(), file));
    }
  }

  console.log(`Synchronized ${changedFiles.length} BESTIARIO files with source items.`);
  if (changedFiles.length > 0) {
    changedFiles.slice(0, 200).forEach(file => console.log(`  - ${file}`));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
