import { ClassicLevel } from 'classic-level';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const SRC_DIR = path.join(REPO_ROOT, '_tools/src-packs/EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons');
const DEST_DIR = path.join(REPO_ROOT, 'witcher-compendium/packs/EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons');

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.json'));
const entries = files.map(f => JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8').replace(/^\uFEFF/, '')));

console.log(`📂 Source: ${SRC_DIR}`);
console.log(`📦 Entries found: ${entries.length}`);

if (fs.existsSync(DEST_DIR)) fs.rmSync(DEST_DIR, { recursive: true, force: true });
fs.mkdirSync(DEST_DIR, { recursive: true });

const db = new ClassicLevel(DEST_DIR, { valueEncoding: 'json', compression: false });
await db.open();
const ops = entries.map(e => ({ type: 'put', key: `!items!${e._id}`, value: e }));
await db.batch(ops);
await db.compactRange('\x00', '\xff');
await db.close();
console.log(`✅ Done! Compiled ${entries.length} entries into witcher-weapons pack.`);
