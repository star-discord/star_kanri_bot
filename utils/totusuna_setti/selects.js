// utils/totusuna_setti/selects.js
const { InteractionResponseFlags } = require('discord.js');
const path = require('path');
const { loadHandlers } = require('../handlerLoader');

// totusuna_setti専用のハンドラを読み込み
const totusunaHandlers = loadHandlers(path.join(__dirname, 'selects'));

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler;

  // totusuna関連のハンドラを探す
  handler = totusunaHandlers(customId);

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

    const errorMessage = {
      content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
      flags: InteractionResponseFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}

module.exports = { handleSelect };
