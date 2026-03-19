require('dotenv').config();

module.exports = {
  prefix: '.',
  ownerNumber: process.env.OWNER_NUMBER || '2348XXXXXXXXX',
  botName: 'Falcon-MD',
  version: '1.0.0',
  timezone: process.env.TIMEZONE || 'Africa/Lagos',
  sessionId: process.env.SESSION_ID || '',
};
