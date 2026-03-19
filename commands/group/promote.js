const { getMentioned } = require('../../lib/utils');

module.exports = {
  run: async ({ sock, from, msg, cmd }) => {
    const mentioned = getMentioned(msg);
    if (!mentioned.length) return sock.sendMessage(from, { text: '❌ Tag a user!' });
    const action = cmd === 'promote' ? 'promote' : 'demote';
    await sock.groupParticipantsUpdate(from, mentioned, action);
    await sock.sendMessage(from, {
      text: `✅ @${mentioned[0].split('@')[0]} has been *${action}d*!`,
      mentions: mentioned,
    });
  },
};
