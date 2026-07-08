const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\57395247-3328-4be4-a4ef-3aca984524b9\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(logPath)) {
  console.log("Log path not found: " + logPath);
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
lines.forEach(line => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    // Print step index and content if type is BROWSER_SUBAGENT
    if (obj.type === 'BROWSER_SUBAGENT' && obj.content) {
      console.log(`--- Subagent Execution Result Step ${obj.step_index} ---`);
      console.log(obj.content);
    }
  } catch (e) {
    // Ignore invalid JSON lines
  }
});
