const { prefix, ownerNumber } = require('./config');
const { getDB } = require('./lib/db');
const { isGroup } = require('./lib/utils');

// PM Commands
const afk = require('./commands/pm/afk');
const online = require('./commands/pm/online');
const anticall = require('./commands/pm/anticall');
const antidelete = require('./commands/pm/antidelete');
const antiedit = require('./commands/pm/antiedit');
const ping = require('./commands/pm/ping');
const sudo = require('./commands/pm/sudo');
const sticker = require('./commands/pm/sticker');
const tts = require('./commands/pm/tts');
const weather = require('./commands/pm/weather');
const time = require('./commands/pm/time');
const play = require('./commands/pm/play');
const send = require('./commands/pm/send');
const alive = require('./commands/pm/alive');
const games = require('./commands/pm/games');
const downloader = require('./commands/pm/downloader');
const read = require('./commands/pm/read');
const reboot = require('./commands/pm/reboot');

// Group Commands
const welcome = require('./commands/group/welcome');
const antilink = require('./commands/group/antilink');
const warn = require('./commands/group/warn');
const kick = require('./commands/group/kick');
const promote = require('./commands/group/promote');
const tag = require('./commands/group/tag');
const mute = require('./commands/group/mute');
const filter = require('./commands/group/filter');
const spam = require('./commands/group/spam');
const sched = require('./commands/group/sched');

async function handleMessage(sock, msg) {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNum = sender.replace('@s.whatsapp.net', '').replace('@g.us', '');
    const isOwner = senderNum === ownerNumber || `${ownerNumber}@s.whatsapp.net` === sender;
    const group = isGroup(from);

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || '';

    const body = text.trim();
    const isCmd = body.startsWith(prefix);
    const [command, ...args] = isCmd
      ? body.slice(prefix.length).trim().split(' ')
      : ['', ...body.split(' ')];
    const cmd = command.toLowerCase();

    // Auto read
    const readDB = getDB('read');
    if (readDB.enabled) {
      await sock.readMessages([msg.key]);
    }

    // AFK check
    await afk.checkAfk(sock, msg, from, sender);

    // Filter check (group)
    if (group) {
      await filter.checkFilter(sock, msg, from, body);
      await antilink.checkLink(sock, msg, from, sender);
      await spam.checkSpam(sock, msg, from, sender);
    }

    if (!isCmd) return;

    const ctx = { sock, msg, from, sender, args, isOwner, group, body };

    // ─── PM COMMANDS ───
    if (cmd === 'afk') return afk.run(ctx);
    if (cmd === 'online') return online.run(ctx);
    if (cmd === 'anticall') return anticall.run(ctx);
    if (cmd === 'dlt') return antidelete.run(ctx);
    if (cmd === 'ae') return antiedit.run(ctx);
    if (cmd === 'ping') return ping.run(ctx);
    if (cmd === 'sudo') return sudo.run(ctx);
    if (['s', 'sticker'].includes(cmd)) return sticker.run(ctx);
    if (cmd === 'toimage') return sticker.toImage(ctx);
    if (cmd === 'tts') return tts.run(ctx);
    if (cmd === 'weather') return weather.run(ctx);
    if (cmd === 'time') return time.run(ctx);
    if (cmd === 'play') return play.run(ctx);
    if (cmd === 'snd') return send.run(ctx);
    if (['alive', 'hlt', 'health'].includes(cmd)) return alive.run(ctx);
    if (cmd === 'setalive') return alive.setAlive(ctx);
    if (['ttt', 'tictactoe'].includes(cmd)) return games.ttt(ctx);
    if (['wordgame', 'wg'].includes(cmd)) return games.wordgame(ctx);
    if (cmd === 'ready') return games.ready(ctx);
    if (cmd === 'cancel') return games.cancel(ctx);
    if (cmd === 'dla') return downloader.run(ctx);
    if (cmd === 'rd') return read.run(ctx);
    if (['reboot', 'rb'].includes(cmd)) return reboot.run(ctx);

    // ─── GROUP COMMANDS ───
    if (group) {
      if (cmd === 'welcome') return welcome.run(ctx);
      if (['atl'].includes(cmd)) return antilink.run(ctx);
      if (cmd === 'warn') return warn.run(ctx);
      if (cmd === 'unwarn') return warn.unwarn(ctx);
      if (cmd === 'kick') return kick.run(ctx);
      if (cmd === 'kickall') return kick.kickall(ctx);
      if (['promote', 'demote'].includes(cmd)) return promote.run(ctx);
      if (['mute', 'close'].includes(cmd)) return mute.mute(ctx);
      if (['unmute', 'open'].includes(cmd)) return mute.unmute(ctx);
      if (cmd === 'filter') return filter.run(ctx);
      if (cmd === 'stop') return filter.stop(ctx);
      if (cmd === 'filterlist') return filter.list(ctx);
      if (cmd === 'spam') return spam.run(ctx);
      if (cmd === 'sched') return sched.run(ctx);
      if (cmd === 'tag') return tag.run(ctx);
    }

} catch (err) {
    console.error('Handler error:', err);
  }
}

module.exports = { handleMessage };
