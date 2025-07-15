const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('退勤管理設置')
    .setDescription('出退勤管理パネルを設置します（管理者専用）'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return interaction.editReply({
          embeds: [
            createAdminEmbed('❌ 権限がありません', 'このコマンドを実行するには管理者権限が必要です。')
          ]
        });
      }

      // 出退勤管理用のエンベッド作成
      const embed = new EmbedBuilder()
        .setTitle('👥 出退勤管理システム')
        .setDescription('出勤・退勤時間を記録・管理します')
        .addFields(
          {
            name: '📅 今日の出勤状況',
            value: '出勤者なし',
            inline: false
          },
          {
            name: '🕐 時間帯別出勤',
            value: '**20時**: 0名\n**21時**: 0名\n**22時**: 0名\n**今から**: 0名',
            inline: true
          },
          {
            name: '📊 退勤状況',
            value: '退勤済み: 0名\n未退勤: 0名',
            inline: true
          }
        )
        .setColor(0x5865F2)
        .setTimestamp();

      // ボタン作成
      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('attendance_work_start_20')
            .setLabel('20時出勤')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🕗'),
          new ButtonBuilder()
            .setCustomId('attendance_work_start_21')
            .setLabel('21時出勤')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🕘'),
          new ButtonBuilder()
            .setCustomId('attendance_work_start_22')
            .setLabel('22時出勤')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🕙'),
          new ButtonBuilder()
            .setCustomId('attendance_work_start_now')
            .setLabel('今から出勤')
            .setStyle(ButtonStyle.Success)
            .setEmoji('⏰')
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('attendance_work_end')
            .setLabel('退勤')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🏁'),
          new ButtonBuilder()
            .setCustomId('attendance_status')
            .setLabel('状況確認')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📊'),
          new ButtonBuilder()
            .setCustomId('attendance_admin_panel')
            .setLabel('管理者パネル')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⚙️')
        );

      await interaction.editReply({
        embeds: [embed],
        components: [row1, row2],
      });
    } catch (error) {
      console.error('退勤管理設置エラー:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ 退勤管理パネルの設置に失敗しました。' });
      }
    }
  }
};
