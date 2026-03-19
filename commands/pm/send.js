module.exports = {
  run: async ({ sock, from, args, isOwner }) => {
    if (!isOwner) return sock.sendMessage(from, { text: '❌ Owner only!' });
    const number = args[0]?.replace(/[^0-9]/g, '');
    const text = args.slice(1).join(' ');
    if (!number) return sock.sendMessage(from, { text: '❌ Usage: .snd <number> <msg>' });
    const jid = `${number}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: text || '👋 Hello!' });
    await sock.sendMessage(from, { text: `✅ Message sent to *${number}*` });
  },
};
