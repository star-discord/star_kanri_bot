// utils/totusuna_quick/selects/template.js
// サンプル: セレクトメニューハンドラ

module.exports = {
  customId: 'totusuna_quick_sample_select',
  handle: async (interaction) => {
    await interaction.reply({ content: 'サンプルセレクトが選択されました', flags: MessageFlags.Ephemeral });
  }
};
