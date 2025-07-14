// utils/star_chat_gpt_setti/modals.js
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Handler
 * @property {string} [customId] - 完全一致用ID
 * @property {string} [customIdStart] - 前方一致用ID
 * @property {(interaction: any) => Promise<void>} handle - ハンドラ関数
 */

/** @type {Record<string, Handler>} */
const handlers = {};
/** @type {Array<{key: string, handler: Handler}>} */
const startsWithHandlers = [];

const modalsDir = path.join(__dirname, 'modals');
if (!fs.existsSync(modalsDir)) {
  console.warn(`⚠️ [modals] ディレクトリが存在しません: ${modalsDir}`);
} else {
  const files = fs.readdirSync(modalsDir).filter(file => file.endsWith('.js'));
  
  for (const file of files) {
    const modulePath = path.join(modalsDir, file);
    try {
      delete require.cache[require.resolve(modulePath)];
      const handler = require(modulePath);

      if (typeof handler.handle !== 'function') {
        console.warn(`⚠️ [modals] handle 関数がありません: ${file}`);
        continue;
      }

      if (typeof handler.customId === 'string') {
        if (handlers[handler.customId]) {
          console.warn(`⚠️ [modals] customId "${handler.customId}" が重複しています。スキップします: ${file}`);
          continue;
        }
        handlers[handler.customId] = handler;

      } else if (typeof handler.customIdStart === 'string') {
        if (startsWithHandlers.some(h => h.key === handler.customIdStart)) {
          console.warn(`⚠️ [modals] customIdStart "${handler.customIdStart}" が重複しています。スキップします: ${file}`);
          continue;
        }
        startsWithHandlers.push({ key: handler.customIdStart, handler });

      } else {
        console.warn(`⚠️ [modals] customId または customIdStart が未定義です: ${file}`);
      }

    } catch (err) {
      console.error(`❌ [modals] モジュール読み込み失敗 (${file}):`, err);
    }
  }
}

/**
 * customId に対応するモーダルハンドラを検索する（完全一致優先→前方一致）
 * @param {string} customId
 * @returns {Handler|null}
 */
function findHandler(customId) {
  if (handlers[customId]) {
    return handlers[customId];
  }

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) {
      return handler;
    }
  }

  console.warn(`⚠️ [modals] 対応するハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = { findHandler };
