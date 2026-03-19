function getMentioned(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

function getQuotedMsg(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function isGroup(jid) {
  return jid.endsWith('@g.us');
}

function numToJid(num) {
  return `${num.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
}

function jidToNum(jid) {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

module.exports = { getMentioned, getQuotedMsg, isGroup, numToJid, jidToNum };
