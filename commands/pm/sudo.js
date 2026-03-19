const { getDB, setDB } = require('../../lib/db');

module.exports = {
  run: async ({ sock, from, args, isOwner }) => {
    if (!isOwner) return sock.sendMessage(from, { text: '❌ Owner only!' });
    const db = getDB('sudo');
    db.list = db.list || [];
    const sub = args[0]?.toLowerCase();

    if (sub === 'add') {
      const jid = args[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (db.list.includes(jid)) return sock.sendMessage(from, { text: '⚠️ Already a sudo user!' });
      db.list.push(jid);
      setDB('sudo', db);
      return sock.sendMessage(from, { text: `✅ Added *${args[1]}* as sudo.` });
    }
    if (sub === 'rm') {
      if (args[1] === 'all') {
        db.list = [];
        setDB('sudo', db);
        return sock.sendMessage(from, { text: '🗑️ All sudo users removed.' });
      }
      const jid = args[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      db.list = db.list.filter(j => j !== jid);
      setDB('sudo', db);
      return sock.sendMessage(from, { text: `✅ Removed *${args[1]}* from sudo.` });
    }
    if (sub === 'list') {
      const list = db.list.length
        ? db.list.map((j, i) => `${i + 1}. ${j}`).join('\n')
        : 'No sudo users.';
      return sock.sendMessage(from, { text: `*Sudo List:*\n${list}` });
    }
    return sock.sendMessage(from, {
      text: `*Sudo Menu*\n.sudo add <jid>\n.sudo rm <jid|index>\n.sudo rm all\n.sudo list`,
    });
  },
};
