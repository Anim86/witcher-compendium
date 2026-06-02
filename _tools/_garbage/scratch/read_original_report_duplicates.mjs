import fs from 'fs';
import path from 'path';

const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/_garbage/TO DO/report_oggetti_vari_asset.md';

if (fs.existsSync(reportPath)) {
    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.split(/\r?\n/);
    
    console.log("=== ITEMS WITH PLACEHOLDER HASHES IN ORIGINAL REPORT ===");
    for (const line of lines) {
        if (line.includes('`58f63b54`') || line.includes('`b869124c`') || line.includes('`b2273578`') || line.includes('`c6d81adc`') || line.includes('`6fd2b96d`') || line.includes('`7456206f`') || line.includes('`2dc71f21`') || line.includes('`24203def`') || line.includes('`eb24a079`') || line.includes('`a15119de`')) {
            console.log(line);
        }
    }
} else {
    console.log("Report file not found.");
}
