const { getDB, setDB } = require('../../lib/db');

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('online');
    const sub = args[0]?.toLowerCase();

    if (sub === 'on') {
      db.enabled = true;
      setDB('online', db);
      return sock.sendMessage(from, { text: '✅ Always Online *ON*' });
    }
    if (sub === 'off') {
      db.enabled = false;
      setDB('online', db);
      return sock.sendMessage(from, { text: '❌ Always Online *OFF*' });
    }
    return sock.sendMessage(from, { text: `.online on | off` });
  },

  autoOnline: (sock) => {
    setInterval(async () => {
      const db = getDB('online');
      if (!db.enabled) return;
      await sock.sendPresenceUpdate('available');
    }, 10000);
  },
};
