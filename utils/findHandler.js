// utils/fileHandler.js

const fs = require('fs');
const path = require('path');

/**
 * JSONファイルを読み込んでオブジェクトとして返す
 * @param {string} filePath
 * @returns {Promise<Object>}
 */
async function readJSON(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`❌ [readJSON] ファイル読み込みまたはパースエラー: ${filePath}`, err);
    throw err;
  }
}

/**
 * オブジェクトをJSONファイルとして保存する
 * @param {string} filePath
 * @param {Object} data
 * @returns {Promise<void>}
 */
async function writeJSON(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`❌ [writeJSON] ファイル書き込みエラー: ${filePath}`, err);
    throw err;
  }
}

/**
 * ギルドIDごとのJSONファイルを初期化・パスを返す
 * @param {string} guildId
 * @param {Object} [initialData={}] 初期データ（任意）
 * @returns {Promise<string>} ファイルパス
 */
async function ensureGuildJSON(guildId, initialData = {}) {
  const dir = path.join('data', guildId);
  const filePath = path.join(dir, `${guildId}.json`);

  try {
    await fs.promises.mkdir(dir, { recursive: true });

    try {
      await fs.promises.access(filePath); // 存在するか確認
    } catch {
      // 存在しない場合に初期データで作成
      await fs.promises.writeFile(filePath, JSON.stringify(initialData, null, 2), 'utf8');
      console.log(`✅ [fileHandler] 初期JSONファイル作成: ${filePath}`);
    }

    return filePath;
  } catch (err) {
    console.error(`❌ [ensureGuildJSON] 初期化エラー: ${filePath}`, err);
    throw err;
  }
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON,
};
