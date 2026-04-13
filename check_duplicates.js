const fs = require('fs');

function checkDuplicates(obj, path = '') {
  const keys = new Set();
  const errors = [];
  
  // This simplistic approach won't catch duplicates because JSON.parse already overwrote them.
  // We need to parse manually or just look for duplicate 'WITCHER' block.
}

const file = fs.readFileSync('./TheWitcherItaNewSystem/lang/it.json', 'utf8');
const lines = file.split('\n');
const keyCounts = {};
for (const line of lines) {
  const match = line.match(/^\s*"([^"]+)"\s*:/);
  if (match) {
    const key = match[1];
    keyCounts[key] = (keyCounts[key] || 0) + 1;
  }
}

for (const key in keyCounts) {
  if (keyCounts[key] > 1) {
      if (['name', 'description', 'effect', 'label', 'type', 'value', 'notes'].includes(key)) continue; // Common keys used in nested objects
      console.log('Duplicate key found in regex check:', key, keyCounts[key]);
  }
}
