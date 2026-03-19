const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  run: async ({ sock, from, args }) => {
    const isVideo = args[0] === '-v';
    const query = isVideo ? args.slice(1).join(' ') : args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❌ Usage: .play <song> | .play -v <video>' });

    const out = path.join(__dirname, `../../data/play.${isVideo ? 'mp4' : 'mp3'}`);
    try {
      await sock.sendMessage(from, { text: `🔍 Searching for *${query}*...` });
      const format = isVideo ? 'bestvideo+bestaudio/best' : 'bestaudio';
      execSync(`yt-dlp -f "${format}" -o "${out}" "ytsearch1:${query}"`, { timeout: 90000 });
      const file = fs.readFileSync(out);
      if (isVideo) {
        await sock.sendMessage(from, { video: file, mimetype: 'video/mp4', caption: `🎬 ${query}` });
      } else {
        await sock.sendMessage(from, { audio: file, mimetype: 'audio/mp4', ptt: false });
      }
      fs.unlinkSync(out);
    } catch {
      await sock.sendMessage(from, { text: '❌ Play failed. Try again.' });
    }
  },
};
