const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Handler
 * @property {string} [customId]
 * @property {string} [customIdStart]
 * @property {(interaction: any) => Promise<void>} handle
 */

/**
 * 指定ディレクトリからハンドラを読み込み、customId/customIdStart によるルーティング関数を返す
 * 各ハンドラは { customId, handle } または { customIdStart, handle } をエクスポートする必要がある
 * 
 * @param {string} dirPath - 読み込むディレクトリの絶対パス
 * @returns {(customId: string) => Handler|null} - 対応するハンドラを返す関数
 */
function loadHandlers(dirPath) {
  const handlers = {};              // 完全一致用ハンドラ格納
  const startsWithHandlers = [];    // 前方一致用ハンドラ格納
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️ [handlerLoader] ディレクトリが存在しません: ${dirPath}`);
    return () => null;
  }

  const files = fs.readdirSync(dirPath).filter(file => 
    file.endsWith('.js') && 
    file !== 'index.js' && 
    file !== 'handleSelect.js' && 
    file !== 'install_channel.js'
  );

  for (const file of files) {
    const modulePath = path.join(dirPath, file);
    try {
      // 開発中のキャッシュクリア
      delete require.cache[require.resolve(modulePath)];

      const mod = require(modulePath);

      if (mod && typeof mod.handle === 'function') {
        if (typeof mod.customId === 'string') {
          if (handlers[mod.customId]) {
            console.warn(`⚠️ [handlerLoader] ${file} の customId "${mod.customId}" は既に登録されています。上書きされます。`);
          }
          handlers[mod.customId] = mod;
        } else if (typeof mod.customIdStart === 'string') {
          // 重複チェックし、重複ならスキップ
          if (startsWithHandlers.some(h => h.key === mod.customIdStart)) {
            console.warn(`⚠️ [handlerLoader] 重複する customIdStart "${mod.customIdStart}" があるためスキップ: ${file}`);
            continue;
          }
          startsWithHandlers.push({ key: mod.customIdStart, handler: mod });
        } else {
          console.warn(`⚠️ [handlerLoader] ${file} に customId または customIdStart が定義されていません`);
        }
      } else {
        console.warn(`⚠️ [handlerLoader] ${file} は有効なハンドラではありません（handle 関数が未定義）`);
      }
    } catch (err) {
      console.error(`❌ [handlerLoader] ハンドラの読み込み失敗 (${file}):`, err);
    }
  }

  // 前方一致ハンドラはキー長の降順でソートし、より長いプレフィックスを優先
  startsWithHandlers.sort((a, b) => b.key.length - a.key.length);

  // [追加] 読み込んだハンドラの総数をログに出力
  const totalLoaded = Object.keys(handlers).length + startsWithHandlers.length;
  if (totalLoaded > 0) {
    console.log(`[handlerLoader] ✅ ${path.basename(dirPath)}: ${totalLoaded}個のハンドラを読み込みました。`);
  }

  /**
   * customId に対応するハンドラを返す（完全一致優先→前方一致）
   * @param {string} customId
   * @returns {Handler|null}
   */
  return function findHandler(customId) {
    if (handlers[customId]) {
      return handlers[customId];
    }

    for (const { key, handler } of startsWithHandlers) {
      if (customId.startsWith(key)) {
        return handler;
      }
    }

    return null;
  };
}

module.exports = { loadHandlers };
