import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PACK_DIRS = [
    '_tools/src-packs/BESTIARIO/witcher-animals',
    '_tools/src-packs/BESTIARIO/witcher-monsters',
    '_tools/src-packs/BESTIARIO/witcher-characters'
];

function deterministicId(...parts) {
    return crypto.createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 16);
}

function idFromFilename(file) {
    const match = path.basename(file).match(/_([A-Za-z0-9]{16})\.json$/);
    return match?.[1] ?? null;
}

function withIdFirst(object, id) {
    const { _id, ...rest } = object;
    return { _id: id ?? _id, ...rest };
}

let changedFiles = 0;
let addedTopIds = 0;
let movedTopIds = 0;
let addedItemIds = 0;
let movedItemIds = 0;
const mismatches = [];

for (const dir of PACK_DIRS) {
    const fullDir = path.join(ROOT, dir);
    for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

        const file = path.join(fullDir, entry.name);
        const original = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(original);
        const fileId = idFromFilename(file);
        const originalTopKeys = Object.keys(data);

        if (!data._id && fileId) {
            data._id = fileId;
            addedTopIds++;
        }

        if (fileId && data._id && data._id !== fileId) {
            mismatches.push(`${path.relative(ROOT, file)}: file=${fileId}, json=${data._id}`);
        }

        let nextData = data;
        if (data._id && originalTopKeys[0] !== '_id') {
            nextData = withIdFirst(data, data._id);
            movedTopIds++;
        }

        if (Array.isArray(nextData.items)) {
            const used = new Set(nextData.items.map(item => item?._id).filter(Boolean));
            nextData.items = nextData.items.map((item, index) => {
                if (!item || typeof item !== 'object') return item;

                let nextItem = item;
                if (!item._id) {
                    let id = deterministicId(nextData._id ?? fileId ?? entry.name, index + 1, item.name ?? '', item.type ?? '');
                    let salt = 1;
                    while (used.has(id)) {
                        id = deterministicId(nextData._id ?? fileId ?? entry.name, index + 1, item.name ?? '', item.type ?? '', salt++);
                    }
                    used.add(id);
                    nextItem = withIdFirst(item, id);
                    addedItemIds++;
                } else if (Object.keys(item)[0] !== '_id') {
                    nextItem = withIdFirst(item, item._id);
                    movedItemIds++;
                }
                return nextItem;
            });
        }

        const updated = `${JSON.stringify(nextData, null, 4)}\n`;
        if (updated !== original) {
            fs.writeFileSync(file, updated, 'utf8');
            changedFiles++;
        }
    }
}

console.log(`Changed files: ${changedFiles}`);
console.log(`Top-level ids added: ${addedTopIds}`);
console.log(`Top-level ids moved first: ${movedTopIds}`);
console.log(`Embedded item ids added: ${addedItemIds}`);
console.log(`Embedded item ids moved first: ${movedItemIds}`);
if (mismatches.length) {
    console.log('Filename/json id mismatches:');
    for (const mismatch of mismatches) console.log(`- ${mismatch}`);
}
