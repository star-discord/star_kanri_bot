const fs = require('fs');
const path = require('path');

/**
 * 持E��ディレクトリからハンドラを読み込み、customId/customIdStart によるルーチE��ング関数を返す
 * 吁E��ンドラは { customId, handle } また�E { customIdStart, handle } をエクスポ�Eトする忁E��がある
 * 
 * @param {string} dirPath - 読み込むチE��レクトリの絶対パス
 * @returns {(customId: string) => object|null} - 対応するハンドラを返す関数
 */
function loadHandlers(dirPath) {
  const handlers = {};              // 完�E一致用ハンドラ格紁E  const startsWithHandlers = [];    // 前方一致用ハンドラ格紁E
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠�E�E[handlerLoader] チE��レクトリが存在しません: ${dirPath}`);
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
      // キャチE��ュクリア�E�開発中のみ有効�E�E      delete require.cache[require.resolve(modulePath)];

      const mod = require(modulePath);

      if (mod && typeof mod.handle === 'function') {
        if (typeof mod.customId === 'string') {
          if (handlers[mod.customId]) {
            console.warn(`⚠�E�E[handlerLoader] ${file} の customId "${mod.customId}" は既に登録されてぁE��す。上書きされます。`);
          }
          handlers[mod.customId] = mod;
        } else if (typeof mod.customIdStart === 'string') {
          if (startsWithHandlers.some(h => h.key === mod.customIdStart)) {
            console.warn(`⚠�E�E[handlerLoader] ${file} の customIdStart "${mod.customIdStart}" は既に登録されてぁE��す。上書きされます。`);
          }
          startsWithHandlers.push({ key: mod.customIdStart, handler: mod });
        } else {
          console.warn(`⚠�E�E[handlerLoader] ${file} に customId また�E customIdStart が定義されてぁE��せん`);
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

  /**
   * customId に対応するハンドラを返す�E�完�E一致優允EↁE前方一致�E�E   * @param {string} customId
   * @returns {object|null}
   */
  return function findHandler(customId) {
    if (handlers[customId]) return handlers[customId];

    for (const { key, handler } of startsWithHandlers) {
      if (customId.startsWith(key)) return handler;
    }

    console.warn(`⚠�E�E[handlerLoader] 対応するハンドラが見つかりません: ${customId}`);
    return null;
  };
}

module.exports = { loadHandlers };
