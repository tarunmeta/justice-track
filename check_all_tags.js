
const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const tags = ['label', 'div', 'form', 'button'];
    let reported = false;
    tags.forEach(tag => {
        const opening = (content.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
        const selfClosing = (content.match(new RegExp(`<${tag}[^>]*/>`, 'g')) || []).length;
        const closing = (content.match(new RegExp(`</${tag}>`, 'g')) || []).length;
        const balance = opening - selfClosing - closing;
        if (balance !== 0) {
            if (!reported) console.log(`\nFile: ${filePath}`);
            console.log(`  ${tag}: balance=${balance} (open=${opening}, self=${selfClosing}, close=${closing})`);
            reported = true;
        }
    });
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') traverse(fullPath);
        } else {
            checkFile(fullPath);
        }
    });
}

traverse('c:/Users/tarun saini/justice system/client/src');
