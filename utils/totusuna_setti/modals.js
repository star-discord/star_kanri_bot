// utils/totusuna_setti/modals.js
const fs = require('fs');
const path = require('path');

// 完全一致 / 前方一致用のハンドラ格納
const handlers = {};
const startsWithHandlers = [];

// モーダルハンドラを読み込むディレクトリ
const modalsDir = path.join(__dirname, 'modals');

// .js ファイルのみを対象
const files = fs.readdirSync(modalsDir).filter(file => file.endsWith('.js'));

for (const file of files) {
  const modulePath = path.join(modalsDir, file);
  try {
    delete require.cache[require.resolve(modulePath)]; // ← キャッシュクリア（開発時用）
    const handler = require(modulePath);

    if (typeof handler.handle !== 'function') {
      console.warn(`⚠️ モーダルモジュールに handle 関数がありません: ${file}`);
      continue;
    }

    if (typeof handler.customId === 'string') {
      handlers[handler.customId] = handler;
    } else if (typeof handler.customIdStart === 'string') {
      startsWithHandlers.push({ key: handler.customIdStart, handler });
    } else {
      console.warn(`⚠️ モーダルモジュールに customId/customIdStart が未定義: ${file}`);
    }

  } catch (err) {
    console.warn(`❌ モーダルファイルの読み込みに失敗 (${file}):`, err);
  }
}

/**
 * モーダル customId に対応するハンドラを探す（完全一致 → 前方一致）
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
