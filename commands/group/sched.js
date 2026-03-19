const { getDB, setDB } = require('../../lib/db');
const moment = require('moment-timezone');
const { timezone } = require('../../config');

const schedJobs = {};

function startScheduler(sock) {
  setInterval(async () => {
    const db = getDB('sched');
    const now = moment().tz(timezone).format('HH:mm');
    for (const groupId of Object.keys(db)) {
      const jobs = db[groupId] || [];
      for (const job of jobs) {
        if (job.time === now && !job.fired) {
          await sock.sendMessage(groupId, { text: job.text });
          job.fired = true;
        }
        if (job.time !== now) job.fired = false;
      }
      db[groupId] = jobs;
    }
    setDB('sched', db);
  }, 30000);
}

module.exports = {
  run: async ({ sock, from, args }) => {
    const db = getDB('sched');
    db[from] = db[from] || [];
    const sub = args[0]?.toLowerCase();

    if (sub === 'list') {
      const jobs = db[from];
      if (!jobs.length) return sock.sendMessage(from, { text: 'No scheduled messages.' });
      const list = jobs.map((j, i) => `${i + 1}. [${j.time}] ${j.text}`).join('\n');
      return sock.sendMessage(from, { text: `*Scheduled Messages:*\n${list}` });
    }
    if (sub === 'rm') {
      const idx = parseInt(args[1]) - 1;
      db[from].splice(idx, 1);
      setDB('sched', db);
      return sock.sendMessage(from, { text: '🗑️ Schedule removed.' });
    }

    // .sched HH:MM <text>
    const time = args[0];
    const text = args.slice(1).join(' ');
    if (!time || !text) return sock.sendMessage(from, { text: '❌ Usage: .sched HH:MM <text>' });
    db[from].push({ time, text, fired: false });
    setDB('sched', db);
    await sock.sendMessage(from, { text: `✅ Scheduled at *${time}*:\n_${text}_` });
  },

  startScheduler,
};
