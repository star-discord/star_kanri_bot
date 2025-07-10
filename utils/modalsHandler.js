// utils/modalsHandler.js
const path = require('path');

async function handleModal(interaction) {
  const customId = interaction.customId;
  const [commandName, action] = customId.split(':');

  try {
    const handlerPath = path.resolve(__dirname, `./${commandName}/modals.js`);
    const handlers = require(handlerPath);

    if (typeof handlers[action] === 'function') {
      await handlers[action](interaction);
    } else {
      console.warn(`❓ 不明なモーダルアクション: ${action} (${customId})`);
    }
  } catch (err) {
    console.error(`❌ モーダルハンドラー読み込みエラー: ${customId}`, err);
  }
}

module.exports = { handleModal };
