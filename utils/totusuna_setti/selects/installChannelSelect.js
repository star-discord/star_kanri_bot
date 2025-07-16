// utils/totusuna_setti/selects/installChannelSelect.js

const {
  MessageFlagsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,

} = require('discord.js');

const { tempStore } = require('../../tempStore');
const { configManager } = require('../../configManager');
const requireAdmin = require('../../permissions/requireAdmin');
const { idManager } = require('../../idManager');

/**
 * チャンネル選択後の実際の設置処理
 * @param {import('discord.js').ChannelSelectMenuInteraction} interaction
 */
async function actualHandler(interaction) {
  await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

  await safeDefer(interaction, { ephemeral: true });

  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const key = `${guildId}:${userId}`;

  // 1. tempStoreから一時データを取得
  const tempData = tempStore.get(key);
  if (!tempData) {
    return interaction.editReply({ content: '⚠️ 設置データが見つかりませんでした。時間切れの可能性があります。最初からやり直してください。' });
  }

  // 2. 選択されたチャンネルIDを取得し検証
 const selectedChannelId = interaction.values[0];
  const channel = await interaction.guild.channels.fetch(selectedChannelId).catch(() => null);

  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.editReply({ content: '❌ テキストチャンネルを選択してください。' });
  }

  // ★★★ 二重投稿防止のキモ: 処理を行う前に一時データを削除する ★★★
  tempStore.delete(key);

  try {
    const { title, body } = tempData.data;
    const instanceId = idManager.generateUUID();

    // 3. チャンネルに送信するメッセージを作成
    const embed = new EmbedBuilder().setTitle(title).setDescription(body).setColor(0x00bfff).setFooter({ text: `ID: ${instanceId}` });
    const reportButton = new ButtonBuilder().setCustomId(idManager.createButtonId('totusuna_report', null, instanceId)).setLabel('凸スナ報告').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(reportButton);

    // 4.【唯一の投稿箇所】チャンネルにメッセージを送信
    const sentMessage = await channel.send({ embeds: [embed], components: [row] });

    // 5. 設定を永続化
    await configManager.addTotusunaInstance(guildId, {
      id: instanceId,
      body,
      title,
      messageId: sentMessage.id,
      installChannelId: sentMessage.channel.id,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });

    // 6. ユーザーに完了を通知
    await interaction.editReply({ content: `✅ 凸スナを <#${sentMessage.channel.id}> に設置しました。`, components: [] });

  } catch (error) {
    console.error('❌ [installChannelSelect] 設置処理エラー:', error);
    await interaction.editReply({ content: '❌ 凸スナの設置中にエラーが発生しました。', components: [] });
  }
}

module.exports = {
 customId: 'totusuna_channel_select:install',

  handle: requireAdmin(actualHandler),
};