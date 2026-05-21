import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), '_tools', 'src-packs');
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

async function main() {
  const files = await walk(ROOT);
  const sourceItems = new Map();
  const duplicates = new Set();

  for (const file of files) {
    if (file.startsWith(BESTIARY_ROOT)) continue;
    try {
      const text = await fs.readFile(file, 'utf8');
      const data = JSON.parse(text);
      if (!data?.name || !data?.type) continue;
      const key = itemKey(data.name, data.type, data.system);
      if (sourceItems.has(key)) duplicates.add(key);
      else sourceItems.set(key, data);
    } catch {
      // ignore
    }
  }

  const mismatches = [];
  for (const file of await walk(BESTIARY_ROOT)) {
    try {
      const text = await fs.readFile(file, 'utf8');
      const data = JSON.parse(text);
      if (!Array.isArray(data.items)) continue;
      for (const item of data.items) {
        if (!item?.name || !item?.type || !item?._id) continue;
        const key = itemKey(item.name, item.type, item.system);
        const source = sourceItems.get(key);
        if (!source) continue;
        if (source._id && item._id !== source._id) {
          mismatches.push({ file: path.relative(process.cwd(), file), name: item.name, type: item.type, sourceId: source._id, embedId: item._id });
        }
      }
    } catch {
      // ignore
    }
  }

  console.log(`checked ${mismatches.length === 0 ? 'all matched' : `${mismatches.length} mismatches`} `);
  if (mismatches.length) console.log(JSON.stringify(mismatches.slice(0, 50), null, 2));
  if (duplicates.size) {
    console.warn('duplicates found for source item keys:');
    for (const key of duplicates) console.warn(`  - ${key}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
