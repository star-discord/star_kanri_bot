// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlagsBitField
} = require('discord.js');
const { configManager } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者のロールと通知チャンネルを設定します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      // Defer the reply to prevent "Unknown Interaction" errors for long-running operations.
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const { guild, member } = interaction;
      const guildId = guild.id;

      // This check is technically redundant due to setDefaultMemberPermissions,
      // but it provides a more user-friendly message.
      if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.editReply({
          content: '❌ この設定コマンドには Discord の管理者権限が必要です。\n' +
                   'サーバー設定で管理者権限を付与してください。',
        });
      }

      let config;
      try {
        config = await configManager.getGuildConfig(guildId);
      } catch (err) {
        console.error(`❌ [star_config] ファイル読み込みエラー (Guild: ${guildId}):`, err);
        return interaction.editReply({ content: '❌ 設定ファイルの読み込みに失敗しました。' });
      }

      const currentAdminRoleIds = config.star?.adminRoleIds || [];
      const currentNotifyChannelId = config.star?.notifyChannelId || null;

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

    } catch (error) {
      console.error('❌ [star_config] 予期せぬエラー:', error);
      // エラー発生時、インタラクションが未応答でないか確認し、適切に応答を返す
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: '❌ コマンドの実行中に予期せぬエラーが発生しました。' });
        } else {
          await interaction.reply({ content: '❌ コマンドの実行中に予期せぬエラーが発生しました。', flags: MessageFlagsBitField.Flags.Ephemeral });
        }
      } catch (replyError) {
        // フォールバックの応答すら失敗した場合
        console.error('❌ [star_config] エラーメッセージの送信にも失敗:', replyError);
      }
    }
  }
};
