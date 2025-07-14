// utils/totusuna_setti/modals.js
const fs = require('fs');
const path = require('path');

const modalsDir = path.join(__dirname, 'modals');
const isDevelopment = process.env.NODE_ENV === 'development';

function logWarn(...args) {
  console.warn(new Date().toISOString(), '[modals.js]', ...args);
}

let handlers = {};
let startsWithHandlers = [];

/**
 * モーダルハンドラを同期的にロード（複数回呼び出しても安全）
 */
function loadHandlersSync() {
  handlers = {};
  startsWithHandlers = [];

  let files;
  try {
    files = fs.readdirSync(modalsDir).filter(f => f.endsWith('.js'));
  } catch (err) {
    logWarn('モーダルディレクトリの読み込みに失敗しました:', err);
    return;
  }

  for (const file of files) {
    const modulePath = path.join(modalsDir, file);
    try {
      if (isDevelopment) {
        delete require.cache[require.resolve(modulePath)];
      }
      const handler = require(modulePath);

      if (typeof handler.handle !== 'function') {
        logWarn(`handle関数がありません: ${file}`);
        continue;
      }

      if (typeof handler.customId === 'string') {
        handlers[handler.customId] = handler;
      } else if (typeof handler.customIdStart === 'string') {
        startsWithHandlers.push({ key: handler.customIdStart, handler });
      } else {
        logWarn(`customId/customIdStart未定義: ${file}`);
      }
    } catch (err) {
      logWarn(`モジュール読み込み失敗 (${file}):`, err);
    }
  }

  // 前方一致キーを長い順にソートして優先度付け
  startsWithHandlers.sort((a, b) => b.key.length - a.key.length);
}

// 初回ロード
loadHandlersSync();

/**
 * モーダルcustomIdに対応するハンドラを返す
 * 完全一致優先、次に前方一致
 * @param {string} customId
 * @returns {{handle: Function, customId?: string, customIdStart?: string} | null}
 */
function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  logWarn(`対応するモーダルハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
module.exports.loadHandlersSync = loadHandlersSync; // 必要なら外部から再ロード可能
