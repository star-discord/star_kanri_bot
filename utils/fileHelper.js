// utils/fileHelper.js
const fs = require('fs');
const path = require('path');

/**
 * 指定されたパスのJSONファイルを読み込む（存在しない場合は空オブジェクト）
 * @param {string} filePath
 * @returns {object}
 */
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ JSON読み込み失敗: ${filePath}`, err);
    return {};
  }
}

/**
 * JSONファイルとして保存（ディレクトリがなければ作成）
 * @param {string} filePath
 * @param {object} data
 */
function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readJSON,
  writeJSON
};
