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
  customIdStart: 'totusuna_edit_modal:', // UUID対応�Eためコロン形式に統一

  /**
   * 本斁E��雁E��ーダルの送信後�E琁E   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const modalId = interaction.customId;
    const uuid = modalId.replace(this.customIdStart, '');
    const guildId = interaction.guildId;
    const inputText = interaction.fields.getTextInputValue('body');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが見つかりません、E,
        flags: MessageFlags.Ephemeral
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const target = json.totusuna?.instances?.[uuid];

    if (!target) {
      return await interaction.reply({
        content: '⚠ 持E��された設置惁E��が存在しません、E,
        flags: MessageFlags.Ephemeral
      });
    }

    // 本斁E��新と保孁E    target.body = inputText;
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
        .setLabel('凸スナ報呁E)
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('[editBody] メチE��ージ編雁E��敁E', err);
      return await interaction.reply({
        content: '⚠ メチE��ージの更新に失敗しました、E,
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.reply({
      content: '✁E本斁E��更新し、表示も変更しました、E,
      flags: MessageFlags.Ephemeral
    });
  }
};
