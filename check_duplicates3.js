const fs = require('fs');
const content = fs.readFileSync('./TheWitcherItaNewSystem/lang/it.json', 'utf8');

function findSameLevelDuplicates(jsonText) {
    const objRegex = /"([^"]+)"\s*:/g;
    let match;
    let stack = [new Set()];
    let output = [];

    // This is hard to do with regex.
    // Let's use a custom JSON parser that throws on duplicate keys.
}

let hasError = false;
try {
    const reviver = (key, value) => {
        // reviver alone doesn't see duplicates because JSON.parse drops the first one before reviver is called.
        return value;
    };
    JSON.parse(content);
} catch (e) {
    console.error("Parse error:", e);
    hasError = true;
}

// Write a simple string-based parser to catch duplicates
let lines = content.split('\n');
let pathStack = [];
let currentIndents = [];

lines.forEach((line, index) => {
    let indentMatch = line.match(/^(\s*)/);
    let indent = indentMatch ? indentMatch[1].length : 0;
    
    // pop stack if indent decreases
    while(currentIndents.length > 0 && indent <= currentIndents[currentIndents.length - 1]) {
        currentIndents.pop();
        pathStack.pop();
    }
    
    let keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
    if(keyMatch) {
       let key = keyMatch[1];
       if(pathStack.length > 0) {
           let top = pathStack[pathStack.length-1];
           if(top.has(key)) {
               console.log(`Duplicate key found at line ${index+1}: ${key}`);
               hasError = true;
           }
           top.add(key);
       }
       if (line.includes('{')) {
          currentIndents.push(indent);
          pathStack.push(new Set());
       }
    }
});
if (!hasError) console.log("No duplicate keys at the same level found.");
