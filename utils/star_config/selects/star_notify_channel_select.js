// utils/star_config/selects/star_notify_channel_select.js

const requireAdmin = require('../../permissions/requireAdmin');
const { configManager } = require('../../configManager');
const {
  EmbedBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  MessageFlagsBitField,
} = require('discord.js');

async function actualHandler(interaction) {
  const { guild } = interaction;
  const guildId = guild.id;
  const selectedChannelId = interaction.values[0] ?? null;

  try {
    await configManager.updateSectionConfig(guildId, 'star', {
      notifyChannelId: selectedChannelId,
    });

    console.log(`[configManager] ✅ 通知チャンネル更新完了: guildId=${guildId}, channelId=${selectedChannelId || '未設定'}`);

    const updatedConfig = await configManager.getSectionConfig(guildId, 'star');
    const currentAdminRoleIds = updatedConfig.adminRoleIds || [];

    // 共通表示フォーマット
    const formatRoleMentions = (ids) =>
      ids.length > 0
        ? ids.map(id => guild.roles.cache.get(id) ? `<@&${id}>` : `~~(削除済ロール: ${id})~~`).join('\n')
        : '*未設定*';

    const formatChannelDisplay = (id) => {
      const channel = id ? guild.channels.cache.get(id) : null;
      return channel ? `<#${id}>` : id ? `~~(削除済チャンネル: ${id})~~` : '*未設定*';
    };

    const roleDisplay = formatRoleMentions(currentAdminRoleIds);
    const channelDisplay = formatChannelDisplay(selectedChannelId);

    const mainEmbed = new EmbedBuilder()
      .setTitle('🌟 STAR管理Bot設定')
      .setDescription(`**管理者ロール / 通知チャンネル 設定**\n\n📌 管理者ロール:\n${roleDisplay}\n\n📣 通知チャンネル:\n${channelDisplay}`)
      .setColor(0x0099ff);

    const confirmationEmbed = new EmbedBuilder()
      .setTitle('✅ 通知チャンネルを更新しました')
      .setDescription(`現在の通知チャンネル: ${channelDisplay}`)
      .setColor(0x00cc99);

    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者ロールを再選択できます')
      .setMinValues(0)
      .setMaxValues(25);

    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('notify_channel_select')
      .setPlaceholder('通知チャンネルを再選択できます')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(0)
      .setMaxValues(1);

    await interaction.update({
      embeds: [mainEmbed, confirmationEmbed],
      components: [
        new ActionRowBuilder().addComponents(roleSelect),
        new ActionRowBuilder().addComponents(channelSelect),
      ],
    });

  } catch (error) {
    console.error('❌ [notify_channel_select] チャンネル更新エラー:', error);
    const errorMsg = '⚠️ 通知チャンネル設定中にエラーが発生しました。';

    const replyPayload = {
      content: errorMsg,
      flags: MessageFlagsBitField.Flags.Ephemeral,
    };

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply(replyPayload);
    } else {
      await interaction.followUp(replyPayload);
    }
  }
}

module.exports = {
  customId: 'notify_channel_select',
  handle: requireAdmin(actualHandler),
};
