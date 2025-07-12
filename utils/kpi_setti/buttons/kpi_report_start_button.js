// ファイル参�E: utils/kpi_setti/buttons/kpi_report_start_button.js

const { activeReportSessions } = require('../stepChatHandler');

module.exports = {
  customId: 'kpi_report_start_button',
  handle: async (interaction) => {
    const userId = interaction.user.id;

    if (activeReportSessions.has(userId)) {
      await interaction.reply({
        content: 'すでに申請�E力中です。完亁E��るまでお征E��ください、E,
        ephemeral: true,
      });
      return;
    }

    // KPI申請（実績入力）スチE��プチャチE��開始！EtepChatHandlerに委譲�E�E    activeReportSessions.set(userId, { step: 0, type: 'report', data: {} });

    await interaction.reply({
      content: 'KPI実績申請を開始します。報告する日付を「YYYY/MM/DD」�E形式で入力してください、E,
      ephemeral: true,
    });
  },
};
