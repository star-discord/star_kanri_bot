// utils/star_chat_gpt_setti/buttons.js
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Handler
 * @property {string} [customId]
 * @property {string} [customIdStart]
 * @property {(interaction: any) => Promise<void>} handle
 */

const handlers = {};
const startsWithHandlers = [];

const buttonsDir = path.join(__dirname, 'buttons');

if (!fs.existsSync(buttonsDir)) {
  console.warn(`[star_chat_gpt_setti/buttons] ボタンディレクトリが存在しません: ${buttonsDir}`);
} else {
  const files = fs.readdirSync(buttonsDir).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const modulePath = path.join(buttonsDir, file);
    try {
      delete require.cache[require.resolve(modulePath)];
      const handler = require(modulePath);

      if (typeof handler.handle !== 'function') {
        console.warn(`[star_chat_gpt_setti/buttons] handle関数がありません: ${file}`);
        continue;
      }

      if (typeof handler.customId === 'string') {
        if (handlers[handler.customId]) {
          console.warn(`[star_chat_gpt_setti/buttons] customId "${handler.customId}" は既に登録済み。スキップ: ${file}`);
          continue;
        }
        handlers[handler.customId] = handler;

      } else if (typeof handler.customIdStart === 'string') {
        if (startsWithHandlers.some(h => h.key === handler.customIdStart)) {
          console.warn(`[star_chat_gpt_setti/buttons] customIdStart "${handler.customIdStart}" は既に登録済み。スキップ: ${file}`);
          continue;
        }
        startsWithHandlers.push({ key: handler.customIdStart, handler });

      } else {
        console.warn(`[star_chat_gpt_setti/buttons] customId/customIdStart が未定義: ${file}`);
      }
    } catch (err) {
      console.warn(`[star_chat_gpt_setti/buttons] ファイル読み込み失敗 (${file}):`, err);
    }
  }

  // 長いプレフィックス優先
  startsWithHandlers.sort((a, b) => b.key.length - a.key.length);
}

/**
 * customIdに対応するChatGPTボタンハンドラを返す（完全一致優先→前方一致）
 * @param {string} customId
 * @returns {Handler|null}
 */
function findHandler(customId) {
  if (!customId || typeof customId !== 'string') {
    console.warn('[star_chat_gpt_setti/buttons] 無効なcustomId:', customId);
    return null;
  }

  if (handlers[customId]) {
    return handlers[customId];
  }

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) {
      return handler;
    }
  }

  console.warn(`[star_chat_gpt_setti/buttons] 対応するハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = {
  findHandler,
  handlers,
};
