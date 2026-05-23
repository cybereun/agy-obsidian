import fs from 'fs';
let buf = fs.readFileSync('C:/Temp/obsigravity/src/ui/AgyObsidianView.ts');
let cleaned = [];
for(let i=0; i<buf.length; i++) {
  if(buf[i] !== 0 && buf[i] !== 0xFF && buf[i] !== 0xFE) {
    cleaned.push(buf[i]);
  }
}
fs.writeFileSync('C:/Temp/obsigravity/src/ui/AgyObsidianView.ts', Buffer.from(cleaned), 'utf8');
console.log('Stripped null bytes from AgyObsidianView.ts');
