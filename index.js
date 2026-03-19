require('dotenv').config();
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const { handleMessage } = require('./handler');
const { autoOnline } = require('./commands/pm/online');
const { startScheduler } = require('./commands/group/sched');
const { loadSessionFromId } = require('./lib/session');

// Auto load session from env
const SESSION_ID = process.env.SESSION_ID;
if (SESSION_ID && !fs.existsSync('./session/creds.json')) {
  loadSessionFromId(SESSION_ID);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise(resolve => rl.question(text, resolve));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
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

  // Pairing code if not registered
  if (!sock.authState.creds.registered) {
    const number = await question('📱 Enter your WhatsApp number (e.g. 2348XXXXXXXXX): ');
    const code = await sock.requestPairingCode(number.trim());
    console.log(`\n🦅 Falcon-MD Pairing Code: *${code}*`);
    console.log('👉 WhatsApp → Linked Devices → Link a Device → Enter Code\n');
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log('🔄 Falcon-MD Reconnecting...');
        startBot();
      } else {
        console.log('❌ Logged out. Delete session/ folder and restart.');
      }
    } else if (connection === 'open') {
      console.log(`
╔══════════════════════════╗
║   🦅  FALCON-MD ONLINE!  ║
╚══════════════════════════╝
      `);
      autoOnline(sock);
      startScheduler(sock);
      rl.close();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message) return;
    await handleMessage(sock, msg);
  });

  sock.ev.on('call', async (calls) => {
    const { handleCall } = require('./commands/pm/anticall');
    for (const call of calls) await handleCall(sock, call);
  });

  sock.ev.on('messages.update', async (updates) => {
    const { handleDelete } = require('./commands/pm/antidelete');
    const { handleEdit } = require('./commands/pm/antiedit');
    for (const update of updates) {
      await handleDelete(sock, update);
      await handleEdit(sock, update);
    }
  });
}
