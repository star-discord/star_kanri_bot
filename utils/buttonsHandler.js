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

  const basePath = path.join(__dirname, commandName);
  const actionPath = path.join(basePath, 'buttons', `${action}.js`);
  const fallbackPath = path.join(basePath, 'buttons.js');

  try {
    if (fs.existsSync(actionPath)) {
      const handler = require(actionPath);
      if (typeof handler !== 'function') {
        throw new Error('ボタンモジュールは関数をエクスポートする必要があります');
      }
      await Promise.resolve(handler(interaction, ...args));
      return;
    }

    if (fs.existsSync(fallbackPath)) {
      const handlers = require(fallbackPath);
      const target = handlers[action];
      if (typeof target !== 'function') {
        throw new Error(`buttons.js にアクション ${action} の関数が見つかりません`);
      }
      await Promise.resolve(target(interaction, ...args));
      return;
    }

    // どちらのファイルも見つからなかった
    console.warn(`⚠️ ボタン処理ファイルが見つかりません: ${actionPath} または ${fallbackPath}`);
    await interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      ephemeral: true
    });

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

