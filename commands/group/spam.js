const { getDB, setDB } = require('../../lib/db');

const spamTracker = {};

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('spam');
    db[from] = db[from] || {};
    const sub = args[0]?.toLowerCase();

    if (sub === 'on') {
      db[from].enabled = true;
      setDB('spam', db);
      return sock.sendMessage(from, { text: '✅ AntiSpam *ON*' });
    }
    if (sub === 'off') {
      db[from].enabled = false;
      setDB('spam', db);
      return sock.sendMessage(from, { text: '❌ AntiSpam *OFF*' });
    }
    if (sub === 'warn') {
      db[from].limit = parseInt(args[1]) || 5;
      setDB('spam', db);
      return sock.sendMessage(from, { text: `✅ Spam limit set to *${db[from].limit}* msgs/5s` });
    }
    if (sub === 'show') {
      return sock.sendMessage(from, {
        text: `AntiSpam: *${db[from].enabled ? 'ON' : 'OFF'}*\nLimit: *${db[from].limit || 5}*`,
      });
    }
  },

  checkSpam: async (sock, msg, from, sender) => {
    const db = getDB('spam');
    const cfg = db[from] || {};
    if (!cfg.enabled) return;

    const now = Date.now();
    spamTracker[from] = spamTracker[from] || {};
    spamTracker[from][sender] = spamTracker[from][sender] || [];

    spamTracker[from][sender] = spamTracker[from][sender].filter(t => now - t < 5000);
    spamTracker[from][sender].push(now);

    const limit = cfg.limit || 5;
    if (spamTracker[from][sender].length >= limit) {
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
      await sock.sendMessage(from, {
        text: `🚫 @${sender.split('@')[0]} kicked for spamming!`,
        mentions: [sender],
      });
      spamTracker[from][sender] = [];
    }
  },
};
