const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_setti')
    .setDescription('指定チャンネルにChatGPT案内メッセージとボタンを設置します'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await interaction.editReply({
          embeds: [createAdminEmbed('❌ 権限がありません', 'このコマンドは管理者専用です。')],
        });
      }

      const infoButton = new ButtonBuilder()
        .setCustomId('star_chat_gpt_setti_button')
        .setLabel('🤖 今日のChatGPT')
        .setStyle(ButtonStyle.Primary);

      const configButton = new ButtonBuilder()
        .setCustomId('chatgpt_config_button')
        .setLabel('⚙️ 設定')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(infoButton, configButton);

      const content = `🤖 **ChatGPT案内**\n以下のボタンを押すと、「天気」「ニュース」「豆知識」などの情報が届きます。`;

      await interaction.editReply({ content, components: [row] });
    } catch (error) {
      console.error('star_chat_gpt_setti 実行エラー:', error);
      await interaction.followUp({ content: 'エラーが発生しました。', ephemeral: true });
    }
  },
};
