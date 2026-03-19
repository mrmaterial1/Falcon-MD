const { getDB, setDB } = require('../../lib/db');
const editCache = {};

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('antiedit');
    const sub = args[0]?.toLowerCase();

    if (['on', 'enable'].includes(sub)) {
      db.enabled = true;
      setDB('antiedit', db);
      return sock.sendMessage(from, { text: '✅ AntiEdit *ON*' });
    }
    if (['off', 'disable'].includes(sub)) {
      db.enabled = false;
      setDB('antiedit', db);
      return sock.sendMessage(from, { text: '❌ AntiEdit *OFF*' });
    }
    if (sub === 'clear') {
      db.jids = [];
      setDB('antiedit', db);
      return sock.sendMessage(from, { text: '🗑️ AntiEdit list cleared.' });
    }
    if (sub === 'status') {
      return sock.sendMessage(from, {
        text: `AntiEdit: *${db.enabled ? 'ON' : 'OFF'}*`,
      });
    }
    if (args[0]?.includes('@')) {
      db.jids = db.jids || [];
      db.jids.push(args[0]);
      setDB('antiedit', db);
      return sock.sendMessage(from, { text: `✅ Added *${args[0]}* to AntiEdit.` });
    }
    return sock.sendMessage(from, {
      text: `*AntiEdit Menu*\n.ae on | off\n.ae <jid>\n.ae clear\n.ae status`,
    });
  },

  handleEdit: async (sock, update) => {
    const db = getDB('antiedit');
    if (!db.enabled) return;
    if (update.update?.message) {
      const id = update.key.id;
      const from = update.key.remoteJid;
      const oldMsg = editCache[id];
      const newText =
        update.update.message?.conversation ||
        update.update.message?.extendedTextMessage?.text || '';
      if (oldMsg && newText) {
        await sock.sendMessage(from, {
          text: `✏️ *Message Edited!*\n\n*Before:* ${oldMsg}\n*After:* ${newText}`,
        });
      }
      editCache[id] = newText;
    }
  },

  cacheEdit: (msg) => {
    const id = msg.key.id;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (text) editCache[id] = text;
  },
};
