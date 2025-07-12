const { MessageFlags } = require('discord.js');
const findHandler = require('../selects');

/**
 * セレクトメニューインタラクションを�E琁E��るメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  const handler = findHandler(customId);

  if (!handler) {
    await interaction.reply({
      content: '❁Eセレクトメニューに対応する�E琁E��見つかりませんでした、E,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    console.error(`❁Eセレクトメニュー処琁E��ラー (${customId}):`, error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '⚠�E�Eセレクトメニュー処琁E��にエラーが発生しました。管琁E��E��報告してください、E,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: '⚠�E�Eセレクトメニュー処琁E��にエラーが発生しました。管琁E��E��報告してください、E,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

module.exports = { handleSelect };


