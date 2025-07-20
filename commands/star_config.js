// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
  MessageFlagsBitField
} = require('discord.js');
const { idManager } = require('../utils/idManager');
const { PermissionFlagsBits } = require('discord.js');
const { configManager } = require('../utils/configManager');
const { checkAdmin } = require('../utils/permissions/checkAdmin'); // 共通の管理者チェックをインポート
const { createAdminRejectEmbed, createErrorEmbed, createStarConfigEmbed } = require('../utils/embedHelper');
const logger = require('../utils/logger');
const { logAndReplyError } = require('../utils/errorHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者のロールと通知チャンネルを設定します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      // Defer the reply to prevent "Unknown Interaction" errors for long-running operations.
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const { guild } = interaction;
      const guildId = guild.id;

      // 共通の管理者チェック関数を使用（Discord管理者権限 + 設定されたロールを考慮）
      if (!(await checkAdmin(interaction))) {
        // 共通の権限拒否Embedを使用
        return await interaction.editReply({ embeds: [createAdminRejectEmbed()] });
      }

      let config;
      try {
        config = await configManager.getGuildConfig(guildId);
      } catch (err) {
        // 共通のエラーEmbedを使用
        logger.error(`[star_config] 設定ファイルの読み込みに失敗しました (Guild: ${guildId})`, { error: err });
        return interaction.editReply({
          embeds: [createErrorEmbed('設定エラー', '設定ファイルの読み込みに失敗しました。')],
        });
      }

      const currentAdminRoleIds = config.star?.adminRoleIds || [];
      const currentNotifyChannelId = config.star?.notifyChannelId || null;

      const settingsEmbed = createStarConfigEmbed(guild, currentAdminRoleIds, currentNotifyChannelId);

      const roleSelect = new RoleSelectMenuBuilder() // セマンティックな正確性のために createSelectId を使用
        .setCustomId(idManager.createSelectId('star_config', 'admin_role_select'))
        .setPlaceholder('管理者として許可するロールを選択')
        .setMinValues(0)
        .setMaxValues(25);

      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(idManager.createSelectId('star_config', 'notify_channel_select'))
        .setPlaceholder('通知チャンネルを選択')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setMinValues(1)
        .setMaxValues(1);

      const row1 = new ActionRowBuilder().addComponents(roleSelect);
      const row2 = new ActionRowBuilder().addComponents(channelSelect);

      await interaction.editReply({
        embeds: [settingsEmbed],
        components: [row1, row2],
      });

    } catch (error) {
      await logAndReplyError(interaction, error, '設定画面の表示中にエラーが発生しました。');
    }
  }
};
