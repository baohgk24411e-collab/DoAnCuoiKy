const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain';
const folders = fs.readdirSync(brainDir);
console.log("Subagent folders in brain:", folders);

folders.forEach(f => {
  const transPath = path.join(brainDir, f, '.system_generated', 'logs', 'transcript_full.jsonl');
  if (fs.existsSync(transPath)) {
    console.log(`Reading transcript for subagent ${f}:`);
    const content = fs.readFileSync(transPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
      if (!line.trim()) return;
      try {
        const obj = JSON.parse(line);
        if (line.includes('console_logs') || line.includes('console') || line.includes('error') || line.includes('fail')) {
          // Check if this is a tool result containing console output
          if (obj.type === 'TOOL_RESPONSE' || obj.status === 'DONE') {
            console.log(`  Match in ${f} (Step ${obj.step_index || obj.step}):`, line.substring(0, 800));
          }
        }
      } catch(e) {}
    });
  }
});
