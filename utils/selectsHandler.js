// commands/common/selectHandler.js
const starSelectHandler = require('../utils/star_config/selects');
const totsusunaSelectHandler = require('../utils/totusuna_setti/selects');
const { InteractionResponseFlags } = require('discord.js');
const { logAndReplyError } = require('./errorHelper');

/**
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;

  let handler = null;

  // プレフィックス付きのcustomIdを処理
  if (customId.startsWith('star_config:')) {
    handler = starSelectHandler(customId);
  } else if (customId.startsWith('totsusuna_setti:')) {
    handler = totsusunaSelectHandler(customId);
  } 
  // STAR設定関連のプレフィックスなしcustomIdを処理
  else if (customId === 'admin_role_select' || customId === 'notify_channel_select') {
    await starSelectHandler(interaction);
    return;
  }
  // その他のプレフィックスなしcustomIdの処理
  else {
    // 他のハンドラーがあれば追加
    handler = null;
  }

  if (!handler) {
    return await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    await logAndReplyError(
      interaction,
      `❌ セレクトエラー (${customId})\n${err?.stack || err}`,
      '❌ エラーが発生しました。',
      { flags: InteractionResponseFlags.Ephemeral }
    );
  }
}

module.exports = { handleSelect };
