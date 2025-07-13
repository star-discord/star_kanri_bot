// utils/totusuna_quick/buttons/template.js
// サンプル: ボタンハンドラ

module.exports = {
  customId: 'totusuna_quick_sample_button',
  handle: async (interaction) => {
    await interaction.reply({ content: 'サンプルボタンが押されました', ephemeral: true });
  }
};
