module.exports = {
  run: async ({ sock, from, msg }) => {
    const start = Date.now();
    await sock.sendMessage(from, { text: '🏓 Pinging...' });
    const end = Date.now();
    await sock.sendMessage(from, {
      text: `✅ *Pong!*\n⚡ Speed: *${end - start}ms*`,
    });
  },
};
