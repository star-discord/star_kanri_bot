// utils/totusuna_setti/modals.js
const fs = require('fs');
const path = require('path');

const handlers = {};
const startsWithHandlers = [];

const modalsDir = path.join(__dirname, 'modals');
const files = fs.readdirSync(modalsDir).filter(file => file.endsWith('.js'));

for (const file of files) {
  const modulePath = path.join(modalsDir, file);
  try {
    const handler = require(modulePath);

    if (handler.customId) {
      handlers[handler.customId] = handler;
    } else if (handler.customIdStart) {
      startsWithHandlers.push({ key: handler.customIdStart, handler });
    } else {
      console.warn(`⚠️ モーダルモジュールに customId/customIdStart が未定義: ${file}`);
    }
  } catch (err) {
    console.warn(`❌ モーダルファイルの読み込みに失敗: ${file}`, err);
  }
}

/**
 * Custom ID に一致するモーダルハンドラを探す（完全一致 → 前方一致）
 * @param {string} customId
 * @returns {object|null}
 */
function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  console.warn(`⚠️ 対応するモーダルハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
