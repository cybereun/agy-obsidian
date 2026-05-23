import fs from 'fs';

let content = fs.readFileSync('C:/Temp/obsigravity/src/main.ts', 'utf8');

content = content.replace(/ActiveMarkdownFile/g, 'ActiveSupportedFile');
content = content.replace(/file\.extension === 'md'/g, "(file.extension === 'md' || file.extension === 'canvas')");
// Wait, the error messages say "Open a markdown note before...". Let's update those too.
content = content.replace(/Open a markdown note before/g, "Open a markdown or canvas note before");

fs.writeFileSync('C:/Temp/obsigravity/src/main.ts', content, 'utf8');
console.log('Updated main.ts');
