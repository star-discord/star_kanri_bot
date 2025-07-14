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
        '🤖 ChatGPT設定管理',
        'ChatGPTの各種設定を管理できます。'
      ).addFields(
        {
          name: '🔧 設定項目',
          value: '• APIキー\n• 最大トークン数\n• 温度設定\n• プロンプト設定',
          inline: false
        },
        {
          name: '📋 現在の状態',
          value: 'APIキー: 未設定\n最大トークン: 150\n温度: 0.7',
          inline: false
        }
      );

      const configButton = new ButtonBuilder()
        .setCustomId('chatgpt_config_button')
        .setLabel('⚙️ 設定変更')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(configButton);

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: 1 << 6
      });
    } catch (error) {
      console.error('ChatGPT設定コマンドエラー:', error);
      await interaction.reply({
        content: '❌ 設定コマンドの実行中にエラーが発生しました。',
        flags: 1 << 6
      });
    }
  })
};
