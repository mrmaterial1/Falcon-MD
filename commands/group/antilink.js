const { getDB, setDB } = require('../../lib/db');

const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('antilink');
    const sub = args[0]?.toLowerCase();

    if (['enable', 'on'].includes(sub)) {
      db[from] = db[from] || {};
      db[from].enabled = true;
      setDB('antilink', db);
      return sock.sendMessage(from, { text: '✅ AntiLink *ON*' });
    }
    if (['disable', 'off'].includes(sub)) {
      db[from] = db[from] || {};
      db[from].enabled = false;
      setDB('antilink', db);
      return sock.sendMessage(from, { text: '❌ AntiLink *OFF*' });
    }
    if (sub === 'warn') {
      db[from] = db[from] || {};
      db[from].warnLimit = parseInt(args[1]) || 3;
      setDB('antilink', db);
      return sock.sendMessage(from, { text: `✅ Warn limit set to *${db[from].warnLimit}*` });
    }
    return sock.sendMessage(from, {
      text: `*AntiLink Menu*\n.atl enable | disable\n.atl warn <num>\n.atl show`,
    });
  },

  checkLink: async (sock, msg, from, sender) => {
    const db = getDB('antilink');
    const cfg = db[from] || {};
    if (!cfg.enabled) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!linkRegex.test(text)) return;

    cfg.warns = cfg.warns || {};
    cfg.warns[sender] = (cfg.warns[sender] || 0) + 1;
    const warnLimit = cfg.warnLimit || 3;

    await sock.sendMessage(from, {
      text: `⚠️ @${sender.split('@')[0]} Links are not allowed!\nWarnings: *${cfg.warns[sender]}/${warnLimit}*`,
      mentions: [sender],
    });

    await sock.sendMessage(from, { delete: msg.key });

    if (cfg.warns[sender] >= warnLimit) {
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
      await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} was kicked for sending links!`, mentions: [sender] });
      cfg.warns[sender] = 0;
    }

    db[from] = cfg;
    setDB('antilink', db);
  },
};
