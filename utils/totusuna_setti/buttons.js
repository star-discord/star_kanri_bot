// utils/totusuna_setti/buttons.js
const fs = require('fs');
const path = require('path');

// buttons ディレクトリ内の全ボタンモジュールを動的に読み込む
const handlers = {};
const startsWithHandlers = [];

const buttonsDir = path.join(__dirname, 'buttons');
const files = fs.readdirSync(buttonsDir).filter(file => file.endsWith('.js'));

for (const file of files) {
  const modulePath = path.join(buttonsDir, file);
  const handler = require(modulePath);

  if (handler.customId) {
    handlers[handler.customId] = handler;
  } else if (handler.customIdStart) {
    startsWithHandlers.push({ key: handler.customIdStart, handler });
  } else {
    console.warn(`⚠️ ボタンファイルに customId/customIdStart がありません: ${file}`);
  }
}

/**
 * 受け取った customId に対応するハンドラを探す
 * 完全一致 → 前方一致 の順で判定
 * @param {string} customId
 * @returns {object|null}
 */
function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  console.warn(`⚠️ ハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
