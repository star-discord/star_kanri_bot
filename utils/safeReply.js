// utils/safeReply.js
const { MessageFlagsBitField } = require('discord.js');

/**
 * インタラクションに安全に応答（既に返信済み/遅延済みを考慮）
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
    console.error(`[safeReply] 応答失敗:`, {
      message: error.message,
      stack: error.stack,
      interactionId: interaction?.id,
      customId: interaction?.customId,
      user: interaction?.user?.tag,
    });
  }
}

/**
 * インタラクションを安全に遅延応答（既に遅延/応答済みなら何もしない）
 * @param {import('discord.js').Interaction} interaction
 * @param {object} [options] - `ephemeral` または `flags` を含むオプション
 */
async function safeDefer(interaction, options = {}) {
  try {
    if (interaction.deferred || interaction.replied) return;

    const deferOptions = {};
    if ('flags' in options) {
      deferOptions.flags = options.flags;
    } else if (options.ephemeral === true) {
      deferOptions.flags = MessageFlagsBitField.Flags.Ephemeral;
    }

    await interaction.deferReply(deferOptions);
  } catch (error) {
    console.error(`[safeDefer] 遅延応答失敗:`, {
      message: error.message,
      stack: error.stack,
      interactionId: interaction?.id,
      customId: interaction?.customId,
    });
  }
}

module.exports = {
  safeReply,
  safeDefer,
};
