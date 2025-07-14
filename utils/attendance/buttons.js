// attendance用ボタンローダー
//
// buttons/ 配下に customId, handle をエクスポートするボタンハンドラを追加・修正するだけで、
// このローダーが自動で全て集約します。
// 例: utils/attendance/buttons/attendance_work_start_20.js など
const fs = require('fs');
const path = require('path');

const handlers = {};
const startsWithHandlers = [];

const buttonsDir = path.join(__dirname, 'buttons');
if (fs.existsSync(buttonsDir)) {
  const files = fs.readdirSync(buttonsDir).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const modulePath = path.join(buttonsDir, file);
    try {
      delete require.cache[require.resolve(modulePath)];
      const handler = require(modulePath);
      if (typeof handler.handle !== 'function') {
        console.warn(`⚠️ ボタンモジュールに handle 関数がありません: ${file}`);
        continue;
      }
      if (typeof handler.customId === 'string') {
        handlers[handler.customId] = handler;
      } else if (typeof handler.customIdStart === 'string') {
        startsWithHandlers.push({ key: handler.customIdStart, handler });
      } else {
        console.warn(`⚠️ ボタンモジュールに customId/customIdStart が未定義: ${file}`);
      }
    } catch (err) {
      console.warn(`❌ ボタンファイルの読み込みに失敗 (${file}):`, err);
    }
  }
}

function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];
  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }
  console.warn(`⚠️ 対応するボタンハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
module.exports.handlers = handlers;
