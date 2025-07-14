// テンプレート: attendance用ボタンハンドラ
const { MessageFlags } = require('discord.js');
module.exports = {
  customId: 'attendance_template',
  handle: async (interaction) => {
    // 実装例
    await interaction.reply({ content: 'テンプレートボタンが押されました', flags: MessageFlagsBitField.Ephemeral });
  }
};
