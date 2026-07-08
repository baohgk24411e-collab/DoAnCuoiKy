const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file === 'transcript_full.jsonl') {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const baseDir = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain';
const files = walk(baseDir);
console.log("All transcript_full.jsonl files found:", files);

files.forEach(f => {
  console.log(`Checking file: ${f}`);
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.includes('console.error') || line.includes('"type":"error"') || line.includes('"status":"error"') || line.includes('Failed to load') || line.includes('404')) {
      console.log(`  Match in ${path.basename(path.dirname(path.dirname(path.dirname(f))))}: ${line.substring(0, 300)}`);
    }
  });
});
