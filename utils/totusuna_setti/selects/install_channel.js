// utils/totusuna_setti/selects.js の findHandler を使う想定

const findHandler = require('./selects'); // 上記の selects.js ファイルのエクスポート

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
      ephemeral: true,
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
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
        ephemeral: true,
      });
    }
  }
}

module.exports = { handleSelect };
