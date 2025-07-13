const { MessageFlags } = require('discord.js');

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

  // customId に応じて適切なハンドラを探す
  if (customId.startsWith('totsusuna_setti:')) {
    handler = findTotsusunaHandler(customId);
  } else {
    handler = findStarHandler(customId);
  }

  if (!handler) {
    await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    console.error(`❌ セレクトメニュー処理エラー (${customId}):`, error);

    const errorMessage = {
      content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}

module.exports = { handleSelect };
