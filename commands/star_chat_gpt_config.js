// commands/star_chat_gpt_config.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const requireAdmin = require('../utils/permissions/requireAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_config')
    .setDescription('STAR ChatGPT の設定を表示または変更します'),
  execute: requireAdmin(async (interaction) => {
    try {
      const embed = createAdminEmbed(
        '� ChatGPT設定管理',
        'ChatGPTの各種設定を管理できます。'
      ).addFields(
        {
          name: '🔧 設定頁E��',
          value: '• APIキー\n• 最大ト�Eクン数\n• 温度設定\n• プロンプト設宁E,
          inline: false
        },
        {
          name: '📋 現在の状慁E,
          value: 'APIキー: 未設定\n最大ト�Eクン: 150\n温度: 0.7',
          inline: false
        }
      );

      const configButton = new ButtonBuilder()
        .setCustomId('chatgpt_config_button')
        .setLabel('⚙︁E設定変更')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(configButton);

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });
    } catch (error) {
      console.error('ChatGPT設定コマンドエラー:', error);
      await interaction.reply({
        content: '❁E設定コマンド�E実行中にエラーが発生しました、E,
        ephemeral: true
      });
    }
  })
};
