const fs = require('fs');
const content = fs.readFileSync('client/src/app/cases/create/page.tsx', 'utf8');
const openCount = (content.match(/<label/g) || []).length;
const closeCount = (content.match(/<\/label>/g) || []).length;
console.log(`Open labels: ${openCount}`);
console.log(`Close labels: ${closeCount}`);
const labelLines = content.split('\n').map((line, idx) => line.includes('<label') || line.includes('</label>') ? `${idx + 1}: ${line.trim()}` : null).filter(Boolean);
console.log('Label instances:');
labelLines.forEach(l => console.log(l));
