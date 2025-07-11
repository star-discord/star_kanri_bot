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

// セレクトフォルダ存在チェック
if (!fs.existsSync(selectsDir)) {
  console.warn(`⚠️ [totsusuna/selects] ディレクトリが存在しません: ${selectsDir}`);
} else {
  const files = fs.readdirSync(selectsDir).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const modulePath = path.join(selectsDir, file);
    try {
      delete require.cache[require.resolve(modulePath)]; // キャッシュ削除（開発用）

      const handler = require(modulePath);

      if (!handler || typeof handler.handle !== 'function') {
        console.warn(`⚠️ [totsusuna/selects] ${file} に handle 関数がありません`);
        continue;
      }

      if (typeof handler.customId === 'string') {
        if (handlers[handler.customId]) {
          console.warn(`⚠️ [totsusuna/selects] ${file} の customId が重複しています: ${handler.customId}`);
        }
        handlers[handler.customId] = handler;
      } else if (typeof handler.customIdStart === 'string') {
        if (startsWithHandlers.find(h => h.key === handler.customIdStart)) {
          console.warn(`⚠️ [totsusuna/selects] ${file} の customIdStart が重複しています: ${handler.customIdStart}`);
        }
        startsWithHandlers.push({ key: handler.customIdStart, handler });
      } else {
        console.warn(`⚠️ [totsusuna/selects] ${file} に customId または customIdStart が未定義です`);
      }
    } catch (err) {
      console.error(`❌ [totsusuna/selects] ${file} 読み込み失敗:`, err);
    }
  }
}

/**
 * totsusuna_setti 専用セレクトハンドラを customId で取得
 * 完全一致 → 前方一致
 * @param {string} customId
 * @returns {{handle: Function}|null}
 */
function findHandler(customId) {
  if (!customId.startsWith('totsusuna_setti:')) return null; // ← ★ ここで限定

  if (handlers[customId]) return handlers[customId];

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  console.warn(`⚠️ [totsusuna/selects] 対応するハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;

