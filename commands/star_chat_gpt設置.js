const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_set')  // 英数字かつ小文字のみ
    .setDescription('指定チャンネルにChatGPT案内メッセージとボタンを設置します。'),

  async execute(interaction) {
    try {
      const button = new ButtonBuilder()
        .setCustomId('chat_gpt_today_button')
        .setLabel('今日のchat gpt')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const content = `🤖 **ChatGPT案内**\n以下のボタンを押すと「天気」「ニュース」「豆知識」などの情報が届きます。`;

      await interaction.reply({ content, components: [row], ephemeral: false });
    } catch (error) {
      console.error('star_chat_gpt_set コマンド実行エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
    }
  },
};
