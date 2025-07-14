// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
  ChannelType
} = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { configManager } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者のロールと通知チャンネルを設定します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guild = interaction.guild;
    const guildId = guild.id;
    const member = interaction.member;

    // star_config コマンドは Discord 標準の管理者権限が必要
    if (!member.permissions.has('Administrator')) {
      return await interaction.editReply({
        content: '❌ この設定コマンドには Discord の管理者権限が必要です。\n' +
                 'サーバー設定で管理者権限を付与してください。',
      });
    }

    let config;
    try {
      config = await configManager.getGuildConfig(guildId);
    } catch (err) {
      console.error('❌ ファイル読み込みエラー:', err);
      return interaction.editReply({ content: '❌ 設定ファイルの読み込みに失敗しました。' });
    }

    const currentAdminRoleIds = config.star.adminRoleIds || [];
    const currentNotifyChannelId = config.star.notifyChannelId || null;

    const getSettingsEmbed = (roleIds, notifyId) => {
      const roleMentions =
        roleIds.length > 0
          ? roleIds.map(id => {
              const role = guild.roles.cache.get(id);
              return role ? `<@&${id}>` : `~~(削除済ロール: ${id})~~`;
            }).join('\n')
          : '*未設定*';

      const notifyChannel = notifyId ? guild.channels.cache.get(notifyId) : null;
      const notifyDisplay = notifyChannel
        ? `<#${notifyId}>`
        : notifyId ? `~~(削除済チャンネル: ${notifyId})~~` : '*未設定*';

      return new EmbedBuilder()
        .setTitle('🌟 STAR管理Bot設定')
        .setDescription(`**管理者ロール / 通知チャンネル 設定**\n\n📌 現在の管理者ロール:\n${roleMentions}\n\n📣 現在の通知チャンネル:\n${notifyDisplay}`)
        .setColor(0x0099ff);
    };

    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者として許可するロールを選択')
      .setMinValues(0)
      .setMaxValues(25);

    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('notify_channel_select')
      .setPlaceholder('通知チャンネルを選択')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(1)
      .setMaxValues(1);

    const row1 = new ActionRowBuilder().addComponents(roleSelect);
    const row2 = new ActionRowBuilder().addComponents(channelSelect);

    await interaction.editReply({
      embeds: [getSettingsEmbed(currentAdminRoleIds, currentNotifyChannelId)],
      components: [row1, row2],
    });
  }
};
