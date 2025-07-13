// utils/totusuna_quick/buttons.js
// buttons/配下の個別ハンドラを集約してエクスポート
const fs = require('fs');
const path = require('path');

const handlers = {};
const startsWithHandlers = [];
const buttonsDir = path.join(__dirname, 'buttons');
if (fs.existsSync(buttonsDir)) {
  const files = fs.readdirSync(buttonsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = require(path.join(buttonsDir, file));
    if (typeof mod.handle === 'function') {
      if (typeof mod.customId === 'string') {
        handlers[mod.customId] = mod;
      } else if (typeof mod.customIdStart === 'string') {
        startsWithHandlers.push({ key: mod.customIdStart, handler: mod });
      }
    }
  }
}
module.exports = function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];
  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }
  return null;
};
