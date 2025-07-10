// utils/fileHelper.js
const fs = require('fs');
const path = require('path');

/**
 * 指定されたパスのJSONファイルを読み込む（存在しない場合や破損時は defaultValue を返す）
 * @param {string} filePath
 * @param {object} [defaultValue={}]
 * @returns {object}
 */
function readJSON(filePath, defaultValue = {}) {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ JSON読み込み失敗: ${filePath}`, err);
    return defaultValue;
  }
}

/**
 * JSONファイルとして保存（ディレクトリがなければ作成）
 * @param {string} filePath
 * @param {object} data
 */
function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * ギルド用JSONファイルの存在確認＋初期化
 * @param {string} guildId
 * @returns {string} jsonPath
 */
function ensureGuildJSON(guildId) {
  const dirPath = path.join(__dirname, `../data/${guildId}`);
  const jsonPath = path.join(dirPath, `${guildId}.json`);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 ディレクトリ作成: data/${guildId}`);
  }

  if (!fs.existsSync(jsonPath)) {
    const defaultData = {
      star_config: {},
      totusuna_config: {},
      tousuna: { instances: {} }
    };
    fs.writeFileSync(jsonPath, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log(`📄 初期JSON作成: ${jsonPath}`);
  }

  return jsonPath;
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON
};
