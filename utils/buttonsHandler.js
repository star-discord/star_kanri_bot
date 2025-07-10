// utils/buttonsHandler.js
const path = require('path');
const fs = require('fs');

async function handleButton(interaction) {
  const customId = interaction.customId;

  // customId形式: 'totusuna_setti:<action>' or 'totusuna_setti:<action>:<extra>'
  const [commandName, action, ...rest] = customId.split(':');
  const args = rest.length > 0 ? rest : [];

  const buttonFilePath = path.resolve(__dirname, `${commandName}/buttons/${action}.js`);

  try {
    if (!fs.existsSync(buttonFilePath)) {
      console.warn(`⚠️ ボタンファイルが存在しません: ${buttonFilePath}`);
      return;
    }

    const handler = require(buttonFilePath);
    if (typeof handler !== 'function') {
      console.warn(`⚠️ ファイル内に有効な関数が見つかりません: ${buttonFilePath}`);
      return;
    }

    // 呼び出し：interaction + customIdの残り部分を渡す
    await handler(interaction, ...args);

  } catch (err) {
    console.error(`❌ ボタン処理中にエラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ ボタン処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleButton };
