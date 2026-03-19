const { getDB, setDB } = require('../../lib/db');
const { version } = require('../../config');

module.exports = {
  run: async ({ sock, from }) => {
    const db = getDB('alive');
    const text = db.msg ||
`╔══════════════════════════╗
 ║   🦅  *FALCON-MD ALIVE!* ║
 ╚══════════════════════════╝

⚡ *Status:* Online
📦 *Version:* ${version}
🕒 *Uptime:* ${Math.floor(process.uptime() / 60)} mins
🤖 *Bot:* Falcon-MD
👑 *Powered by Baileys*`;
    await sock.sendMessage(from, { text });
  },

  setAlive: async ({ sock, from, args }) => {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '❌ Provide alive text!' });
    const db = getDB('alive');
    db.msg = text;
    setDB('alive', db);
    return sock.sendMessage(from, { text: '✅ Alive message updated!' });
  },
};
