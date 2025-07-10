const path = require('path');
const fs = require('fs');

async function handleButton(interaction, client) {
  try {
    const customId = interaction.customId;

    // どのコマンドのボタンか推測（customIdを "totusuna:～" のように設計しておく）
    const [baseName, action] = customId.split(':');
    if (!baseName || !action) {
      console.warn('⚠️ customId の形式が不正です:', customId);
      return;
    }

    const handlerPath = path.join(__dirname, baseName, 'buttons.js');

    if (!fs.existsSync(handlerPath)) {
      console.warn(`⚠️ ボタンハンドラが存在しません: ${handlerPath}`);
      return;
    }

    const buttonModule = require(handlerPath);
    if (typeof buttonModule[action] !== 'function') {
      console.warn(`⚠️ ${baseName}/buttons.js に ${action} 関数が定義されていません`);
      return;
    }

    await buttonModule[action](interaction, client);
  } catch (err) {
    console.error('❌ ボタンハンドリング中にエラー:', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ ボタン処理中にエラーが発生しました。',
        ephemeral: true,
      });
    }
  }
}

module.exports = { handleButton };
