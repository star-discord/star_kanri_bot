const fs = require('fs');
const path = require('path');

const handlers = {};
const startsWithHandlers = [];

const selectsDir = path.join(__dirname, 'selects');
if (fs.existsSync(selectsDir)) {
  const files = fs.readdirSync(selectsDir).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const modulePath = path.join(selectsDir, file);
    try {
      delete require.cache[require.resolve(modulePath)];
      const handler = require(modulePath);

      if (handler.customId) {
        handlers[handler.customId] = handler;
      } else if (handler.customIdStart) {
        startsWithHandlers.push({ key: handler.customIdStart, handler });
      } else {
        console.warn(`⚠️ セレクトファイルに customId/customIdStart がありません: ${file}`);
      }
    } catch (err) {
      console.warn(`❌ セレクトファイルの読み込みに失敗: ${file}`, err);
    }
  }
}

/**
 * customId に対応するセレクトメニューハンドラを取得
 * 完全一致優先、なければ前方一致で判定
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
