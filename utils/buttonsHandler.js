// utils/buttonsHandler.js
const path = require('path');
const fs = require('fs');

/**
 * ファイル名やIDに使える安全な文字列かを検証する
 * @param {string} str
 * @returns {boolean}
 */
function isSafeName(str) {
  return typeof str === 'string' && /^[a-zA-Z0-9_\-]+$/.test(str);
}

/**
 * ボタンインタラクションの処理
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  const customId = interaction.customId;

  // フォーマット: 'コマンド名:アクション:引数1:引数2...'
  const [commandName, action, ...args] = customId.split(':');

  // 安全性チェック
  if (!isSafeName(commandName) || !isSafeName(action)) {
    console.warn(`⚠️ 不正なカスタムID: ${customId}`);
    return await interaction.reply({
      content: '⚠️ 無効なボタン操作です。',
      ephemeral: true
    });
  }

  const handlerPath = path.join(__dirname, commandName, 'buttons', `${action}.js`);

  try {
    if (!fs.existsSync(handlerPath)) {
      console.warn(`⚠️ ボタン処理ファイルが存在しません: ${handlerPath}`);
      return await interaction.reply({
        content: '⚠️ このボタンは現在利用できません。',
        ephemeral: true
      });
    }

    const handler = require(handlerPath);
    if (typeof handler !== 'function') {
      console.warn(`⚠️ 無効なエクスポート: ${handlerPath}`);
      return await interaction.reply({
        content: '⚠️ このボタンの処理が正しく構成されていません。',
        ephemeral: true
      });
    }

    // 処理実行（同期/非同期 両対応）
    await Promise.resolve(handler(interaction, ...args));

  } catch (error) {
    console.error(`❌ ボタン処理中に例外発生: ${customId}`, error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ ボタン処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleButton };

