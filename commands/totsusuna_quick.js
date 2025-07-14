// 仮コマンド: 実装予定
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('totsusuna_quick')
    .setDescription('仮: totsusuna_quick コマンド（未実装）'),
  async execute(interaction) {
    await interaction.reply({ content: 'このコマンドは現在未実装です。', flags: 64 });
  }
};
