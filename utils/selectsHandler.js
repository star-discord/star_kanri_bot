// commands/common/selectHandler.js
const starSelectHandler = require('../utils/star_config/selects');
const totsusunaSelectHandler = require('../utils/totsusuna_setti/selects');
const { InteractionResponseFlags } = require('discord.js');

/**
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;

  const handler = customId.startsWith('star_config:')
    ? starSelectHandler(customId)
    : customId.startsWith('totsusuna_setti:')
      ? totsusunaSelectHandler(customId)
      : null;

  if (!handler) {
    return await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`❌ セレクトエラー (${customId})`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ エラーが発生しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  }
}

module.exports = { handleSelect };
