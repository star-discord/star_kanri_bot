const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat_gpt設置')
    .setDescription('ChatGPT応答の初期設定をします。'),
  async execute(interaction) {
    await interaction.reply('ChatGPT設置コマンドが呼び出されました。');
  },
};
