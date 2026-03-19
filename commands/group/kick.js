const { getMentioned } = require('../../lib/utils');

module.exports = {
  run: async ({ sock, from, msg, isOwner }) => {
    if (!isOwner) return sock.sendMessage(from, { text: '❌ Admin only!' });
    const mentioned = getMentioned(msg);
    if (!mentioned.length) return sock.sendMessage(from, { text: '❌ Tag a user to kick!' });
    await sock.groupParticipantsUpdate(from, mentioned, 'remove');
    await sock.sendMessage(from, { text: `✅ Kicked *${mentioned.length}* user(s).` });
  },

  kickall: async ({ sock, from, isOwner }) => {
    if (!isOwner) return sock.sendMessage(from, { text: '❌ Owner only!' });
    const meta = await sock.groupMetadata(from);
    const botId = sock.user.id;
    const members = meta.participants
      .filter(p => p.id !== botId && !p.admin)
      .map(p => p.id);
    if (!members.length) return sock.sendMessage(from, { text: '❌ No members to kick!' });
    await sock.groupParticipantsUpdate(from, members, 'remove');
    await sock.sendMessage(from, { text: `✅ Kicked *${members.length}* members.` });
  },
};
