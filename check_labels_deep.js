const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const openLabels = (content.match(/<label/g) || []).length;
    const closeLabels = (content.match(/<\/label>/g) || []).length;

    if (openLabels !== closeLabels) {
        console.log(`[MISMATCH] ${filePath}: Open=${openLabels}, Close=${closeLabels}`);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') walk(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            checkFile(fullPath);
        }
    });
}

walk('client/src');
console.log('Scan complete.');
