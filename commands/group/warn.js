const { getDB, setDB } = require('../../lib/db');
const { getMentioned } = require('../../lib/utils');

module.exports = {
  run: async ({ sock, from, msg, args }) => {
    const db = getDB('warn');
    db[from] = db[from] || {};
    const mentioned = getMentioned(msg);
    if (!mentioned.length) return sock.sendMessage(from, { text: '❌ Tag a user!' });
    const user = mentioned[0];
    db[from][user] = (db[from][user] || 0) + 1;
    const limit = db[from]._limit || 3;
    setDB('warn', db);

    await sock.sendMessage(from, {
      text: `⚠️ @${user.split('@')[0]} has been warned!\nWarnings: *${db[from][user]}/${limit}*`,
      mentions: [user],
    });

    if (db[from][user] >= limit) {
      await sock.groupParticipantsUpdate(from, [user], 'remove');
      await sock.sendMessage(from, { text: `🚫 @${user.split('@')[0]} kicked after reaching warn limit!`, mentions: [user] });
      db[from][user] = 0;
      setDB('warn', db);
    }
  },

  unwarn: async ({ sock, from, msg }) => {
    const db = getDB('warn');
    db[from] = db[from] || {};
    const mentioned = getMentioned(msg);
    if (!mentioned.length) return sock.sendMessage(from, { text: '❌ Tag a user!' });
    const user = mentioned[0];
    db[from][user] = Math.max((db[from][user] || 1) - 1, 0);
    setDB('warn', db);
    await sock.sendMessage(from, {
      text: `✅ @${user.split('@')[0]} warning removed. Warnings: *${db[from][user]}*`,
      mentions: [user],
    });
  },
};
