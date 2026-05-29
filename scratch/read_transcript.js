const fs = require('fs');
const path = require('path');

const logFile = 'C:/Users/Manuel/.gemini/antigravity/brain/ffb8d527-ad48-4fb6-bc92-31f4b6a94bed/.system_generated/logs/transcript.jsonl';

try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');
    
    // We want to find the latest step of source = USER_EXPLICIT or type = USER_INPUT
    for (let i = lines.length - 1; i >= 0; i--) {
        const step = JSON.parse(lines[i]);
        if (step.source === 'USER_EXPLICIT' || step.type === 'USER_INPUT') {
            console.log("=== FOUND USER INPUT ===");
            console.log(step.content);
            console.log("========================");
            break;
        }
    }
} catch (err) {
    console.error(err);
}
