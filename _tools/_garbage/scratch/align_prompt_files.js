const fs = require('fs');
const path = require('path');

const scratchDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch';
const files = fs.readdirSync(scratchDir).filter(f => f.startsWith('prompts_batch_') && f.endsWith('.html') && !f.includes('remediation'));

// Ordiniamo in modo decrescente per evitare sovrascritture se non usassimo i .tmp, 
// ma useremo una strategia sicura.
files.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numB - numA;
});

console.log(`Trovati ${files.length} file da riallineare.`);

files.forEach(file => {
    const oldNum = parseInt(file.match(/\d+/)[0]);
    const newNum = oldNum + 1;
    const oldPath = path.join(scratchDir, file);
    const newPath = path.join(scratchDir, `prompts_batch_${newNum}.html`);

    console.log(`Processando: ${file} -> prompts_batch_${newNum}.html`);

    let content = fs.readFileSync(oldPath, 'utf8');
    
    // Aggiorna Titolo e H1
    content = content.replace(new RegExp(`Batch ${oldNum}`, 'g'), `Batch ${newNum}`);
    
    // Scriviamo il nuovo file
    fs.writeFileSync(newPath, content, 'utf8');
    
    // Eliminiamo il vecchio file (solo se il nome è cambiato)
    if (oldPath !== newPath) {
        fs.unlinkSync(oldPath);
    }
});

console.log("Riallineamento completato.");
