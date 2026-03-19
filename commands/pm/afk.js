const { getDB, setDB } = require('../../lib/db');

module.exports = {
  run: async ({ sock, from, args, sender }) => {
    const db = getDB('afk');
    const sub = args[0]?.toLowerCase();

    if (sub === 'on') {
      db.enabled = true;
      db.msg = db.msg || 'I am AFK right now.';
      setDB('afk', db);
      return sock.sendMessage(from, { text: '✅ AFK mode *ON*' });
    }
    if (sub === 'off') {
      db.enabled = false;
      setDB('afk', db);
      return sock.sendMessage(from, { text: '❌ AFK mode *OFF*' });
    }
    if (sub === 'msg') {
      const text = args.slice(1).join(' ');
      if (!text) return sock.sendMessage(from, { text: '❌ Provide a message!' });
      db.msg = text;
      setDB('afk', db);
      return sock.sendMessage(from, { text: `✅ AFK message set to:\n_${text}_` });
    }
    if (sub === 'rm' || sub === 'del') {
      db.enabled = false;
      db.msg = '';
      setDB('afk', db);
      return sock.sendMessage(from, { text: '🗑️ AFK cleared.' });
    }
    return sock.sendMessage(from, {
      text: `*AFK Menu*\n.afk on | off\n.afk msg <text>\n.afk rm | del`,
    });
  },

  checkAfk: async (sock, msg, from, sender) => {
    const db = getDB('afk');
    if (!db.enabled) return;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (text.startsWith('.afk')) return;
    await sock.sendMessage(from, {
      text: `🌙 *I'm currently AFK*\n📝 ${db.msg || 'Be back soon!'}`,
    });
  },
};
