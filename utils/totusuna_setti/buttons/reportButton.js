// utils/totusuna_setti/buttons/reportButton.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  customIdStart: 'tousuna_report_button_', // ← 追加！

  /**
   * 凸スナ報告ボタン押下 → モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const customId = interaction.customId;

    // UUIDをボタンIDから抽出（例: tousuna_report_button_<UUID>）
    const uuid = customId.split('_').slice(-1)[0];

    const modal = new ModalBuilder()
      .setCustomId(`tousuna_modal_${uuid}`) // uuidを付与して特定
      .setTitle('凸スナ報告');

    const groupInput = new TextInputBuilder()
      .setCustomId('group')
      .setLabel('何組')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('何名')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const table1 = new TextInputBuilder()
      .setCustomId('table1')
      .setLabel('卓1（任意）')
      .setStyle(TextInputStyle.Sh
