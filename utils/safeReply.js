// utils/safeReply.js
const { MessageFlagsBitField } = require('discord.js');

/**
 * 安全なインタラクション応答（reply または editReply を自動判定）
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').InteractionReplyOptions | import('discord.js').WebhookEditMessageOptions} options
 * @returns {Promise<import('discord.js').Message | import('discord.js').InteractionResponse>}
 */
async function safeReply(interaction, options) {
  if (interaction.replied || interaction.deferred) {
    return interaction.editReply(options);
  } else {
    return interaction.reply(options);
  }
}

/**
 * 安全な応答遅延（deferReply が未実行のときのみ呼び出す）
 * デフォルトで ephemeral 応答になります。
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').InteractionDeferReplyOptions} [options={}]
 * @returns {Promise<void | import('discord.js').InteractionResponse>}
 */
async function safeDefer(interaction, options = {}) {
  const defaultOptions = { flags: MessageFlagsBitField.Flags.Ephemeral };
  const finalOptions = { ...defaultOptions, ...options };

  if (!interaction.deferred && !interaction.replied) {
    return interaction.deferReply(finalOptions);
  }
  // すでに defer or reply 済みなら何もしない
  return;
}

/**
 * 安全なモーダル表示（showModal）
 * showModal は deferReply と併用不可のため状態チェックなし
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').ModalBuilder} modal
 * @returns {Promise<void>}
 */
async function safeShowModal(interaction, modal) {
  if (!interaction.isModalSubmit() && !interaction.isChatInputCommand() && !interaction.isContextMenuCommand() && !interaction.isAutocomplete()) {
    throw new Error(`safeShowModal はコマンド系インタラクションにのみ使用可能です。`);
  }
  return interaction.showModal(modal);
}

module.exports = { safeReply, safeDefer, safeShowModal };
