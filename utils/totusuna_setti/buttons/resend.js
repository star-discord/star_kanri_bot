// utils/totusuna_setti/buttons/resend.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlagsBitField,
} = require('discord.js');
const { totusunaConfigManager } = require('../totusunaConfigManager');
const { idManager } = require('../../idManager');
const { safeReply, safeDefer } = require('../../safeReply');
const { logAndReplyError } = require('../../errorHelper');
const { createErrorEmbed } = require('../../embedHelper');

module.exports = {
  customIdStart: 'totusuna_setti:resend:',

  /**
   * 凸スナ再送信処理：設置メッセージを再投稿
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    console.log(`[${__filename.split('/').pop()}] 開始: ${interaction.customId} by ${interaction.user.tag}`);
    await safeDefer(interaction, { ephemeral: true });

    const { guild, customId } = interaction;
    const uuid = customId.substring(module.exports.customIdStart.length);

    try {
      // configManagerを使用して安全にデータを取得
      const instance = await totusunaConfigManager.getInstance(guild.id, uuid);
      if (!instance || !instance.installChannelId) {
        return safeReply(interaction, { embeds: [createErrorEmbed('データエラー', '対象の凸スナデータが見つからないか、設置チャンネルが記録されていません。')] });
      }

      const channel = await guild.channels.fetch(instance.installChannelId).catch(() => null);
      if (!channel || !channel.isTextBased()) {
        return safeReply(interaction, { embeds: [createErrorEmbed('チャンネルエラー', '対象チャンネルが存在しないか、Botがアクセスできません。')] });
      }

      // 古いメッセージを削除
      if (instance.messageId) {
        try {
          const oldMessage = await channel.messages.fetch(instance.messageId);
          await oldMessage.delete();
          console.log(`[resend.js] 古いメッセージ削除完了: ${instance.messageId}`);
        } catch (err) {
          console.warn(`[resend.js] 古いメッセージ削除失敗 or 既に削除済み: ${instance.messageId}`);
        }
      }

      // Embed作成
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(instance.body || '報告は下のボタンからお願いします。')
        .setColor(0x00bfff);

      // idManagerを使用して安全にIDを生成
      const button = new ButtonBuilder()
        .setCustomId(idManager.createButtonId('totusuna_report', 'report', uuid))
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(button);

      // 新しいメッセージを送信
      const sentMessage = await channel.send({ embeds: [embed], components: [row] });
      console.log(`[resend.js] 新規メッセージ投稿完了: ${sentMessage.id}`);

      // configManagerを使用して新しいメッセージIDを安全に保存
      await totusunaConfigManager.updateInstance(guild.id, uuid, { messageId: sentMessage.id });
      console.log(`[resend.js] 新規メッセージIDを保存完了: ${uuid}`);

      await safeReply(interaction, { content: '📤 再送信しました。' });
      console.log(`[${__filename.split('/').pop()}] 完了: ${interaction.customId}`);

    } catch (err) {
      await logAndReplyError(interaction, err, '❌ 凸スナの再送信中にエラーが発生しました。');
    }
  }
};
