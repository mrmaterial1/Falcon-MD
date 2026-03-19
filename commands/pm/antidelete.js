const { getDB, setDB } = require('../../lib/db');

const msgCache = {};

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('antidelete');
    const sub = args[0]?.toLowerCase();

    if (sub === 'on') {
      db.enabled = true;
      setDB('antidelete', db);
      return sock.sendMessage(from, { text: '✅ AntiDelete *ON*' });
    }
    if (sub === 'off') {
      db.enabled = false;
      setDB('antidelete', db);
      return sock.sendMessage(from, { text: '❌ AntiDelete *OFF*' });
    }
    if (sub === 'clear') {
      db.jids = [];
      setDB('antidelete', db);
      return sock.sendMessage(from, { text: '🗑️ AntiDelete JID list cleared.' });
    }
    if (sub === 'status') {
      return sock.sendMessage(from, {
        text: `AntiDelete: *${db.enabled ? 'ON' : 'OFF'}*\nJIDs: ${(db.jids || []).join(', ') || 'All'}`,
      });
    }
    // .dlt <jid>
    if (args[0] && args[0].includes('@')) {
      db.jids = db.jids || [];
      db.jids.push(args[0]);
      setDB('antidelete', db);
      return sock.sendMessage(from, { text: `✅ Added *${args[0]}* to AntiDelete.` });
    }
    return sock.sendMessage(from, {
      text: `*AntiDelete Menu*\n.dlt on | off\n.dlt <jid>\n.dlt clear\n.dlt status`,
    });
  },

  cacheMsg: (msg) => {
    const id = msg.key.id;
    msgCache[id] = msg;
  },

  handleDelete: async (sock, update) => {
    const db = getDB('antidelete');
    if (!db.enabled) return;
    if (update.update?.message === null) {
      const cached = msgCache[update.key.id];
      if (!cached) return;
      const from = update.key.remoteJid;
      const text = cached.message?.conversation || cached.message?.extendedTextMessage?.text || '';
      if (text) {
        await sock.sendMessage(from, {
          text: `🗑️ *Deleted Message Recovered:*\n\n${text}`,
        });
      }
    }
  },
};
