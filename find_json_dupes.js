const fs = require('fs');

function findDuplicates(obj, path = '') {
    const keys = Object.keys(obj);
    const duplicates = [];
    const seen = new Set();

    for (const key of keys) {
        if (seen.has(key)) {
            duplicates.push(path ? `${path}.${key}` : key);
        }
        seen.add(key);

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            duplicates.push(...findDuplicates(obj[key], path ? `${path}.${key}` : key));
        }
    }
    return duplicates;
}

try {
    const content = fs.readFileSync(process.argv[2], 'utf8');
    // Using positive lookahead to find all occurrences of keys at same level
    // This is hard with JSON.parse because it discards duplicates.
    // So we'll use regex to find all "key": and see if they repeat within same {}
    
    // Actually, let's just use a simple regex approach for root keys first
    const lines = content.split('\n');
    const stack = [new Set()];
    const results = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('{')) {
            stack.push(new Set());
        }
        if (line.includes('}')) {
            stack.pop();
        }
        const match = line.match(/"([^"]+)":/);
        if (match) {
            const key = match[1];
            const currentSet = stack[stack.length - 1];
            if (currentSet.has(key)) {
                results.push(`Duplicate key "${key}" at line ${i + 1}`);
            }
            currentSet.add(key);
        }
    }

    console.log(results.join('\n'));
} catch (e) {
    console.error(e);
}
