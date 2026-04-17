const fs = require('fs');

const en = JSON.parse(fs.readFileSync('./TheWitcherItaNewSystem/lang/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('./TheWitcherItaNewSystem/lang/it.json', 'utf8'));

function findMissing(source, target, path = '') {
  for (const [key, value] of Object.entries(source)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      if (!target || !target[key]) {
        console.log(`Missing object: ${currentPath}`);
      } else {
        findMissing(value, target[key], currentPath);
      }
    } else {
      if (!target || target[key] === undefined) {
        console.log(`Missing string: ${currentPath}`);
      }
    }
  }
}

findMissing(en.WITCHER, it.WITCHER, 'WITCHER');
