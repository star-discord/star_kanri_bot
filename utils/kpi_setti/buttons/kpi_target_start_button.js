// ファイル参照: utils/kpi_setti/buttons/kpi_target_start_button.js

const { activeReportSessions } = require('../stepChatHandler');

module.exports = {
  customId: 'kpi_target_start_button',
  handle: async (interaction) => {
    const userId = interaction.user.id;

    if (activeReportSessions.has(userId)) {
      await interaction.reply({
        content: 'すでに申請入力中です。完了するまでお待ちください。',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // KPI目標設定ステップチャット開始！stepChatHandlerに委譲する
    activeReportSessions.set(userId, { step: 0, type: 'target', data: {} });

    await interaction.reply({
      content: 'KPI目標設定を開始します。期間の開始日を「YYYY/MM/DD」の形式で入力してください。',
      flags: MessageFlags.Ephemeral,
    });
  },
};
