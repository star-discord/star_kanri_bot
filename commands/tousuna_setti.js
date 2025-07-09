const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナ報告ボタンを送信'),

  async execute(interaction) {
    const targetChannel = await interaction.client.channels.fetch(config.tousunaMainChannelId);

    const messageContent = '📣 **凸スナ報告受付中！**\nボタンを押して報告してください。';

    const button = new ButtonBuilder()
      .setCustomId('tousuna_report_button')
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await targetChannel.send({ content: messageContent, components: [row] });

    await interaction.reply({ content: '凸スナ設置しました！', ephemeral: true });
  },
};
