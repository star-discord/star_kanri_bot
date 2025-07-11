const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { InteractionResponseFlags } = require('discord.js'); // 追加

const findHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/buttons'));

/**
 * ボタンインタラクションの処理
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;
  const handler = findHandler(customId);

  if (!handler) {
    console.warn(`⚠️ 未対応のボタン: ${customId}`);
    return await interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`❌ ボタン処理エラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ ボタン処理中にエラーが発生しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  }
}

module.exports = { handleButton };
