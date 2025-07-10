// utils/totusuna_setti/modals/編集.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  customIdStart: 'tousuna_edit_modal_',

  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace('tousuna_edit_modal_', '');
    const newBody = interaction.fields.getTextInputValue('body');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '⚠ データファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const target = json.totsusuna?.[uuid];

    if (!target) {
      return interaction.reply({ content: '⚠ 対象の設置が存在しません。', ephemeral: true });
    }

    // 更新
    target.body = newBody;
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    // メッセージの更新
    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      if (channel && target.messageId) {
        const embed = new EmbedBuilder()
          .setTitle('📣 凸スナ報告受付中')
          .setDescription(newBody)
          .setColor(0x00bfff);

        const button = new ButtonBuilder()
          .setCustomId(`tousuna_report_button_${uuid}`)
          .setLabel('凸スナ報告')
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        const message = await channel.messages.fetch(target.messageId);
        if (message) {
          await message.edit({ embeds: [embed], components: [row] });
        }
      }
    } catch (e) {
      console.warn('❗ メッセージ編集失敗', e);
    }

    await interaction.reply({ content: '✅ 本文を更新しました。', ephemeral: true });
  },
};
