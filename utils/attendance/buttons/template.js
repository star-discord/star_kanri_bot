// テンプレート: attendance用ボタンハンドラ
module.exports = {
  customId: 'attendance_template',
  handle: async (interaction) => {
    // 実装例
    await interaction.reply({ content: 'テンプレートボタンが押されました', ephemeral: true });
  }
};
