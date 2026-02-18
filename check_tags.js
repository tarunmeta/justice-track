
const fs = require('fs');
const content = fs.readFileSync('c:/Users/tarun saini/justice system/client/src/app/cases/create/page.tsx', 'utf8');

const tags = ['label', 'div', 'form', 'button', 'input', 'select', 'textarea'];
tags.forEach(tag => {
    const opening = (content.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
    const selfClosing = (content.match(new RegExp(`<${tag}[^>]*/>`, 'g')) || []).length;
    const closing = (content.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    console.log(`${tag}: opening=${opening}, selfClosing=${selfClosing}, closing=${closing}, calculated_open=${opening - selfClosing - closing}`);
});
