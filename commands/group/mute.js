module.exports = {
  mute: async ({ sock, from }) => {
    await sock.groupSettingUpdate(from, 'announcement');
    await sock.sendMessage(from, { text: '🔇 Group muted. Only admins can send messages.' });
  },

  unmute: async ({ sock, from }) => {
    await sock.groupSettingUpdate(from, 'not_announcement');
    await sock.sendMessage(from, { text: '🔊 Group unmuted. Everyone can send messages.' });
  },
};
