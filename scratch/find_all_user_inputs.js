const fs = require('fs');
const logFile = 'C:/Users/Manuel/.gemini/antigravity/brain/ffb8d527-ad48-4fb6-bc92-31f4b6a94bed/.system_generated/logs/transcript.jsonl';

try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');
    
    console.log("Total lines in transcript:", lines.length);
    for (let i = 0; i < lines.length; i++) {
        const step = JSON.parse(lines[i]);
        if (step.source === 'USER_EXPLICIT' || step.type === 'USER_INPUT') {
            console.log(`Step ${i} | Type: ${step.type} | Source: ${step.source} | Length: ${step.content ? step.content.length : 0}`);
            if (step.content && step.content.length > 500) {
                console.log(`  Start: ${step.content.slice(0, 100)}...`);
                console.log(`  End: ...${step.content.slice(-100)}`);
            }
        }
    }
} catch (err) {
    console.error(err);
}
