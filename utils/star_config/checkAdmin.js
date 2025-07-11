const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

/**
 * JSONファイルを非同期で読み込む
 */
async function readJSON(filePath) {
  const data = await fsPromises.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

/**
 * JSONファイルを書き込む（フォルダがなければ作成）
 */
async function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  await fsPromises.mkdir(dir, { recursive: true });
  await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * ギルドのJSONファイルがなければ初期化してパスを返す（非同期版）
 * @param {string} guildId
 * @returns {Promise<string>} JSONファイルのパス
 */
async function ensureGuildJSON(guildId) {
  const dir = path.join('data', guildId);
  const filePath = path.join(dir, `${guildId}.json`);

  try {
    await fsPromises.access(filePath); // 存在チェック
  } catch {
    const initialData = {
      adminRoleId: null,
      // 初期項目をここに追加可能
    };
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(filePath, JSON.stringify(initialData, null, 2), 'utf8');
  }

  return filePath;
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON,
};

