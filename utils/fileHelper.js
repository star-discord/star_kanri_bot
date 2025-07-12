const fs = require('fs');
const path = require('path');

function readJSON(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`❌ readJSON: ファイル読み込みエラー - ${filePath}`, err);
        return reject(err);
      }
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (parseErr) {
        console.error(`❌ readJSON: JSONパースエラー - ${filePath}`, parseErr);
        reject(parseErr);
      }
    });
  });
}

function writeJSON(filePath, data) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    fs.mkdir(dir, { recursive: true }, (mkErr) => {
      if (mkErr) {
        console.error(`❌ writeJSON: ディレクトリ作成エラー - ${dir}`, mkErr);
        return reject(mkErr);
      }
      fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(`❌ writeJSON: ファイル書き込みエラー - ${filePath}`, err);
          return reject(err);
        }
        resolve();
      });
    });
  });
}

async function ensureGuildJSON(guildId) {
  const dir = `data/${guildId}`;
  const filePath = `${dir}/${guildId}.json`;

  try {
    await fs.promises.mkdir(dir, { recursive: true });
    try {
      await fs.promises.access(filePath);
    } catch {
      // ファイルがなければ初期データを書き込み
      const initialData = {
        adminRoleId: null,
      };
      await fs.promises.writeFile(filePath, JSON.stringify(initialData, null, 2), 'utf8');
      console.log(`✅ 初期JSONファイルを作成しました: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ ensureGuildJSON: ファイル作成時にエラーが発生しました - ${filePath}`, err);
    throw err;
  }

  return filePath;
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON,
};
