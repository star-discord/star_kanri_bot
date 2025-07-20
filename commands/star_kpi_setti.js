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
const { logAndReplyError } = require('../utils/errorHelper');
const { idManager } = require('../utils/idManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_kpi_setti')
    .setDescription('KPI報告の案内メッセージを送信します'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return interaction.editReply({ embeds: [createAdminEmbed('❌ 権限がありません', 'このコマンドを実行するには管理者権限が必要です。')] });
      }

      const targetButton = new ButtonBuilder()
        .setCustomId(idManager.createButtonId('star_kpi', 'target_start'))
        .setLabel('KPI目標')
        .setStyle(ButtonStyle.Primary);

      const reportButton = new ButtonBuilder()
        .setCustomId(idManager.createButtonId('star_kpi', 'report_start'))
        .setLabel('KPI申請')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(targetButton, reportButton);

      await interaction.editReply({
        content: 'KPI報告　目標設定・申請ボタン',
        components: [row],
      });
    } catch (error) {
      await logAndReplyError(interaction, error, 'KPI報告UIの設置中にエラーが発生しました。');
    }
  },
};
