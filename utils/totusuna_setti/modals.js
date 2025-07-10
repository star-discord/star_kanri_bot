// utils/totusuna_setti/modals.js
module.exports = {
  async handle(interaction) {
    const id = interaction.customId;

    try {
      // 「本文入力をする」モーダル
      if (id === 'tousuna_content_modal') {
        const handleContentModal = require('./modals/本文入力をする.js');
        return await handleContentModal(interaction);
      }

      // 凸スナ報告モーダル（customId: tousuna_modal_<UUID>）
      if (id.startsWith('tousuna_modal_')) {
        const handleReportModal = require('./modals/凸スナ報告.js');
        return await handleReportModal(interaction);
      }

      // 未対応のモーダルID
      console.warn('[modals.js] 未知のcustomId:', id);
    } catch (error) {
      console.error('[modals.js] モーダル処理中にエラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ モーダル処理中にエラーが発生しました。', ephemeral: true });
      }
    }
  }
};
