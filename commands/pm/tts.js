const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  run: async ({ sock, from, args }) => {
    const lang = args[0] || 'en';
    const text = args.slice(1).join(' ');
    if (!text) return sock.sendMessage(from, { text: '❌ Usage: .tts <lang> <text>' });

    const file = path.join(__dirname, '../../data/tts.mp3');
    try {
      execSync(`gtts-cli "${text}" --lang ${lang} --output ${file}`);
      const audio = fs.readFileSync(file);
      await sock.sendMessage(from, {
        audio,
        mimetype: 'audio/mp4',
        ptt: true,
      });
      fs.unlinkSync(file);
    } catch (e) {
      await sock.sendMessage(from, { text: '❌ TTS failed. Make sure gtts-cli is installed:\npip install gtts' });
    }
  },
};
