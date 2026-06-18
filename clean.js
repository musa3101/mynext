const fs = require('fs');

const files = ['index.html', 'index-en.html', 'planes/index.html', 'planes/index-en.html'];

for (const f of files) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf-8');
    
    // Remove CSS link
    content = content.replace(/\s*<link rel="stylesheet" href="\.\/?(\.\.\/)*css\/style\.css">\n?/g, '');
    // Remove Tailwind CDN
    content = content.replace(/\s*<script src="https:\/\/cdn\.tailwindcss\.com.*?"\s*><\/script>\n?/g, '');
    content = content.replace(/\s*<!-- Tailwind CSS -->\n?/g, '');
    content = content.replace(/\s*<!-- Typography System -->\n?/g, '');
    content = content.replace(/\s*<script id="tailwind-config">[\s\S]*?<\/script>\n?/g, '');
    content = content.replace(/\s*<style type="text\/tailwindcss">[\s\S]*?<\/style>\n?/g, '');
    
    fs.writeFileSync(f, content, 'utf-8');
}
console.log('Cleanup complete!');
