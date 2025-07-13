// utils/totusuna_setti/modals/editBody.js
const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_edit_modal:', // UUID対応のためコロン形式に統一

  /**
   * 本文編集モーダルの送信後処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const modalId = interaction.customId;
    const uuid = modalId.replace(this.customIdStart, '');
    const guildId = interaction.guildId;
    const inputText = interaction.fields.getTextInputValue('body');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ 設定ファイルが見つかりません。',
        flags: MessageFlags.Ephemeral
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const target = json.totusuna?.instances?.[uuid];

    if (!target) {
      return await interaction.reply({
        content: '⚠️ 指定された設置データが存在しません。',
        flags: MessageFlags.Ephemeral
      });
    }

    // 本文更新と保存
    target.body = inputText;
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      const message = await channel.messages.fetch(target.messageId);

      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(inputText)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totusuna:report:${uuid}`) // ボタンIDも統一
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('[editBody] メッセージ編集失敗:', err);
      return await interaction.reply({
        content: '⚠️ メッセージの更新に失敗しました。',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.reply({
      content: '✅ 本文を更新し、表示も変更しました。',
      flags: MessageFlags.Ephemeral
    });
  }
};
