// utils/totusuna_setti/selects/select_replicate_channels.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { tempDataStore } = require('../../tempDataStore');
const requireAdmin = require('../../permissions/requireAdmin');
const { idManager } = require('../../idManager');
const { totusunaConfigManager } = require('../totusunaConfigManager');
const { logAndReplyError } = require('../../errorHelper');
const { sendToMultipleChannels } = require('../../sendToMultipleChannels');
const { safeDefer } = require('../../safeReply');

/**
 * 連携チャンネルの選択を処理し、凸スナの設置を完了させます。
 * @param {import('discord.js').ChannelSelectMenuInteraction} interaction
 */
async function actualHandler(interaction) {
  // 最終ステップでファイルI/Oや複数APIコールがあるため、安全に遅延応答します。
  await safeDefer(interaction, { ephemeral: true });

  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const tempKey = `totusuna_install:${guildId}:${userId}`;

  try {
    // 一時データを取得します。
    const tempData = tempDataStore.get(tempKey);
    if (!tempData || !tempData.installChannelId) {
      return await interaction.editReply({
        content: '⚠️ 設定データが見つからないか、不完全です。時間切れの可能性がありますので、最初からやり直してください。',
        components: [],
      });
    }

    // 選択された連携チャンネルIDを取得します。
    const replicateChannelIds = interaction.values;

    // 設置先チャンネルを取得し、検証します。
    const installChannel = await interaction.guild.channels.fetch(tempData.installChannelId).catch(() => null);
    if (!installChannel || installChannel.type !== ChannelType.GuildText) {
      return await interaction.editReply({ content: '❌ 設置先チャンネルが見つからないか、テキストチャンネルではありません。' });
    }

    // 凸スナの一意なIDを生成します。
    const instanceId = idManager.generateUUID();

    // チャンネルに投稿するメッセージ（Embedとボタン）を作成します。
    const embed = new EmbedBuilder()
      .setTitle(tempData.data.title)
      .setDescription(tempData.data.body)
      .setColor(0x00bfff)
      .setFooter({ text: `ID: ${instanceId}` });

    const reportButton = new ButtonBuilder()
      .setCustomId(idManager.createButtonId('totusuna_report', 'report', instanceId))
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const messagePayload = {
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(reportButton)],
    };

    // メインチャンネルと連携チャンネルのIDを結合します。
    const allChannelIds = [installChannel.id, ...replicateChannelIds];

    // sendToMultipleChannels ユーティリティを使用して、すべてのチャンネルに一括送信します。
    await sendToMultipleChannels(interaction.client, allChannelIds, messagePayload);
    
    // configManagerを使用して、すべての設定を永続化します。
    await configManager.addTotusunaInstance(guildId, {
      id: instanceId,
      ...tempData.data,
      installChannelId: installChannel.id,
      replicateChannelIds: replicateChannelIds,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });

    // 完了メッセージをユーザーに送信します。
    await interaction.editReply({
      content: `✅ 凸スナを <#${installChannel.id}> に設置しました！\n${replicateChannelIds.length > 0 ? `連携チャンネル: ${replicateChannelIds.map(id => `<#${id}>`).join(', ')}` : ''}`,
      components: [],
    });

  } catch (error) {
    await logAndReplyError(interaction, error, '❌ 凸スナの設置中にエラーが発生しました。');
  } finally {
    // 処理が完了または失敗したあと、必ず一時データを削除します。
    tempDataStore.delete(tempKey);
  }
}

module.exports = {
  customId: 'totusuna_setti:select_replicate_channels',
  handle: requireAdmin(actualHandler),
};