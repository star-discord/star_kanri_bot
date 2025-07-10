const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナ報告ボタンを送信'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const targetChannel = await interaction.client.channels.fetch(config.tousunaMainChannelId);

    const messageContent = '📣 **凸スナ報告受付中！**\nボタンを押して報告してください。';

    const button = new ButtonBuilder()
      .setCustomId('tousuna_report_button')
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const message = await targetChannel.send({ content: messageContent, components: [row] });

    // ===== 保存処理開始 =====
    const dataDir = path.join(__dirname, '..', 'data', guildId);
    const dataPath = path.join(dataDir, `${guildId}.json`);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const data = {
      messageId: message.id,
      channelId: message.channel.id,
      createdAt: new Date().toISOString(),
      createdBy: interaction.user.id,
    };

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    // ===== 保存処理終了 =====

    await interaction.reply({ content: '凸スナ設置しました！', ephemeral: true });
  },
};
