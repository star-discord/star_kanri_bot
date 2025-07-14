// 仮コマンド: 実装予定
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('totusuna_config_fixed')
    .setDescription('仮: totusuna_config_fixed コマンド（未実装）'),
  async execute(interaction) {
    await interaction.reply({ content: 'このコマンドは現在未実装です。', flags: 64 });
  }
};
