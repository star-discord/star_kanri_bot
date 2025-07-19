// utils/totusuna_report/modals/submit.js
const { EmbedBuilder } = require('discord.js');
const { totusunaConfigManager } = require('../../totusuna_setti/totusunaConfigManager');
const { sendToMultipleChannels } = require('../../sendToMultipleChannels');
const { writeTotusunaReport } = require('../../writeTotusunaReport');
const { safeReply } = require('../../safeReply');
const { logAndReplyError } = require('../../errorHelper');

/**
 * "凸スナ報告" モーダルの送信を処理します。
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    // ユーザーへの応答を即座に行い、タイムアウトを防ぎます。
    await interaction.deferReply({ ephemeral: true });

    const { guildId, customId, fields, user } = interaction;

    // customIdからUUIDを抽出します。
    const uuid = customId.split(':')[2];
    if (!uuid) {
      return await logAndReplyError(interaction, 'モーダルIDからUUIDが抽出できませんでした。', '❌ 報告の送信に失敗しました。ボタンが無効です。');
    }

    // モーダルから入力データを取得します。
    const reportData = {
      username: user.tag,
      date: new Date().toISOString(),
      group: fields.getTextInputValue('group'),
      name: fields.getTextInputValue('name'),
      table1: fields.getTextInputValue('table1') || '',
      table2: fields.getTextInputValue('table2') || '',
      detail: fields.getTextInputValue('detail') || '',
    };

    // 該当する凸スナ設定を取得します。
    const instance = await totusunaConfigManager.getInstance(guildId, uuid);
    if (!instance) {
      return await logAndReplyError(interaction, `凸スナインスタンスが見つかりません (UUID: ${uuid})`, '❌ 報告の送信に失敗しました。元の報告メッセージが削除された可能性があります。');
    }

    // 報告用のEmbedを作成します。
    const reportEmbed = new EmbedBuilder()
      .setTitle(`📝 凸スナ報告がありました`)
      .setColor(0x3498db)
      .addFields(
        { name: '報告者', value: user.toString(), inline: true },
        { name: '報告日時', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        { name: '組数/人数', value: `${reportData.group} / ${reportData.name}`, inline: false },
      )
      .setTimestamp();

    if (reportData.table1 || reportData.table2) {
      reportEmbed.addFields({ name: '卓情報', value: `卓1: ${reportData.table1 || 'なし'}\n卓2: ${reportData.table2 || 'なし'}`, inline: false });
    }
    if (reportData.detail) {
      reportEmbed.addFields({ name: '詳細', value: reportData.detail, inline: false });
    }

    // 報告をチャンネルに送信します。
    const allChannelIds = [instance.installChannelId, ...(instance.replicateChannelIds || [])].filter(Boolean);
    if (allChannelIds.length > 0) {
      await sendToMultipleChannels(interaction.client, allChannelIds, { embeds: [reportEmbed] });
    }

    // CSVファイルに報告を追記します。
    const yearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    await writeTotusunaReport(guildId, yearMonth, reportData);

    // ユーザーに完了を通知します。
    await safeReply(interaction, {
      content: '✅ 報告が送信されました。ご協力ありがとうございます！',
      ephemeral: true,
    });

  } catch (error) {
    await logAndReplyError(interaction, error, '❌ 報告の処理中にエラーが発生しました。');
  }
}

module.exports = {
  customIdStart: 'totusuna_report_modal:submit:',
  handle: actualHandler,
};