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
  customIdStart: 'totusuna_edit_modal:',

  /**
   * 本文編集モーダル処理（UUID形式）
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const newBody = interaction.fields.getTextInputValue('body');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const instance = (json.totusuna?.instances || []).find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠ 対象の設置データが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    instance.body = newBody;

    try {
      const channel = await interaction.guild.channels.fetch(instance.installChannelId);
      const message = await channel.messages.fetch(instance.messageId);

      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(newBody)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totusuna:report:${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
      console.warn('[editBody] メッセージ更新に失敗:', err.message);
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '✅ 本文を更新しました！',
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
