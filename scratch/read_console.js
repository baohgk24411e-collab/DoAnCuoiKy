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
    // Look for tool response of BROWSER_SUBAGENT or capture_browser_console_logs
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        if (tc.name === 'capture_browser_console_logs') {
          console.log(`Step Index: ${obj.step_index}`);
          console.log(`Tool Call Arguments:`, JSON.stringify(tc.args, null, 2));
        }
      });
    }
    // Check if the line has the result of capture_browser_console_logs
    if (obj.type === 'PLANNER_RESPONSE' && obj.content && obj.content.includes('capture_browser_console_logs')) {
      // Print nearby content
    }
  } catch (e) {
    // Ignore invalid JSON lines
  }
});
