// utils/totusuna_setti/totusunaMessageHelper.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { idManager } = require('../idManager');

/**
 * 凸スナインスタンスのデータからメッセージペイロード（Embedとコンポーネント）を構築します。
 * @param {object} instance - 凸スナのインスタンスデータ
 * @returns {{embeds: EmbedBuilder[], components: ActionRowBuilder[]}}
 */
function buildTotusunaMessage(instance) {
  const embed = new EmbedBuilder()
    .setTitle(instance.title || '📣 凸スナ報告受付中')
    .setDescription(instance.body || '報告は下のボタンからお願いします。')
    .setColor(0x00bfff)
    .setFooter({ text: `ID: ${instance.id}` });

  const reportButton = new ButtonBuilder()
    .setCustomId(idManager.createButtonId('totusuna_report', 'report', instance.id))
    .setLabel('凸スナ報告')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(reportButton);

  return {
    embeds: [embed],
    components: [row],
  };
}

/**
 * 既存の凸スナメッセージをDiscord上で更新します。
 * @param {import('discord.js').Client} client
 * @param {object} instance - 凸スナのインスタンスデータ
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateTotusunaMessage(client, instance) {
  if (!instance?.messageId || !instance.installChannelId) {
    return { success: false, error: 'Instance is missing messageId or installChannelId.' };
  }

  try {
    const channel = await client.channels.fetch(instance.installChannelId);
    const message = await channel.messages.fetch(instance.messageId);
    const messagePayload = buildTotusunaMessage(instance);
    await message.edit(messagePayload);
    return { success: true };
  } catch (error) {
    console.warn(`[updateTotusunaMessage] Failed to update message for instance ${instance.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  buildTotusunaMessage,
  updateTotusunaMessage,
};