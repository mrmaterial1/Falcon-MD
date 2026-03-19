const { getDB, setDB } = require('../../lib/db');

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('welcome');
    const sub = args[0]?.toLowerCase();

    if (sub === 'on') {
      db[from] = db[from] || {};
      db[from].enabled = true;
      setDB('welcome', db);
      return sock.sendMessage(from, { text: '✅ Welcome message *ON*' });
    }
    if (sub === 'off') {
      db[from] = db[from] || {};
      db[from].enabled = false;
      setDB('welcome', db);
      return sock.sendMessage(from, { text: '❌ Welcome message *OFF*' });
    }
    if (sub === 'msg') {
      const text = args.slice(1).join(' ');
      db[from] = db[from] || {};
      db[from].msg = text;
      setDB('welcome', db);
      return sock.sendMessage(from, { text: `✅ Welcome message set!\n_${text}_` });
    }
    if (sub === 'show') {
      const cfg = db[from] || {};
      return sock.sendMessage(from, {
        text: `Welcome: *${cfg.enabled ? 'ON' : 'OFF'}*\nMessage: ${cfg.msg || 'Default'}`,
      });
    }
    return sock.sendMessage(from, {
      text: `*Welcome Menu*\n.welcome on | off\n.welcome msg <text>\n.welcome show`,
    });
  },

  handleWelcome: async (sock, update) => {
    const db = getDB('welcome');
    for (const event of update) {
      if (event.action !== 'add') continue;
      const cfg = db[event.id] || {};
      if (!cfg.enabled) continue;
      for (const jid of event.participants) {
        const msg = cfg.msg || `👋 Welcome @${jid.split('@')[0]} to the group!`;
        await sock.sendMessage(event.id, { text: msg, mentions: [jid] });
      }
    }
  },
};
