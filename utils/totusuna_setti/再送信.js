// utils/totusuna_setti/buttons/再送信.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({ content: '⚠ 設定ファイルが存在しません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return await interaction.reply({ content: '⚠ 対象の凸スナ設置が見つかりません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const embed = new EmbedBuilder()
      .setTitle('📣 凸スナ報告受付中')
      .setDescription(instance.body)
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId(`tousuna_report_button_${uuid}`)
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const channel = await interaction.guild.channels.fetch(instance.installChannelId).catch(() => null);
    if (!channel) {
      return await interaction.reply({ content: '⚠ チャンネルが見つかりません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const sent = await channel.send({ embeds: [embed], components: [row] });
    instance.messageId = sent.id;

    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '✅ 凸スナを再送信しました。', flags: InteractionResponseFlags.Ephemeral });
  },
};
