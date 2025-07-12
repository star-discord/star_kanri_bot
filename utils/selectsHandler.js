// commands/common/selectHandler.js
const starSelectHandler = require('../utils/star_config/selects');
const totsusunaSelectHandler = require('../utils/totusuna_setti/selects');
const { MessageFlags } = require('discord.js');
const { logAndReplyError } = require('./errorHelper');

/**
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;

  let handler = null;

  // プレフィチE��ス付きのcustomIdを�E琁E  if (customId.startsWith('star_config:')) {
    handler = starSelectHandler(customId);
  } else if (customId.startsWith('totsusuna_setti:')) {
    handler = totsusunaSelectHandler(customId);
  } 
  // STAR設定関連のプレフィチE��スなしcustomIdを�E琁E  else if (customId === 'admin_role_select' || customId === 'notify_channel_select') {
    await starSelectHandler(interaction);
    return;
  }
  // totusuna_setti関連のプレフィチE��スなしcustomIdを�E琁E  else if (customId === 'totusuna_select_main' || customId === 'totusuna_select_replicate' || customId === 'totusuna_config_select') {
    await totsusunaSelectHandler(interaction);
    return;
  }
  // そ�E他�EプレフィチE��スなしcustomIdの処琁E  else {
    // 他�Eハンドラーがあれ�E追加
    handler = null;
  }

  if (!handler) {
    return await interaction.reply({
      content: '❁Eセレクトメニューに対応する�E琁E��見つかりませんでした、E,
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    await logAndReplyError(
      interaction,
      `❁Eセレクトエラー (${customId})\n${err?.stack || err}`,
      '❁Eエラーが発生しました、E,
      { flags: MessageFlags.Ephemeral }
    );
  }
}

module.exports = { handleSelect };
