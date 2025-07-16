// utils/safeReply.js

/**
 * 安全なインタラクション応答（reply or editReplyを自動判定）
 * @param {import('discord.js').Interaction} interaction
 * @param {object} options
 */
async function safeReply(interaction, options) {
  if (interaction.replied || interaction.deferred) {
    return await interaction.editReply(options);
  } else {
    return await interaction.reply(options);
  }
}

/**
 * 安全な応答遅延（deferReplyが未実行時のみ呼び出す）
 * @param {import('discord.js').Interaction} interaction
 * @param {object} options
 */
async function safeDefer(interaction, options = {}) {
  if (!interaction.deferred && !interaction.replied) {
    return await interaction.deferReply(options);
  }
}

module.exports = { safeReply, safeDefer };
