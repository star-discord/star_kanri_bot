// utils/index.js

const fs = require('fs');
const path = require('path');

/**
 * ディレクトリ内のハンドラモジュールを読み込み、customIdおよびcustomIdStartで管理する
 * @param {string} dir - ハンドラが置かれたディレクトリパス
 * @returns {{
 *   handlers: Record<string, {customId?: string, customIdStart?: string, handle: Function}>,
 *   startsWithHandlers: Array<{key: string, handler: {customIdStart: string, handle: Function}}>,
 * }}
 */
function loadHandlers(dir) {
  const handlers = {};
  const startsWithHandlers = [];

  if (!fs.existsSync(dir)) {
    console.warn(`[utils/index.js] ハンドラディレクトリが存在しません: ${dir}`);
    return { handlers, startsWithHandlers };
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      delete require.cache[require.resolve(fullPath)];
      const handler = require(fullPath);

      if (typeof handler.handle !== 'function') {
        console.warn(`[utils/index.js] handle関数がありません: ${file}`);
        continue;
      }

      if (typeof handler.customId === 'string') {
        if (handlers[handler.customId]) {
          console.warn(`[utils/index.js] customId "${handler.customId}" が重複しています。スキップ: ${file}`);
          continue;
        }
        handlers[handler.customId] = handler;

      } else if (typeof handler.customIdStart === 'string') {
        if (startsWithHandlers.some(h => h.key === handler.customIdStart)) {
          console.warn(`[utils/index.js] customIdStart "${handler.customIdStart}" が重複しています。スキップ: ${file}`);
          continue;
        }
        startsWithHandlers.push({ key: handler.customIdStart, handler });

      } else {
        console.warn(`[utils/index.js] customId または customIdStart が未定義: ${file}`);
      }
    } catch (error) {
      console.error(`[utils/index.js] ハンドラ読み込みエラー (${file}):`, error);
    }
  }

  // 長いプレフィックス優先にソート
  startsWithHandlers.sort((a, b) => b.key.length - a.key.length);

  return { handlers, startsWithHandlers };
}

/**
 * customIdに対応するハンドラを取得する
 * @param {string} customId
 * @param {{
 *   handlers: Record<string, {customId?: string, customIdStart?: string, handle: Function}>,
 *   startsWithHandlers: Array<{key: string, handler: {customIdStart: string, handle: Function}}>,
 * }} handlerSet
 * @returns {{customId?: string, customIdStart?: string, handle: Function}|null}
 */
function findHandler(customId, handlerSet) {
  if (!customId || typeof customId !== 'string') {
    console.warn(`[utils/index.js] 無効なcustomId: ${customId}`);
    return null;
  }

  if (handlerSet.handlers[customId]) return handlerSet.handlers[customId];

  for (const { key, handler } of handlerSet.startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  // console.warn(`[utils/index.js] 対応するハンドラが見つかりません: ${customId}`);
  return null;
}

const buttonsDir = path.join(__dirname, 'star_chat_gpt_setti', 'buttons');
const modalsDir = path.join(__dirname, 'star_chat_gpt_setti', 'modals');
const selectsDir = path.join(__dirname, 'star_chat_gpt_setti', 'selects');

const buttons = loadHandlers(buttonsDir);
const modals = loadHandlers(modalsDir);
const selects = loadHandlers(selectsDir);

module.exports = {
  buttons,
  modals,
  selects,
  findHandler,
};
