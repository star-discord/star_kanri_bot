// utils/totusuna_setti/selects.js
const fs = require('fs');
const path = require('path');

/**
 * @type {Record<string, {handle: Function, customId?: string, customIdStart?: string}>}
 */
const handlers = {};
/**
 * @type {Array<{key: string, handler: {handle: Function}}>}
 */
const startsWithHandlers = [];

const selectsDir = path.join(__dirname, 'selects');

if (!fs.existsSync(selectsDir)) {
  console.warn(`⚠️ [selects] ディレクトリが存在しません: ${selectsDir}`);
} else {
  const files = fs.readdirSync(selectsDir).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const modulePath = path.join(selectsDir, file);
    try {
      delete require.cache[require.resolve(modulePath)]; // キャッシュクリア（開発時用）

      const handler = require(modulePath);

      if (!handler || typeof handler.handle !== 'function') {
        console.warn(`⚠️ [selects] ${file} に handle 関数がありません`);
        continue;
      }

      if (typeof handler.customId === 'string') {
        if (handlers[handler.customId]) {
          console.warn(`⚠️ [selects] ${file} の customId が重複しています: ${handler.customId}`);
        }
        handlers[handler.customId] = handler;
      } else if (typeof handler.customIdStart === 'string') {
        if (startsWithHandlers.find(h => h.key === handler.customIdStart)) {
          console.warn(`⚠️ [selects] ${file} の customIdStart が重複しています: ${handler.customIdStart}`);
        }
        startsWithHandlers.push({ key: handler.customIdStart, handler });
      } else {
        console.warn(`⚠️ [selects] ${file} に customId または customIdStart が定義されていません`);
      }
    } catch (error) {
      console.error(`❌ [selects] ファイルの読み込み中に例外が発生しました: ${file}`, error);
    }
  }
}

/**
 * customId に対応するセレクトメニュー用ハンドラを返す（完全一致優先 → 前方一致）
 * @param {string} customId
 * @returns {{handle: Function}|null}
 */
function findHandler(customId) {
  if (handlers[customId]) {
    return handlers[customId];
  }

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  console.warn(`⚠️ [selects] 対応するハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
