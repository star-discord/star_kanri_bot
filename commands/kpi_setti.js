// ファイル参考: commands/kpi_setti.js

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kpi_設定')
    .setDescription('KPI報告の案内メッセージを送信します'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return interaction.editReply({ embeds: [createAdminEmbed('❌ 権限がありません', 'このコマンドを実行するには管理者権限が必要です。')] });
      }

      const targetButton = new ButtonBuilder()
        .setCustomId('kpi_target_start_button')
        .setLabel('KPI目標')
        .setStyle(ButtonStyle.Primary);

      const reportButton = new ButtonBuilder()
        .setCustomId('kpi_report_start_button')
        .setLabel('KPI申請')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(targetButton, reportButton);

      await interaction.editReply({
        content: 'KPI報告　目標設定・申請ボタン',
        components: [row],
      });
    } catch (error) {
      console.error('KPI設定コマンドエラー:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ KPI設定コマンドの実行中にエラーが発生しました。' });
      }
    }
  },
};
