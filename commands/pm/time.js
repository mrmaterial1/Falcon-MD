const moment = require('moment-timezone');

module.exports = {
  run: async ({ sock, from, args }) => {
    const location = args.join(' ') || 'Africa/Lagos';
    try {
      const time = moment().tz(location).format('ddd, MMM D YYYY | hh:mm:ss A');
      await sock.sendMessage(from, { text: `🕒 *Time in ${location}*\n${time}` });
    } catch {
      await sock.sendMessage(from, { text: '❌ Invalid timezone. Example: .time Africa/Lagos' });
    }
  },
};
