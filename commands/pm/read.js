const { getDB, setDB } = require('../../lib/db');

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('read');
    const sub = args[0]?.toLowerCase();
    if (sub === 'on') {
      db.enabled = true;
      setDB('read', db);
      return sock.sendMessage(from, { text: '✅ Auto Read *ON*' });
    }
    if (sub === 'off') {
      db.enabled = false;
      setDB('read', db);
      return sock.sendMessage(from, { text: '❌ Auto Read *OFF*' });
    }
    return sock.sendMessage(from, { text: '.rd on | off' });
  },
};
