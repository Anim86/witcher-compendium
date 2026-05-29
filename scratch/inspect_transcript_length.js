const fs = require('fs');
const logFile = 'C:/Users/Manuel/.gemini/antigravity/brain/ffb8d527-ad48-4fb6-bc92-31f4b6a94bed/.system_generated/logs/transcript.jsonl';

try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');
    const latest = JSON.parse(lines[lines.length - 1]);
    console.log("Length of latest step content:", latest.content ? latest.content.length : 0);
    if (latest.content) {
        console.log("Snippet from end:", latest.content.slice(-500));
    }
} catch (err) {
    console.error(err);
}
