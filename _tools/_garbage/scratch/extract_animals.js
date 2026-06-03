const fs = require('fs');
const path = require('path');
const d = path.join('_tools', 'src-packs', 'BESTIARIO', 'witcher-animals');
const files = fs.readdirSync(d);
let report = '# Report Animali\n\n| Nome | Statistiche (INT, RIF, DES, FIS, VEL, EMP, MAN, VOL) | Stat Derivate (PS, RES, REC) | Armi/Attacchi | Capacità (Abilities) |\n|---|---|---|---|---|\n';
files.forEach(f => {
    if (!f.endsWith('.json')) return;
    const jd = JSON.parse(fs.readFileSync(path.join(d, f)));
    const s = jd.system.stats;
    const ds = jd.system.derivedStats;
    const stats = [s.int.value, s.ref.value, s.dex.value, s.body.value, s.spd.value, s.emp.value, s.cra.value, s.will.value].join(', ');
    const derived = `PS ${ds.hp.value}, RES ${ds.sta.value}, REC ${ds.rec.value}`;
    const weapons = jd.items.filter(i => i.type === 'weapon').map(i => i.name + (i.system.damage ? ' (' + i.system.damage + ')' : '')).join(', ');
    const abilities = jd.items.filter(i => i.type === 'ability').map(i => i.name).join(', ');
    report += `| **${jd.name}** | ${stats} | ${derived} | ${weapons || '-'} | ${abilities || '-'} |\n`;
});
fs.writeFileSync(path.join('TO DO', 'report_animali.md'), report);
console.log('Report Animali aggiornato.');
