module.exports = {
  run: async ({ sock, from, args }) => {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map(p => p.id);
    const text = args.join(' ') || '📢 Attention everyone!';
    const mention = members.map(m => `@${m.split('@')[0]}`).join(' ');
    await sock.sendMessage(from, { text: `${text}\n\n${mention}`, mentions: members });
  },
};
