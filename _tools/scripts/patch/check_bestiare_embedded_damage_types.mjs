import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), '_tools', 'src-packs', 'BESTIARIO');

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

async function main() {
  const files = await walk(ROOT);
  const issues = [];
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.items)) continue;
    data.items.forEach(item => {
      if (item?.system?.damage && typeof item.system.damage === 'string' && !item.system.damageType) {
        issues.push({file: path.relative(process.cwd(), file), actor: data.name, item: item.name, damage: item.system.damage});
      }
    });
  }
  if (issues.length === 0) {
    console.log('No embedded BESTIARIO items missing damageType.');
  } else {
    console.log(`Still missing damageType on ${issues.length} embedded items:`);
    issues.slice(0, 200).forEach(i => console.log(JSON.stringify(i)));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
