// utils/safeReply.js
const { MessageFlagsBitField } = require('discord.js');

/**
 * インタラクションに安全に応答します。
 * 既に返信または遅延されている場合は、既存の応答を編集します。
 * この関数は、インタラクションに対して単一の最終的な応答メッセージを提供することを目的としています。
 * @param {import('discord.js').Interaction} interaction - 対象のインタラクション
 * @param {import('discord.js').InteractionReplyOptions} options - 返信内容
 */
async function safeReply(interaction, options) {
  try {
    // interaction.replied: 既に reply() で応答済み
    // interaction.deferred: deferReply() で遅延応答済み
    // どちらの場合も editReply() を使って応答メッセージを更新/設定します。
    // followUp() は新しいメッセージを送信するため、この関数の目的とは異なります。
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(options);
    } else {
      await interaction.reply(options);
    }
  } catch (error) {
    // "Unknown interaction"エラーなどを捕捉し、Botのクラッシュを防ぎます。
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
 * インタラクションを安全に遅延応答（defer）します。
 * 既に遅延または応答済みの場合は何もしません。
 * @param {import('discord.js').Interaction} interaction - 対象のインタラクション
 * @param {object} [options] - `ephemeral: true` または `flags` を含むオプション
 */
async function safeDefer(interaction, options = {}) {
  try {
    if (interaction.deferred || interaction.replied) {
      // 既に処理されている場合は何もしない
      return;
    }

    const deferOptions = {};
    if ('flags' in options) {
      // flagsプロパティを優先
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
    // Re-throw the error so the calling function knows the deferral failed
    // and can handle it appropriately (e.g., by stopping execution).
    throw error;
  }
}

module.exports = {
  safeReply,
  safeDefer,
};
