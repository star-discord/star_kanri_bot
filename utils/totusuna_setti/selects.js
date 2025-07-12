// utils/totusuna_setti/selects.js
const { MessageFlags } = require('discord.js');
const path = require('path');
const { loadHandlers } = require('../handlerLoader');

// totusuna_setti専用のハンドラを読み込み
const totusunaHandlers = loadHandlers(path.join(__dirname, 'selects'));

/**
 * セレクトメニューインタラクションを�E琁E��るメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler;

  // totusuna関連のハンドラを探ぁE  handler = totusunaHandlers(customId);

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

    const errorMessage = {
      content: '⚠�E�Eセレクトメニュー処琁E��にエラーが発生しました。管琁E��E��報告してください、E,
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
