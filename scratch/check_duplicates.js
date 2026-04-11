const fs = require('fs');

function findDuplicates(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    const stack = [{}];
    
    lines.forEach((line, i) => {
        const lineNum = i + 1;
        // Simple regex for keys in one line
        const keyMatch = line.match(/\"([^\"]+)\"\s*:/);
        if (keyMatch) {
            const key = keyMatch[1];
            const currentScope = stack[stack.length - 1];
            if (currentScope[key]) {
                console.log(`Duplicate key "${key}" found at line ${lineNum} (previously at line ${currentScope[key]})`);
            }
            currentScope[key] = lineNum;
        }
        
        // Track nesting scope
        if (line.includes('{')) stack.push({});
        if (line.includes('}')) stack.pop();
    });
}

const file = process.argv[2];
if (file) findDuplicates(file);
else console.log("Please provide a file path.");
