// utils/buttonsHandler.js
const path = require('path');

async function handleButton(interaction) {
  const customId = interaction.customId;
  const [commandName, action] = customId.split(':');

  try {
    const handlerPath = path.resolve(__dirname, `./${commandName}/buttons.js`);
    const handlers = require(handlerPath);

    if (typeof handlers[action] === 'function') {
      await handlers[action](interaction);
    } else {
      console.warn(`❓ 不明なアクション: ${action} (${customId})`);
    }
  } catch (err) {
    console.error(`❌ ボタンハンドラー読み込みエラー: ${customId}`, err);
  }
}

module.exports = { handleButton };
