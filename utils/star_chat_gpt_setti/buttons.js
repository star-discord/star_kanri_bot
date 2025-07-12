// utils/star_chat_gpt_setti/buttons.js
const fs = require('fs');
const path = require('path');

const handlers = {};
const startsWithHandlers = [];

const buttonsDir = path.join(__dirname, 'buttons');
const files = fs.readdirSync(buttonsDir).filter(file => file.endsWith('.js'));

for (const file of files) {
  const modulePath = path.join(buttonsDir, file);
  try {
    delete require.cache[require.resolve(modulePath)];
    const handler = require(modulePath);

    if (typeof handler.handle !== 'function') {
      console.warn(`⚠�E�EChatGPTボタンモジュールに handle 関数がありません: ${file}`);
      continue;
    }

    if (typeof handler.customId === 'string') {
      handlers[handler.customId] = handler;
    } else if (typeof handler.customIdStart === 'string') {
      startsWithHandlers.push({ key: handler.customIdStart, handler });
    } else {
      console.warn(`⚠�E�EChatGPTボタンモジュールに customId/customIdStart が未定義: ${file}`);
    }
  } catch (err) {
    console.warn(`❁EChatGPTボタンファイルの読み込みに失敁E(${file}):`, err);
  }
}

/**
 * customId に対応するChatGPTボタンハンドラを探す（完�E一致 ↁE前方一致�E�E
 * @param {string} customId
 * @returns {object|null}
 */
function findHandler(customId) {
  if (handlers[customId]) return handlers[customId];

  for (const { key, handler } of startsWithHandlers) {
    if (customId.startsWith(key)) return handler;
  }

  console.warn(`⚠�E�E対応するChatGPTボタンハンドラが見つかりません: ${customId}`);
  return null;
}

module.exports = findHandler;
