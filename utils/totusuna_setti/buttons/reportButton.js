// utils/totusuna_setti/buttons/reportButton.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_report_button_', // 命名規則に従って統一

  /**
   * 凸スナ報告ボタン押下時の処理：モーダルを表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const customId = interaction.customId;

    // ボタンIDからUUIDを抽出（形式: totsusuna_report_button_<UUID>）
    const uuid = customId.split('_').slice(-1)[0];

    const modal = new ModalBuilder()
      .setCustomId(`totsusuna_modal_${uuid}`) // uuidを付与して特定
      .setTitle('📝 凸スナ報告');

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
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const table2 = new TextInputBuilder()
      .setCustomId('table2')
      .setLabel('卓2（任意）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const detail = new TextInputBuilder()
      .setCustomId('detail')
      .setLabel('補足・詳細（任意）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(groupInput),
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(table1),
      new ActionRowBuilder().addComponents(table2),
      new ActionRowBuilder().addComponents(detail),
    );

    await interaction.showModal(modal);
  },
};
