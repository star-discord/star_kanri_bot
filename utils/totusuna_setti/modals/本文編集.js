// utils/totusuna_setti/modals/本文編集.js
const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionResponseFlags
} = require('discord.js');

module.exports = {
  async handle(interaction) {
    const modalId = interaction.customId;
    const match = modalId.match(/^totusuna_edit_modal_(.+)$/); // ← 修正
    if (!match) return;

    const uuid = match[1];
    const guildId = interaction.guildId;
    const inputText = interaction.fields.getTextInputValue('body');

    const dataDir = path.join(__dirname, '../../../data', guildId);
    const dataFile = path.join(dataDir, `${guildId}.json`);

    if (!fs.existsSync(dataFile)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral
      });
    }

    const json = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    const target = json.totusuna?.[uuid]; // ← 修正

    if (!target) {
      return await interaction.reply({
        content: '⚠ 指定された設置情報が存在しません。',
        flags: InteractionResponseFlags.Ephemeral
      });
    }

    // 本文の更新
    target.body = inputText;
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    // メッセージを取得して更新
    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      const message = await channel.messages.fetch(target.messageId);

      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(inputText)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`tousuna_report_button_${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('⚠ メッセージの再取得・編集に失敗:', err);
      return await interaction.reply({
        content: '⚠ メッセージの更新に失敗しました。',
        flags: InteractionResponseFlags.Ephemeral
      });
    }

    await interaction.reply({
      content: '✅ 本文を更新し、表示も変更しました。',
      flags: InteractionResponseFlags.Ephemeral
    });
  },
};
