// utils/fileHelper.js
const fs = require('fs');
const path = require('path');

/**
 * JSONファイルを読み込む
 * 存在しない or 破損していた場合は defaultValue を返す
 * @param {string} filePath
 * @param {object} [defaultValue={}]
 * @returns {object}
 */
function readJSON(filePath, defaultValue = {}) {
  if (!fs.existsSync(filePath)) return defaultValue;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ JSON読み込み失敗: ${filePath}`, err);
    return defaultValue;
  }
}

/**
 * オブジェクトをJSONファイルとして保存
 * ディレクトリが存在しない場合は作成
 * @param {string} filePath
 * @param {object} data
 */
function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`❌ JSON書き込み失敗: ${filePath}`, err);
  }
}

/**
 * ギルドごとの保存用JSONファイルを保証し、初期化する
 * ファイルがなければ star_config / tousuna 等の構造を作成
 * @param {string} guildId
 * @returns {string} JSONファイルのパス
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
      star_config: {
        adminRoleIds: [] // 配列として初期化
      },
      totusuna_config: {},
      tousuna: {
        instances: {}
      }
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
