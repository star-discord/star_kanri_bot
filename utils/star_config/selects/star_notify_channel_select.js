const requireAdmin = require('../../permissions/requireAdmin');
const { configManager } = require('../../configManager');
const {
  EmbedBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require('discord.js');

async function actualHandler(interaction) {
  const guild = interaction.guild;
  const guildId = guild.id;
  const selectedChannelId = interaction.values[0];

  try {
    // 設定マネージャーを使用して設定を更新
    await configManager.updateSectionConfig(guildId, 'star', { notifyChannelId: selectedChannelId });

    // UIを再構築するために、更新後の全設定を取得
    const updatedConfig = await configManager.getSectionConfig(guildId, 'star');
    const currentAdminRoleIds = updatedConfig.adminRoleIds || [];

    const formatRoleMentions = (ids) =>
      ids.length > 0
        ? ids.map(id => guild.roles.cache.get(id) ? `<@&${id}>` : `~~(削除済ロール: ${id})~~`).join('\n')
        : '*未設定*';

    const formatChannelDisplay = (notifyId) => {
      const notifyChannel = notifyId ? guild.channels.cache.get(notifyId) : null;
      return notifyChannel
        ? `<#${notifyId}>`
        : notifyId ? `~~(削除済チャンネル: ${notifyId})~~` : '*未設定*';
    };

    const mainEmbed = new EmbedBuilder()
      .setTitle('🌟 STAR管理Bot設定')
      .setDescription(`**管理者ロール / 通知チャンネル 設定**\n\n📌 現在の管理者ロール:\n${formatRoleMentions(currentAdminRoleIds)}\n\n📣 現在の通知チャンネル:\n${formatChannelDisplay(selectedChannelId)}`)
      .setColor(0x0099ff);

    const confirmationEmbed = new EmbedBuilder()
      .setTitle('✅ 通知チャンネル更新')
      .setDescription(`通知チャンネルを <#${selectedChannelId}> に設定しました。`)
      .setColor(0x00cc99);

    // UIコンポーネントを再構築
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者ロールを再選択できます')
      .setMinValues(0)
      .setMaxValues(25);

    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('notify_channel_select')
      .setPlaceholder('通知チャンネルを再選択できます')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(1)
      .setMaxValues(1);

    const row1 = new ActionRowBuilder().addComponents(roleSelect);
    const row2 = new ActionRowBuilder().addComponents(channelSelect);

    // 元のメッセージを更新
    await interaction.update({
      embeds: [mainEmbed, confirmationEmbed],
      components: [row1, row2],
    });

  } catch (error) {
    console.error('notify_channel_select処理エラー:', error);
    const errorMsg = '⚠️ 通知チャンネル設定中にエラーが発生しました。';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    } else {
      await interaction.followUp({ content: errorMsg, ephemeral: true });
    }
  }
}

module.exports = {
  customId: 'notify_channel_select',
  handle: requireAdmin(actualHandler)
};
