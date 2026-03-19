const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

function getDB(name) {
  const file = path.join(dataDir, `${name}.json`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(file));
}

function setDB(name, data) {
  const file = path.join(dataDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
