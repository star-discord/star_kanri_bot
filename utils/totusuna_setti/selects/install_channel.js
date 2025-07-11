const findHandler = require('./selects');

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  const handler = findHandler(customId);

  if (!handler) {
    await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      flags: InteractionResponseFlags.Ephemeral,
    });
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    console.error(`❌ セレクトメニュー処理エラー (${customId}):`, error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  }
}

module.exports = { handleSelect };
