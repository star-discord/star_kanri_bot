// utils/buttonsHandler.js
const path = require('path');
const fs = require('fs');

/**
 * ファイル名やIDに使える安全な文字列かを検証する
 */
function isSafeName(str) {
  return /^[a-zA-Z0-9_\-]+$/.test(str);
}

/**
 * ボタンインタラクションの処理
 */
async function handleButton(interaction) {
  const customId = interaction.customId;

  // 形式: 'totusuna_setti:<action>' or 'totusuna_setti:<action>:extra1:extra2...'
  const [commandName, action, ...rest] = customId.split(':');
  const args = rest.length > 0 ? rest : [];

  // 安全性チェック
  if (!isSafeName(commandName) || !isSafeName(action)) {
    console.warn(`⚠️ 不正なボタンID: ${customId}`);
    return await interaction.reply({
      content: '⚠️ 無効なボタン操作です。',
      ephemeral: true
    });
  }

  const buttonFilePath = path.resolve(__dirname, `${commandName}/buttons/${action}.js`);

  try {
    if (!fs.existsSync(buttonFilePath)) {
      console.warn(`⚠️ ボタンファイルが存在しません: ${buttonFilePath}`);
      return await interaction.reply({
        content: '⚠️ このボタンは現在無効です。',
        ephemeral: true
      });
    }

    const handler = require(buttonFilePath);
    if (typeof handler !== 'function') {
      console.warn(`⚠️ 関数が見つかりません: ${buttonFilePath}`);
      return await interaction.reply({
        content: '⚠️ ボタン処理に問題があります。',
        ephemeral: true
      });
    }

    // 呼び出し（Promise.resolveで同期・非同期どちらも対応）
    await Promise.resolve(handler(interaction, ...args));

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

