import fs from 'fs';

let content2 = fs.readFileSync('C:/Temp/obsigravity/src/ui/AgyObsidianView.ts', 'utf8');
let original_buf = Buffer.alloc(content2.length * 2);
for(let i=0; i<content2.length; i++) {
   let code = content2.charCodeAt(i);
   original_buf[i*2] = code & 0xff;
   original_buf[i*2+1] = code >> 8;
}

// In the previous destructive script I did buf.slice(2) if the first two bytes were FF FE.
// Let's see if the output looks like valid TS.
let original_text = original_buf.toString('utf8');

// I also ran `Set-Content` which might have added `\r\n` or corrupted it differently.
// Let's just output the first 500 chars to see if it recovered.
console.log("Recovered text preview:");
console.log(original_text.substring(0, 500));

fs.writeFileSync('C:/Temp/obsigravity/src/ui/AgyObsidianView.ts.recovered', original_text, 'utf8');
