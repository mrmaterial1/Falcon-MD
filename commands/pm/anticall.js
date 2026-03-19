const { getDB, setDB } = require('../../lib/db');

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('anticall');
    const sub = args[0]?.toLowerCase();

    if (sub === 'on') {
      db.enabled = true;
      setDB('anticall', db);
      return sock.sendMessage(from, { text: '✅ AntiCall *ON*' });
    }
    if (sub === 'off') {
      db.enabled = false;
      setDB('anticall', db);
      return sock.sendMessage(from, { text: '❌ AntiCall *OFF*' });
    }
    if (sub === 'msg') {
      db.msg = args.slice(1).join(' ');
      setDB('anticall', db);
      return sock.sendMessage(from, { text: `✅ AntiCall message set!` });
    }
    if (sub === 'wl') {
      const num = args[1]?.replace(/[^0-9]/g, '');
      if (!num) return sock.sendMessage(from, { text: '❌ Provide a number!' });
      db.whitelist = db.whitelist || [];
      db.whitelist.push(num);
      setDB('anticall', db);
      return sock.sendMessage(from, { text: `✅ *${num}* whitelisted.` });
    }
    if (sub === 'rm') {
      const num = args[1]?.replace(/[^0-9]/g, '');
      db.whitelist = (db.whitelist || []).filter(n => n !== num);
      setDB('anticall', db);
      return sock.sendMessage(from, { text: `✅ *${num}* removed from whitelist.` });
    }
    return sock.sendMessage(from, {
      text: `*AntiCall Menu*\n.anticall on | off\n.anticall msg <text>\n.anticall wl <number>\n.anticall rm <number>`,
    });
  },

  handleCall: async (sock, call) => {
    const db = getDB('anticall');
    if (!db.enabled) return;
    const callerNum = call.from.replace('@s.whatsapp.net', '');
    if ((db.whitelist || []).includes(callerNum)) return;
    await sock.rejectCall(call.id, call.from);
    await sock.sendMessage(call.from, {
      text: db.msg || '❌ Sorry, I do not accept calls. Please send a message instead.',
    });
  },
};
