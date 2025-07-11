// utils/totusuna_setti/selects/index.js または selects.js
const fs = require('fs');
const path = require('path');

const handlers = {};
const startsWithHandlers = [];

const selectsDir = __dirname;

const files = fs.readdirSync(selectsDir).filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of files) {
  const modulePath = path.join(selectsDir, file);
  const handler = require(modulePath);

  if (typeof handler.handle !== 'function') {
    console.warn(`⚠️ セレクトモジュールに handle 関数がありません: ${file}`);
    continue;
  }

  if (typeof handler.customId === 'string') {
    handlers[handler.customId] = handler;
  } else if (typeof handler.customIdStart === 'string') {
    startsWithHandlers.push({ key: handler.customIdStart, handler });
  } else {
    console.warn(`⚠️ セレクトモジュールに customId/customIdStart が未定義: ${file}`);
  }
}

/** customId でルーティングする関数 */
function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];
  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }
  console.warn(`⚠️ 対応するセレクトハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
