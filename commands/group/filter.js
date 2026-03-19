const { getDB, setDB } = require('../../lib/db');

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('filter');
    db[from] = db[from] || {};
    const trigger = args.join(' ').toLowerCase();
    if (!trigger) return sock.sendMessage(from, { text: '❌ Usage: .filter <trigger>\nthen send: ! <response>' });
    db[from]._pending = trigger;
    setDB('filter', db);
    await sock.sendMessage(from, { text: `✅ Trigger set: *${trigger}*\nNow send: *! <response>*` });
  },

  stop: async ({ sock, from, args }) => {
    const db = getDB('filter');
    db[from] = db[from] || {};
    const trigger = args.join(' ').toLowerCase();
    delete db[from][trigger];
    setDB('filter', db);
    await sock.sendMessage(from, { text: `🗑️ Filter *${trigger}* removed.` });
  },

  list: async ({ sock, from }) => {
    const db = getDB('filter');
    const filters = db[from] || {};
    const list = Object.keys(filters).filter(k => k !== '_pending');
    if (!list.length) return sock.sendMessage(from, { text: 'No filters set.' });
    await sock.sendMessage(from, { text: `*Filters:*\n${list.join('\n')}` });
  },

  checkFilter: async (sock, msg, from, text) => {
    const db = getDB('filter');
    const filters = db[from] || {};

    // Handle response to pending filter
    if (filters._pending && text.startsWith('!')) {
      const response = text.slice(1).trim();
      filters[filters._pending] = response;
      delete filters._pending;
      db[from] = filters;
      setDB('filter', db);
      return sock.sendMessage(from, { text: `✅ Filter saved!` });
    }

    // Check triggers
    const lower = text.toLowerCase();
    for (const trigger of Object.keys(filters)) {
      if (trigger === '_pending') continue;
      if (lower.includes(trigger)) {
        await sock.sendMessage(from, { text: filters[trigger] });
      }
    }
  },
};
