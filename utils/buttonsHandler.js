// utils/buttonsHandler.js
const path = require('path');
const fs = require('fs');

/**
 * ファイル名やIDに使える安全な文字列かを検証する
 */
function isSafeName(str) {
  return typeof str === 'string' && /^[a-zA-Z0-9_\-]+$/.test(str);
}

/**
 * ボタンインタラクションの処理
 */
async function handleButton(interaction) {
  const customId = interaction.customId;

  // 形式: 'コマンド名:アクション:引数1:引数2...'
  const [commandName, action, ...rest] = customId.split(':');
  const args = rest;

  // 安全性チェック
  if (!isSafeName(commandName) || !isSafeName(action)) {
    console.warn(`⚠️ 無効なボタンID検出: ${customId}`);
    return await interaction.reply({
      content: '⚠️ 無効なボタン操作です。',
      ephemeral: true
    });
  }

  // ボタンハンドラーパス構築
  const actionHandlerPath = path.join(__dirname, commandName, 'buttons', `${action}.js`);

  try {
    if (!fs.existsSync(actionHandlerPath)) {
      console.warn(`⚠️ ボタンファイルが見つかりません: ${actionHandlerPath}`);
      return await interaction.reply({
        content: '⚠️ このボタンは現在無効です。',
        ephemeral: true
      });
    }

    const handler = require(actionHandlerPath);
    if (typeof handler !== 'function') {
      console.warn(`⚠️ ハンドラ関数が無効: ${actionHandlerPath}`);
      return await interaction.reply({
        content: '⚠️ ボタン処理が正しく構成されていません。',
        ephemeral: true
      });
    }

    // 実行（同期・非同期両対応）
    await Promise.resolve(handler(interaction, ...args));

  } catch (err) {
    console.error(`❌ ボタン処理中にエラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ ボタン処理中に予期せぬエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleButton };

