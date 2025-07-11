// utils/totusuna_setti/selects.js
const fs = require('fs');
const path = require('path');

const handlers = {};
const startsWithHandlers = [];

const selectsDir = path.join(__dirname, 'selects');
const files = fs.readdirSync(selectsDir).filter(file => file.endsWith('.js'));

for (const file of files) {
  const modulePath = path.join(selectsDir, file);
  try {
    delete require.cache[require.resolve(modulePath)]; // キャッシュクリア（開発中用）
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

  } catch (err) {
    console.warn(`❌ セレクトファイルの読み込みに失敗 (${file}):`, err);
  }
}

/**
 * セレクトメニューの customId に対応するハンドラを探す（完全一致 → 前方一致）
 * @param {string} customId
 * @returns {object|null}
 */
function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  console.warn(`⚠️ 対応するセレクトハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
