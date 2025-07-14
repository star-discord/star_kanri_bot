const { MessageFlagsBitField } = require('discord.js');

// カテゴリごとの findHandler を読み込み
const findTotsusunaHandler = require('../../totusuna_setti/selects');
const findStarHandler = require('../../star_config/selects');

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler;

  if (customId.startsWith('totsusuna_setti:')) {
    handler = findTotsusunaHandler(customId);
  } else {
    handler = findStarHandler(customId);
  }

  if (!handler || typeof handler.handle !== 'function') {
    await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      flags: MessageFlagsBitField.Ephemeral,
    });
    return;
  }

  try {
    // 必要に応じて deferReply を入れる（時間がかかる場合）
    // await interaction.deferReply({ ephemeral: true });
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
