const fs = require('fs');
const path = require('path');

function loadSessionFromId(sessionId) {
  try {
    // Remove Falcon-MD~ prefix
    const base64 = sessionId.replace('FALCON-MD~', '');
    const sessionData = JSON.parse(Buffer.from(base64, 'utf8'));
    const sessionDir = './session';

    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    for (const [filename, content] of Object.entries(sessionData)) {
      fs.writeFileSync(path.join(sessionDir, filename), content);
    }

    console.log('🦅 Falcon-MD session loaded successfully!');
    return true;
  } catch (err) {
    console.error('❌ Failed to load session:', err.message);
    return false;
  }
}

module.exports = { loadSessionFromId };
