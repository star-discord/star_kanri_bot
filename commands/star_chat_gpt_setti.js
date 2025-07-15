const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_setti')  // 英数字かつ小文字のみ
    .setDescription('指定チャンネルにChatGPT案内メッセージとボタンを設置します'),

  async execute(interaction) {
    try {
      // Defer immediately
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      // Then check permissions
      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return interaction.editReply({ embeds: [createAdminEmbed('❌ 権限がありません', 'このコマンドを実行するには管理者権限が必要です。')] });
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
      console.error('star_chat_gpt_setti コマンド実行エラー:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'エラーが発生しました。' });
      } else {
        await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlagsBitField.Flags.Ephemeral });
      }
    }
  }
};
