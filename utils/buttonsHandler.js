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

  const [commandName] = customId.split(':');

  // 安全性チェック
  if (!isSafeName(commandName)) {
    console.warn(`⚠️ 不正なカスタムID: ${customId}`);
    return await interaction.reply({
      content: '⚠️ 無効なボタン操作です。',
      ephemeral: true
    });
  }

  // まず utils/<command>/buttons.js があれば読み込む（静的ルーティング）
  const buttonsIndexPath = path.join(__dirname, commandName, 'buttons.js');
  if (fs.existsSync(buttonsIndexPath)) {
    try {
      const buttonsMap = require(buttonsIndexPath);

      // 静的 customId での一致
      if (buttonsMap[customId]) {
        return await buttonsMap[customId].handle(interaction);
      }

      // 動的 customIdStart に対応するものを探す
      for (const key in buttonsMap) {
        const handler = buttonsMap[key];
        if (handler.customIdStart && customId.startsWith(handler.customIdStart)) {
          return await handler.handle(interaction);
        }
      }
    } catch (err) {
      console.error(`❌ ${buttonsIndexPath} の読み込み中にエラー:`, err);
    }
  }

  // 次に utils/<command>/buttons/<action>.js を探す（ファイル直接参照）
  const [_, action] = customId.split(':'); // commandName は上ですでに取得
  if (!isSafeName(action)) {
    return await interaction.reply({
      content: '⚠️ 無効なボタンアクションです。',
      ephemeral: true
    });
  }

  const handlerPath = path.join(__dirname, commandName, 'buttons', `${action}.js`);
  if (fs.existsSync(handlerPath)) {
    try {
      const handler = require(handlerPath);

      // static ID または customIdStart に対応
      if (
        (handler.customId && handler.customId === customId) ||
        (handler.customIdStart && customId.startsWith(handler.customIdStart))
      ) {
        return await handler.handle(interaction);
      }
    } catch (err) {
      console.error(`❌ ボタン処理中にエラー: ${customId}`, err);
    }
  }

  // 最後のフォールバック
  console.warn(`⚠️ ボタンハンドラーが見つかりません: ${customId}`);
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      ephemeral: true
    });
  }
}

module.exports = { handleButton };
