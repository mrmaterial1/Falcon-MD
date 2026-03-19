module.exports = {
  run: async ({ sock, from, args, isOwner }) => {
    if (!isOwner) return sock.sendMessage(from, { text: '❌ Owner only!' });
    const secs = parseInt(args[0]) || 3;
    await sock.sendMessage(from, { text: `🔄 Rebooting in *${secs}* seconds...` });
    setTimeout(() => {
      process.exit(0);
    }, secs * 1000);
  },
};
