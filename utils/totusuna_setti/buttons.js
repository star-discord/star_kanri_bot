// utils/totusuna_setti/buttons.js
const fs = require('fs');
const path = require('path');

/** @typedef {Object} Handler
 *  @property {string} [customId] - 完全一致用のカスタムID
 *  @property {string} [customIdStart] - 前方一致用のカスタムIDプレフィックス
 *  @property {(interaction: any) => Promise<void>} handle - ハンドラ実装
 */

const handlers = {};
const startsWithHandlers = [];

const buttonsDir = path.join(__dirname, 'buttons');
const enableCacheClear = true;

/**
 * ログ出力（日時付き）
 * @param {'warn'|'error'|'info'} level ログレベル
 * @param {string} message ログメッセージ
 * @param {Error=} err エラーオブジェクト（任意）
 */
function log(level, message, err) {
  const now = new Date().toISOString();
  const prefix = `[buttons.js] ${now}`;
  if (level === 'warn') {
    if (err) console.warn(`${prefix} ⚠️ ${message}`, err);
    else console.warn(`${prefix} ⚠️ ${message}`);
  } else if (level === 'error') {
    if (err) console.error(`${prefix} ❌ ${message}`, err);
    else console.error(`${prefix} ❌ ${message}`);
  } else {
    if (err) console.log(`${prefix} ℹ️ ${message}`, err);
    else console.log(`${prefix} ℹ️ ${message}`);
  }
}

if (!fs.existsSync(buttonsDir)) {
  log('warn', `ボタンディレクトリが存在しません: ${buttonsDir}`);
} else {
  const files = fs.readdirSync(buttonsDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const modulePath = path.join(buttonsDir, file);

    try {
      if (enableCacheClear) {
        delete require.cache[require.resolve(modulePath)];
      }

      const handler = require(modulePath);

      if (typeof handler.handle !== 'function') {
        log('warn', `handle関数未定義: ${file}`);
        continue;
      }

      if (typeof handler.customId === 'string') {
        if (handlers[handler.customId]) {
          log('warn', `重複するcustomId "${handler.customId}" があるためスキップ: ${file}`);
          continue;
        }
        handlers[handler.customId] = handler;

      } else if (typeof handler.customIdStart === 'string') {
        if (startsWithHandlers.some(h => h.key === handler.customIdStart)) {
          log('warn', `重複するcustomIdStart "${handler.customIdStart}" があるためスキップ: ${file}`);
          continue;
        }
        startsWithHandlers.push({ key: handler.customIdStart, handler });

      } else {
        log('warn', `customId/customIdStart未定義のためスキップ: ${file}`);
        continue;
      }

    } catch (err) {
      log('error', `ボタンファイル読み込み失敗 (${file}):`, err);
    }
  }
}

/** 
 * 前方一致ハンドラをプレフィックス長の降順にソートする
 */
function sortStartsWithHandlers() {
  startsWithHandlers.sort((a, b) => b.key.length - a.key.length);
}

sortStartsWithHandlers();

/**
 * customIdに対応するボタンハンドラを取得
 * 完全一致優先、なければ前方一致で検索
 * @param {string} customId
 * @returns {Handler|null} ハンドラまたはnull
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

  log('warn', `対応するボタンハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
