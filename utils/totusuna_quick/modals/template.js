// utils/totusuna_quick/modals/template.js
// サンプル: モーダルハンドラ

module.exports = {
  customId: 'totusuna_quick_sample_modal',
  handle: async (interaction) => {
    await interaction.reply({ content: 'サンプルモーダルが送信されました', flags: MessageFlags.Ephemeral });
  }
};
