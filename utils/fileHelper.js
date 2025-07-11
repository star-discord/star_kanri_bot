// ✅ utils/fileHelper.js
const fs = require('fs');
const path = require('path');

function readJSON(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

function writeJSON(filePath, data) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    fs.mkdir(dir, { recursive: true }, (mkErr) => {
      if (mkErr) return reject(mkErr);
      fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

function ensureGuildJSON(guildId) {
  const dir = `data/${guildId}`;
  const filePath = `${dir}/${guildId}.json`;

  if (!fs.existsSync(filePath)) {
    const initialData = {
      adminRoleId: null,
    };
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
  }

  return filePath;
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON,
};
