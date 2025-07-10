// utils/totusuna_setti/modals/編集.js
const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionResponseFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_edit_modal_', // ← 修正済み

  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;
    const uuid = customId.replace('totusuna_edit_modal_', ''); // ← 修正済み
    const newBody = interaction.fields.getTextInputValue('body');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const target = json.totusuna?.[uuid]; // ← 修正済み

    if (!target) {
      return await interaction.reply({
        content: '⚠ 設定が見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    target.body = newBody;

    // メッセージ更新（Embed 差し替え）
    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      const message = await channel.messages.fetch(target.messageId);

      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(newBody)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`tousuna_report_button_${uuid}`) // ここは保持でOK（buttonHandlerで識別してる場合）
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
      console.warn('⚠ メッセージ更新に失敗：', err.message);
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '✅ 本文を更新しました！',
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
