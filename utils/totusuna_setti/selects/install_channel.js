const { MessageFlagsBitField } = require('discord.js');
const findHandler = require('../selects');

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  const handler = findHandler(customId);

  if (!handler || typeof handler.handle !== 'function') {
    await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      flags: MessageFlagsBitField.Ephemeral,
    });
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    console.error(`❌ セレクトメニュー処理エラー (${customId}):`, error);

    const errorMessage = {
      content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
      flags: MessageFlagsBitField.Ephemeral,
    };

    if (interaction.deferred && !interaction.replied) {
      await interaction.editReply(errorMessage);
    } else if (interaction.replied) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}

module.exports = { handleSelect };



