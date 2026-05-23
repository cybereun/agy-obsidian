import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      callback(p);
    }
  }
}

function renameContent() {
  walk('C:/Temp/obsigravity/src', (p) => {
    if (p.endsWith('.ts') || p.endsWith('.css')) {
      let content = fs.readFileSync(p, 'utf8');
      let original = content;
      content = content.replace(/Obsigravity/g, 'AgyObsidian');
      content = content.replace(/obsigravity/g, 'agy-obsidian');
      content = content.replace(/OBSIGRAVITY/g, 'AGY_OBSIDIAN');
      if (content !== original) {
        fs.writeFileSync(p, content, 'utf8');
        console.log('Updated: ' + p);
      }
    }
  });
}

function renameFiles() {
  walk('C:/Temp/obsigravity/src', (p) => {
    const filename = path.basename(p);
    if (filename.includes('Obsigravity') || filename.includes('obsigravity')) {
      const newName = filename.replace(/Obsigravity/g, 'AgyObsidian').replace(/obsigravity/g, 'agy-obsidian');
      const newPath = path.join(path.dirname(p), newName);
      fs.renameSync(p, newPath);
      console.log(`Renamed: ${p} -> ${newPath}`);
    }
  });
}

renameContent();
renameFiles();

// also update README.md
let readme = fs.readFileSync('C:/Temp/obsigravity/README.md', 'utf8');
readme = readme.replace(/Obsigravity/g, 'Agy-Obsidian');
readme = readme.replace(/obsigravity/g, 'agy-obsidian');
fs.writeFileSync('C:/Temp/obsigravity/README.md', readme, 'utf8');
console.log('Updated README.md');
