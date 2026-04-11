// Script to merge upstream EN localization with custom local keys,
// then produce a final en.json and it.json in the system lang directory.

const fs = require('fs');
const path = require('path');

const upstreamPath = path.join(__dirname, 'upstream_en.json');
const localEnPath = path.join(__dirname, '..', 'TheWitcherItaNewSystem', 'lang', 'en.json');
const localItPath = path.join(__dirname, '..', 'TheWitcherItaNewSystem', 'lang', 'it.json');

const upstream = JSON.parse(fs.readFileSync(upstreamPath, 'utf8'));
const localEn = JSON.parse(fs.readFileSync(localEnPath, 'utf8'));
const localIt = JSON.parse(fs.readFileSync(localItPath, 'utf8'));

// Deep merge: local overrides upstream
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// Merge: upstream is the base, local EN overrides
const mergedEn = deepMerge(upstream, localEn);

// Write the merged EN
fs.writeFileSync(localEnPath, JSON.stringify(mergedEn, null, 2) + '\n', 'utf8');
console.log('Written merged en.json');

// Now create the IT translations for ALL upstream keys plus local IT overrides
// Start with the upstream as base (English fallback), overlay existing IT translations
const mergedIt = deepMerge(upstream, localIt);

// Write the merged IT (for now it has English fallback for missing keys)
fs.writeFileSync(localItPath, JSON.stringify(mergedIt, null, 2) + '\n', 'utf8');
console.log('Written merged it.json (with English fallback for missing keys)');
console.log('Total top-level en keys:', Object.keys(mergedEn).length);
console.log('Total top-level it keys:', Object.keys(mergedIt).length);
