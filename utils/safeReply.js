// utils/safeReply.js
const { MessageFlagsBitField } = require('discord.js');
const { Error } = require('joi');

/**
 * 安全なインタラクション応答（reply or editReplyを自動判定）
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').InteractionReplyOptions | import('discord.js').WebhookEditMessageOptions} options
 * @returns {Promise<import('discord.js').Message|import('discord.js').InteractionResponse>}
 */
async function safeReply(interaction, options) {
  if (interaction.replied || interaction.deferred) {
    return interaction.editReply(options);
  } else {
    return interaction.reply(options);
  }
}

/**
 * 安全な応答遅延（deferReplyが未実行時のみ呼び出す）
 * デフォルトでephemeralになります。
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').InteractionDeferReplyOptions} [options={}]
 * @returns {Promise<void|import('discord.js').InteractionResponse>}
 */
async function safeDefer(interaction, options = {}) {
  const defaultOptions = { flags: MessageFlagsBitField.Flags.Ephemeral };
  const finalOptions = { ...defaultOptions, ...options };

  if (!interaction.deferred && !interaction.replied) {
    return interaction.deferReply(finalOptions);
  }
}

/**
 * 安全なモーダル表示（showModal）
 * showModal は deferReply と併用できないため、ここでは状態チェックを行いません。
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').ModalBuilder} modal
 * @returns {Promise<void>}
 */
async function safeShowModal(interaction, modal) {
  if (!interaction.isModalSubmit() && !interaction.isChatInputCommand() && !interaction.isContextMenuCommand() && !interaction.isAutocomplete()) {
    throw new Error(`This method can only be used for command interactions`);
  }
  return interaction.showModal(modal);
}

module.exports = { safeReply, safeDefer };