const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  run: async ({ sock, from, args }) => {
    const url = args[0];
    if (!url) return sock.sendMessage(from, { text: '❌ Usage: .dla <url>' });

    const out = path.join(__dirname, '../../data/download.mp4');
    try {
      await sock.sendMessage(from, { text: '⬇️ Downloading...' });
      execSync(`yt-dlp -o "${out}" "${url}"`, { timeout: 60000 });
      const video = fs.readFileSync(out);
      await sock.sendMessage(from, { video, mimetype: 'video/mp4' });
      fs.unlinkSync(out);
    } catch {
      await sock.sendMessage(from, { text: '❌ Download failed. Make sure yt-dlp is installed:\npip install yt-dlp' });
    }
  },
};
