const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const requireAdmin = require('../utils/permissions/requireAdmin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_setti')  // 英数字かつ小文字のみ
    .setDescription('指定チャンネルにChatGPT案内メッセージとボタンを設置します'),

  execute: requireAdmin(async (interaction) => {
    try {
      const infoButton = new ButtonBuilder()
        .setCustomId('star_chat_gpt_setti_button')
        .setLabel('� 今日のChatGPT')
        .setStyle(ButtonStyle.Primary);

      const configButton = new ButtonBuilder()
        .setCustomId('chatgpt_config_button')
        .setLabel('⚙︁E設宁E)
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(infoButton, configButton);

      const content = `🤁E**ChatGPT案�E**\n以下�Eボタンを押すと、「天気」「ニュース」「豁E��識」などの惁E��が届きます。`;

      await interaction.reply({ content, components: [row], ephemeral: false });
    } catch (error) {
      console.error('star_chat_gpt_setti コマンド実行エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'エラーが発生しました、E, flags: MessageFlags.Ephemeral });
      }
    }
  }),
};
