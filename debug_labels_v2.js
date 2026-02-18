const fs = require('fs');
const file = process.argv[2] || 'client/src/app/cases/create/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const openLabels = (content.match(/<label/g) || []).length;
const closeLabels = (content.match(/<\/label>/g) || []).length;
console.log(`File: ${file}`);
console.log(`Open: ${openLabels}, Close: ${closeLabels}`);
if (openLabels !== closeLabels) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.includes('<label') || line.includes('</label>')) {
            console.log(`${idx + 1}: ${line.trim()}`);
        }
    });
}
