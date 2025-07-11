// utils/totusuna_setti/buttons.js
const fs = require('fs');
const path = require('path');

// buttons ディレクトリ内の全ボタンモジュールを動的に読み込む
const handlers = {};

// フォルダ内の全ファイルを読み込み
const files = fs.readdirSync(path.join(__dirname, 'buttons')).filter(file => file.endsWith('.js'));

for (const file of files) {
  const modulePath = path.join(__dirname, 'buttons', file);
  const handler = require(modulePath);

  // customId（完全一致）または customIdStart（前方一致）で登録
  if (handler.customId) {
    handlers[handler.customId] = handler;
  } else if (handler.customIdStart) {
    handlers[handler.customIdStart] = handler;
  }
}

/**
 * 受け取った customId に対応するハンドラを探す
 * @param {string} customId
 * @returns {object|null} handler
 */
function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];

  // prefix マッチ対応
  for (const key of Object.keys(handlers)) {
    if (customId.startsWith(key)) return handlers[key];
  }

  return null;
}

module.exports = findHandler;
