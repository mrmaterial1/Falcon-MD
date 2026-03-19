const axios = require('axios');

module.exports = {
  run: async ({ sock, from, args }) => {
    const location = args.join(' ');
    if (!location) return sock.sendMessage(from, { text: '❌ Usage: .weather <location>' });
    try {
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(location)}?format=3`);
      await sock.sendMessage(from, { text: `🌤️ *Weather*\n${res.data}` });
    } catch {
      await sock.sendMessage(from, { text: '❌ Could not fetch weather.' });
    }
  },
};
