// utils/handlerLoader.js
const fs = require('fs');
const path = require('path');

/**
 * 指定ディレクトリからハンドラを読み込み、customId/customIdStart によるルーティング関数を返す
 * 各ハンドラは { customId, handle } または { customIdStart, handle } をエクスポートする必要がある
 * 
 * @param {string} dirPath - 読み込むディレクトリの絶対パス
 * @returns {(customId: string) => object|null} - 対応するハンドラを返す関数
 */
function loadHandlers(dirPath) {
  const handlers = {};              // 完全一致用
  const startsWithHandlers = [];    // 前方一致用

  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️ [handlerLoader] ディレクトリが存在しません: ${dirPath}`);
    return () => null;
  }

  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const modulePath = path.join(dirPath, file);
    try {
      // キャッシュクリア（開発中のみ有効）
      delete require.cache[require.resolve(modulePath)];

      const mod = require(modulePath);

      if (mod && typeof mod.handle === 'function') {
        if (typeof mod.customId === 'string') {
          handlers[mod.customId] = mod;
        } else if (typeof mod.customIdStart === 'string') {
          startsWithHandlers.push({ key: mod.customIdStart, handler: mod });
        } else {
          console.warn(`⚠️ [handlerLoader] ${file} に customId または customIdStart が定義されていません`);
        }
      } else {
        console.warn(`⚠️ [handlerLoader] ${file} は有効なハンドラではありません（handle 関数が未定義）`);
      }

    } catch (err) {
      console.error(`❌ [handlerLoader] ハンドラの読み込み失敗: ${file}`, err);
    }
  }

  /**
   * customId に対応するハンドラを返す（完全一致優先 → 前方一致）
   * @param {string} customId
   * @returns {object|null}
   */
  return function findHandler(customId) {
    if (handlers[customId]) return handlers[customId];

    for (const { key, handler } of startsWithHandlers) {
      if (customId.startsWith(key)) return handler;
    }

    console.warn(`⚠️ [handlerLoader] 対応するハンドラが見つかりません: ${customId}`);
    return null;
  };
}

module.exports = { loadHandlers };
