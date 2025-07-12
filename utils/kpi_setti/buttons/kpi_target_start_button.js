// 繝輔ぃ繧､繝ｫ蜿ら・: utils/kpi_setti/buttons/kpi_target_start_button.js

const { activeReportSessions } = require('../stepChatHandler');

module.exports = {
  customId: 'kpi_target_start_button',
  handle: async (interaction) => {
    const userId = interaction.user.id;

    if (activeReportSessions.has(userId)) {
      await interaction.reply({
        content: '縺吶〒縺ｫ逕ｳ隲句・蜉帑ｸｭ縺ｧ縺吶ょｮ御ｺ・☆繧九∪縺ｧ縺雁ｾ・■縺上□縺輔＞縲・,
        ephemeral: true,
      });
      return;
    }

    // KPI逶ｮ讓呵ｨｭ螳壹せ繝・ャ繝励メ繝｣繝・ヨ髢句ｧ具ｼ・tepChatHandler縺ｫ蟋碑ｭｲ・・    activeReportSessions.set(userId, { step: 0, type: 'target', data: {} });

    await interaction.reply({
      content: 'KPI逶ｮ讓呵ｨｭ螳壹ｒ髢句ｧ九＠縺ｾ縺吶よ悄髢薙・髢句ｧ区律繧偵刑YYY/MM/DD縲阪・蠖｢蠑上〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・,
      ephemeral: true,
    });
  },
};
