// ファイル参�E: utils/kpi_setti/buttons/kpi_target_start_button.js

const { activeReportSessions } = require('../stepChatHandler');

module.exports = {
  customId: 'kpi_target_start_button',
  handle: async (interaction) => {
    const userId = interaction.user.id;

    if (activeReportSessions.has(userId)) {
      await interaction.reply({
        content: 'すでに申請�E力中です。完亁E��るまでお征E��ください、E,
        ephemeral: true,
      });
      return;
    }

    // KPI目標設定スチE��プチャチE��開始！EtepChatHandlerに委譲�E�E    activeReportSessions.set(userId, { step: 0, type: 'target', data: {} });

    await interaction.reply({
      content: 'KPI目標設定を開始します。期間�E開始日を「YYYY/MM/DD」�E形式で入力してください、E,
      ephemeral: true,
    });
  },
};
