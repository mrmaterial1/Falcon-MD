const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  run: async ({ sock, msg, from }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage;
    if (!imgMsg) return sock.sendMessage(from, { text: '❌ Reply to an image to make a sticker!' });

    try {
      const stream = await sock.downloadMediaMessage(msg);
      const inp = path.join(__dirname, '../../data/sticker_in.jpg');
      const out = path.join(__dirname, '../../data/sticker_out.webp');
      fs.writeFileSync(inp, stream);
      execSync(`ffmpeg -i ${inp} -vf scale=512:512 ${out} -y`);
      const sticker = fs.readFileSync(out);
      await sock.sendMessage(from, { sticker });
      fs.unlinkSync(inp);
      fs.unlinkSync(out);
    } catch {
      await sock.sendMessage(from, { text: '❌ Sticker creation failed.' });
    }
  },

  toImage: async ({ sock, msg, from }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = msg.message?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return sock.sendMessage(from, { text: '❌ Reply to a sticker!' });
    try {
      const stream = await sock.downloadMediaMessage(msg);
      await sock.sendMessage(from, { image: stream, mimetype: 'image/png' });
    } catch {
      await sock.sendMessage(from, { text: '❌ Conversion failed.' });
    }
  },
};
