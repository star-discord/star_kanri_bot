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
const { configManager } = require('../../configManager');
const { logAndReplyError } = require('../../errorHelper');

/**
 * 連携チャンネルの選択を処理し、凸スナの設置を完了させます。
 * @param {import('discord.js').ChannelSelectMenuInteraction} interaction
 */
async function actualHandler(interaction) {
  // 最終ステップなので、完了まで時間がかかる可能性があるため、応答を遅延させます。
  await interaction.deferReply({ ephemeral: true });

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

    const row = new ActionRowBuilder().addComponents(reportButton);

    // メッセージを設置先チャンネルに送信します。
    const sentMessage = await installChannel.send({ embeds: [embed], components: [row] });

    // configManagerを使用して、すべての設定を永続化します。
    await configManager.addTotusunaInstance(guildId, {
      id: instanceId,
      ...tempData.data,
      installChannelId: sentMessage.channel.id,
      replicateChannelIds: replicateChannelIds,
      messageId: sentMessage.id,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });

    // 完了メッセージをユーザーに送信します。
    await interaction.editReply({
      content: `✅ 凸スナを <#${sentMessage.channel.id}> に設置しました！\n${replicateChannelIds.length > 0 ? `連携チャンネル: ${replicateChannelIds.map(id => `<#${id}>`).join(', ')}` : ''}`,
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