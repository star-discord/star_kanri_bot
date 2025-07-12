// 繝輔ぃ繧､繝ｫ蜿ら・: utils/kpi_setti/buttons/kpi_report_start_button.js

const { activeReportSessions } = require('../stepChatHandler');

module.exports = {
  customId: 'kpi_report_start_button',
  handle: async (interaction) => {
    const userId = interaction.user.id;

    if (activeReportSessions.has(userId)) {
      await interaction.reply({
        content: '縺吶〒縺ｫ逕ｳ隲句・蜉帑ｸｭ縺ｧ縺吶ょｮ御ｺ・☆繧九∪縺ｧ縺雁ｾ・■縺上□縺輔＞縲・,
        ephemeral: true,
      });
      return;
    }

    // KPI逕ｳ隲具ｼ亥ｮ溽ｸｾ蜈･蜉幢ｼ峨せ繝・ャ繝励メ繝｣繝・ヨ髢句ｧ具ｼ・tepChatHandler縺ｫ蟋碑ｭｲ・・    activeReportSessions.set(userId, { step: 0, type: 'report', data: {} });

    await interaction.reply({
      content: 'KPI螳溽ｸｾ逕ｳ隲九ｒ髢句ｧ九＠縺ｾ縺吶ょｱ蜻翫☆繧区律莉倥ｒ縲刑YYY/MM/DD縲阪・蠖｢蠑上〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・,
      ephemeral: true,
    });
  },
};
