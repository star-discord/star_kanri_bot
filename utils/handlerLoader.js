// utils/handlerLoader.js
const fs = require('fs');
const path = require('path');

/**
 * 指定ディレクトリからハンドラを読み込み、customId/customIdStart によるルーティング関数を返す
 * @param {string} dirPath - モジュールを読み込むディレクトリ
 * @returns {(customId: string) => object|null} - customId に対応するハンドラを返す関数
 */
function loadHandlers(dirPath) {
  const handlers = {};
  const startsWithHandlers = [];

  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️ ディレクトリが存在しません: ${dirPath}`);
    return () => null;
  }

  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const modulePath = path.join(dirPath, file);
    try {
      delete require.cache[require.resolve(modulePath)]; // 開発中はキャッシュ削除
      const mod = require(modulePath);

      if (mod?.customId) {
        handlers[mod.customId] = mod;
      } else if (mod?.customIdStart) {
        startsWithHandlers.push({ key: mod.customIdStart, handler: mod });
      } else {
        console.warn(`⚠️ ハンドラに customId/customIdStart が見つかりません: ${file}`);
      }
    } catch (err) {
      console.warn(`❌ ファイルの読み込み失敗: ${file}`, err);
    }
  }

  return function findHandler(customId) {
    if (handlers[customId]) return handlers[customId];
    for (const { key, handler } of startsWithHandlers) {
      if (customId.startsWith(key)) return handler;
    }
    console.warn(`⚠️ 対応するハンドラが見つかりません: ${customId}`);
    return null;
  };
}

module.exports = { loadHandlers };
