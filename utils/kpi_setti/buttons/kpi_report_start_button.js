// ファイル参照: utils/kpi_setti/buttons/kpi_report_start_button.js

const { activeReportSessions } = require('../stepChatHandler');

module.exports = {
  customId: 'kpi_report_start_button',
  handle: async (interaction) => {
    const userId = interaction.user.id;

    if (activeReportSessions.has(userId)) {
      await interaction.reply({
        content: 'すでに申請入力中です。完了するまでお待ちください。',
        flags: MessageFlagsBitField.Ephemeral,
      });
      return;
    }

    // KPI申請（実績入力）ステップチャット開始！stepChatHandlerに委譲する
    activeReportSessions.set(userId, { step: 0, type: 'report', data: {} });

    await interaction.reply({
      content: 'KPI実績申請を開始します。報告する日付を「YYYY/MM/DD」の形式で入力してください。',
      flags: MessageFlagsBitField.Ephemeral,
    });
  },
};
