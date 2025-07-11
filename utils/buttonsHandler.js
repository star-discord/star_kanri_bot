// utils/buttonsHandler.js
const path = require('path');
const { isSafeName } = require('./validator'); // 任意：バリデーションが必要な場合
const findHandler = require('./totusuna_setti/buttons');

/**
 * ボタンインタラクションの処理
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  const customId = interaction.customId;

  // オプション：IDの安全性チェック（必要な場合）
  if (typeof customId !== 'string') {
    console.warn(`⚠️ 不正なカスタムID: ${customId}`);
    return await interaction.reply({
      content: '⚠️ 無効なボタン操作です。',
      ephemeral: true
    });
  }

  const handler = findHandler(customId);

  if (!handler) {
    console.warn(`⚠️ 未対応のボタン: ${customId}`);
    return await interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      ephemeral: true
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`❌ ボタン処理エラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ ボタン処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleButton };

