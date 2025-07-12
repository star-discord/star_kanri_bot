// commands/star_chat_gpt設定.js
const { SlashCommandBuilder } = require('discord.js');
const requireAdmin = require('../utils/permissions/requireAdmin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt設定')
    .setDescription('STAR ChatGPT の設定を表示または変更します'),
  execute: requireAdmin(async (interaction) => {
    await interaction.reply('設定コマンドは現在準備中です。');
  })
};
