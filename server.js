require('dotenv').config();
const express = require('express');
const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessions = {}; // active pairing sessions

// ── Home Page ──
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>🦅 Falcon-MD Session Generator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 40px 35px;
      max-width: 450px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 45px rgba(0,0,0,0.3);
    }
    .logo { font-size: 60px; margin-bottom: 10px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 5px; }
    .subtitle { color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 30px; }
    .badge {
      background: rgba(37,211,102,0.15);
      border: 1px solid #25d366;
      color: #25d366;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      display: inline-block;
      margin-bottom: 25px;
    }
    input {
      width: 100%;
      padding: 15px 20px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: white;
      font-size: 16px;
      margin-bottom: 15px;
      outline: none;
      transition: border 0.3s;
    }
    input:focus { border-color: #25d366; }
    input::placeholder { color: rgba(255,255,255,0.4); }
    button {
      width: 100%;
      padding: 15px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #25d366, #128c7e);
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }
    button:hover { transform: translateY(-2px); opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .result {
      margin-top: 25px;
      padding: 20px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      display: none;
    }
    .code-box {
      background: rgba(0,0,0,0.4);
      border-radius: 10px;
      padding: 15px;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 6px;
      color: #25d366;
      margin: 15px 0;
      font-family: monospace;
    }
    .session-box {
      background: rgba(0,0,0,0.4);
      border-radius: 10px;
      padding: 12px;
      font-size: 11px;
      color: #a0e4ff;
      word-break: break-all;
      text-align: left;
      margin: 10px 0;
      max-height: 100px;
      overflow-y: auto;
      font-family: monospace;
    }
    .copy-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 8px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      width: auto;
      margin-top: 5px;
    }
    .steps {
      text-align: left;
      margin-top: 15px;
      font-size: 13px;
      color: rgba(255,255,255,0.7);
      line-height: 2;
    }
    .loader {
      display: none;
      margin: 15px auto;
      width: 35px;
      height: 35px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid #25d366;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { color: #ff6b6b; margin-top: 10px; font-size: 13px; }
    .footer { margin-top: 25px; font-size: 12px; color: rgba(255,255,255,0.3); }
    .footer a { color: #25d366; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🦅</div>
    <h1>Falcon-MD</h1>
    <p class="subtitle">WhatsApp Bot Session Generator</p>
    <div class="badge">✅ Multi-Device Support</div>

    <input type="text" id="phone" placeholder="📱 Enter number e.g. 2348XXXXXXXXX" />
    <button id="getCodeBtn" onclick="getCode()">🔑 Get Pairing Code</button>
    <div class="loader" id="loader"></div>
    <p class="error" id="error"></p>

    <div class="result" id="result">
      <p style="font-size:13px;color:rgba(255,255,255,0.6);">Your Pairing Code:</p>
      <div class="code-box" id="pairingCode">----</div>
      <div class="steps">
        👉 Open WhatsApp<br/>
        👉 Linked Devices<br/>
        👉 Link a Device<br/>
        👉 Enter the code above<br/>
        👉 Wait for Session ID below ⬇️
      </div>
      <div id="sessionSection" style="display:none;margin-top:15px;">
        <p style="font-size:13px;color:#25d366;font-weight:700;">✅ Session ID Ready!</p>
        <div class="session-box" id="sessionId"></div>
        <button class="copy-btn" onclick="copySession()">📋 Copy Session ID</button>
      </div>
    </div>

    <div class="footer">
      Made with ❤️ by <a href="https://github.com/mrmaterial1">mrmaterial1</a> |
      <a href="https://github.com/mrmaterial1/Falcon-MD">GitHub</a>
    </div>
  </div>

  <script>
    let sessionKey = null;

    async function getCode() {
      const phone = document.getElementById('phone').value.trim().replace(/[^0-9]/g, '');
      const error = document.getElementById('error');
      error.textContent = '';

      if (!phone || phone.length < 10) {
        error.textContent = '❌ Enter a valid number with country code!';
        return;
      }

      document.getElementById('getCodeBtn').disabled = true;
      document.getElementById('loader').style.display = 'block';
      document.getElementById('result').style.display = 'none';

      try {
        const res = await fetch('/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();

        if (data.code) {
          document.getElementById('pairingCode').textContent = data.code;
          document.getElementById('result').style.display = 'block';
          sessionKey = data.sessionKey;
          pollSession(data.sessionKey);
        } else {
          error.textContent = '❌ ' + (data.error || 'Failed to get code. Try again.');
          document.getElementById('getCodeBtn').disabled = false;
        }
      } catch (e) {
        error.textContent = '❌ Server error. Try again.';
        document.getElementById('getCodeBtn').disabled = false;
      }

      document.getElementById('loader').style.display = 'none';
    }

    function pollSession(key) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/session/' + key);
          const data = await res.json();
          if (data.sessionId) {
            document.getElementById('sessionId').textContent = data.sessionId;
            document.getElementById('sessionSection').style.display = 'block';
            document.getElementById('getCodeBtn').disabled = false;
            clearInterval(interval);
          }
        } catch (e) {}
      }, 3000);
    }

    function copySession() {
      const text = document.getElementById('sessionId').textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('✅ Session ID copied!');
      });
    }
  </script>
</body>
</html>
  `);
});

// ── API: Request Pairing Code ──
app.post('/pair', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.json({ error: 'Phone number required' });

  const sessionKey = uuidv4();
  const sessionDir = `./temp-sessions/${sessionKey}`;
  fs.mkdirSync(sessionDir, { recursive: true });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Falcon-MD', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    const code = await sock.requestPairingCode(phone.trim());
    sessions[sessionKey] = { sock, sessionDir, ready: false, sessionId: null };

    sock.ev.on('connection.update', async ({ connection }) => {
      if (connection === 'open') {
        // Generate session ID
        const files = fs.readdirSync(sessionDir);
        const sessionData = {};
        for (const file of files) {
          sessionData[file] = fs.readFileSync(path.join(sessionDir, file), 'utf8');
        }
        const sessionId = 'FALCON-MD~' + Buffer.from(JSON.stringify(sessionData)).toString('base64');
        sessions[sessionKey].sessionId = sessionId;
        sessions[sessionKey].ready = true;

        // Cleanup after 5 mins
        setTimeout(() => {
          try { fs.rmSync(sessionDir, { recursive: true }); } catch {}
          delete sessions[sessionKey];
        }, 300000);
      }

      if (connection === 'close') {
        try { fs.rmSync(sessionDir, { recursive: true }); } catch {}
        delete sessions[sessionKey];
      }
    });

    res.json({ code, sessionKey });
  } catch (err) {
    try { fs.rmSync(sessionDir, { recursive: true }); } catch {}
    res.json({ error: err.message });
  }
});

// ── API: Get Session ID ──
app.get('/session/:key', (req, res) => {
  const session = sessions[req.params.key];
  if (!session) return res.json({ error: 'Session not found' });
  if (!session.ready) return res.json({ waiting: true });
  res.json({ sessionId: session.sessionId });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🦅 Falcon-MD Session Server running on port ${PORT}`);
});
