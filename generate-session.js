const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise(resolve => rl.question(text, resolve));

async function generateSession() {
  console.log(`
╔══════════════════════════════════╗
║  🦅  FALCON-MD Session Generator  ║
╚══════════════════════════════════╝
  `);

  const { state, saveCreds } = await useMultiFileAuthState('./temp-session');
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

  if (!sock.authState.creds.registered) {
    const number = await question('📱 Enter your WhatsApp number (e.g. 2348XXXXXXXXX): ');
    const code = await sock.requestPairingCode(number.trim());
    console.log(`
╔══════════════════════════════════╗
║     🦅 FALCON-MD PAIRING CODE    ║
╠══════════════════════════════════╣
║  Code: ${code.padEnd(26)}║
╚══════════════════════════════════╝

👉 Open WhatsApp
👉 Linked Devices
👉 Link a Device
👉 Enter the code above
    `);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection }) => {
    if (connection === 'open') {
      console.log('\n✅ Connected! Generating Falcon-MD Session ID...\n');

      const sessionDir = './temp-session';
      const files = fs.readdirSync(sessionDir);
      const sessionData = {};

      for (const file of files) {
        const filePath = path.join(sessionDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        sessionData[file] = content;
      }

      const sessionId = 'FALCON-MD~' + Buffer.from(JSON.stringify(sessionData)).toString('base64');

      console.log(`
╔══════════════════════════════════╗
║      🦅 YOUR FALCON-MD           ║
║          SESSION ID              ║
╚══════════════════════════════════╝

${sessionId}

╔══════════════════════════════════╗
║  ⚠️  Keep this SECRET!            ║
║  📋  Copy and save it safely      ║
║  🚀  Paste it when deploying      ║
╚══════════════════════════════════╝
      `);

      fs.writeFileSync('./session-id.txt', sessionId);
      console.log('✅ Also saved to: session-id.txt\n');

      fs.rmSync(sessionDir, { recursive: true });
      rl.close();
      process.exit(0);
    }

    if (connection === 'close') {
      console.log('❌ Connection failed. Run again.');
      process.exit(1);
    }
  });
}

generateSession();
