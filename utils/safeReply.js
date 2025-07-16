// utils/safeReply.js
const { MessageFlagsBitField } = require('discord.js');

/**
 * 安全にインタラクションに応答する（二重応答を回避）
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').InteractionReplyOptions} options
 */
async function safeReply(interaction, options) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(options);
    } else {
      await interaction.reply(options);
    }
  } catch (error) {
    console.error(`[safeReply] 応答失敗: ${error.message}`, {
      interactionId: interaction.id,
      customId: interaction.customId,
    });
  }
}

/**
 * 安全にインタラクションを遅延させる（二重遅延を回避）
 * @param {import('discord.js').Interaction} interaction
 * @param {object} [options] - `ephemeral` (boolean) または `flags`
 */
async function safeDefer(interaction, options = {}) {
  if (interaction.deferred || interaction.replied) {
    return;
  }

  const deferOptions = {};
  // v14で推奨の `flags` を優先しつつ、古い `ephemeral` もサポート
  if (options.flags) {
    deferOptions.flags = options.flags;
  } else if (options.ephemeral === true) {
    deferOptions.flags = MessageFlagsBitField.Flags.Ephemeral;
  }

  await interaction.deferReply(deferOptions);
}

module.exports = { safeReply, safeDefer };