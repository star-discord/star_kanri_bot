// utils/handlerLoader.js

const fs = require('fs');
const path = require('path');

// 除外ファイル一覧
const EXCLUDED_FILES = new Set(['index.js', 'handleSelect.js', 'install_channel.js']);

/**
 * @typedef {object} Handler
 * @property {string} [customId] - 完全一致する customId
 * @property {string} [customIdStart] - 前方一致する customId
 * @property {(interaction: import('discord.js').Interaction) => Promise<void>} handle - インタラクションを処理する関数
 */

/**
 * 有効なハンドラかを検証
 * @param {*} mod 
 * @returns {boolean}
 */
function isValidHandler(mod) {
  return (
    mod &&
    typeof mod.handle === 'function' &&
    (typeof mod.customId === 'string' || typeof mod.customIdStart === 'string')
  );
}

/**
 * 指定ディレクトリからハンドラを読み込んでルーティング関数を返す
 * @description この関数は同期的に実行されます。
 * @param {string} dirPath - ディレクトリの絶対パス
 * @returns {(customId: string) => Handler|null}
 */
function loadHandlers(dirPath) {
  const handlers = {};
  const startsWithHandlers = [];

  let fileNames;
  try {
    fileNames = fs.readdirSync(dirPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠️ [handlerLoader] ディレクトリが存在しません: ${dirPath}`);
    } else {
      console.error(`❌ [handlerLoader] ディレクトリ読み込み失敗: ${dirPath}`, err.stack);
    }
    return () => null;
  }

  const files = fileNames.filter(file => file.endsWith('.js') && !EXCLUDED_FILES.has(file));

  for (const file of files) {
    const modulePath = path.join(dirPath, file);
    try {
      if (process.env.NODE_ENV !== 'production') {
        delete require.cache[require.resolve(modulePath)];
      }

      const mod = require(modulePath);

      if (!isValidHandler(mod)) {
        console.warn(`⚠️ [handlerLoader] 無効なハンドラ: ${file}`);
        continue;
      }

      if (mod.customId) {
        if (handlers[mod.customId]) {
          console.warn(
            `⚠️ [handlerLoader] ${file} の customId "${mod.customId}" が重複しています。上書きします。`
          );
        }
        handlers[mod.customId] = mod;
      } else if (mod.customIdStart) {
        const duplicate = startsWithHandlers.find(h => h.key === mod.customIdStart);
        if (duplicate) {
          console.warn(
            `⚠️ [handlerLoader] customIdStart "${mod.customIdStart}" が '${path.basename(
              duplicate.filePath
            )}' と重複。'${file}' はスキップされます。`
          );
          continue;
        }
        startsWithHandlers.push({ key: mod.customIdStart, handler: mod, filePath: modulePath });
      }

    } catch (err) {
      console.error(`❌ [handlerLoader] 読み込み失敗 (${file}):`, err.stack);
    }
  }

  // 長い prefix 優先
  startsWithHandlers.sort((a, b) => b.key.length - a.key.length);

  const dirName = path.basename(dirPath);
  if (Object.keys(handlers).length > 0) {
    console.log(
      `[handlerLoader] 読み込み完了: ${dirName} 完全一致 -> ${Object.keys(handlers).join(', ')}`
    );
  }
  if (startsWithHandlers.length > 0) {
    console.log(
      `[handlerLoader] 読み込み完了: ${dirName} 前方一致 -> ${startsWithHandlers.map(h => h.key).join(', ')}`
    );
  }

  const total = Object.keys(handlers).length + startsWithHandlers.length;
  if (total > 0) {
    console.log(`[handlerLoader] ✅ ${dirName}: 全 ${total} 個のハンドラを登録`);
  }

  /**
   * customId に対応するハンドラを返す
   * @param {string} customId
   * @returns {Handler|null}
   */
  return function findHandler(customId) {
    if (handlers[customId]) return handlers[customId];

    for (const { key, handler } of startsWithHandlers) {
      if (customId.startsWith(key)) return handler;
    }

    return null;
  };
}

module.exports = { loadHandlers };
