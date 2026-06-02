const fs = require('fs');
const logFile = 'C:/Users/Manuel/.gemini/antigravity/brain/ffb8d527-ad48-4fb6-bc92-31f4b6a94bed/.system_generated/logs/transcript.jsonl';

try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');
    
    for (let i = lines.length - 1; i >= 0; i--) {
        const step = JSON.parse(lines[i]);
        if (step.type === 'USER_INPUT' || (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT')) {
            console.log("Found user input step at index:", i);
            console.log("Length of user input content:", step.content.length);
            console.log("Snippet from end:", step.content.slice(-1000));
            fs.writeFileSync('scratch/user_input_debug.txt', step.content, 'utf8');
            console.log("Saved full user input to scratch/user_input_debug.txt");
            break;
        }
    }
} catch (err) {
    console.error(err);
}
