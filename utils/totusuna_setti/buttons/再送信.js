// utils/totusuna_setti/buttons/再送信.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({ content: '⚠ データファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return await interaction.reply({ content: '⚠ 指定された設置情報が存在しません。', ephemeral: true });
    }

    const channel = await interaction.guild.channels.fetch(instance.installChannelId);
    if (!channel) {
      return await interaction.reply({ content: '⚠ 設置チャンネルが見つかりません。', ephemeral: true });
    }

    // Embed とボタンの再生成
    const embed = new EmbedBuilder()
      .setTitle('📣 凸スナ報告受付中')
      .setDescription(instance.body)
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId(`tousuna_report_button_${uuid}`)
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const sent = await channel.send({ embeds: [embed], components: [row] });

    // 新メッセージIDを保存
    instance.messageId = sent.id;
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '✅ 凸スナボタン付きメッセージを再送信しました。', ephemeral: true });
  },
};
