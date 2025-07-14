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
   * 凸スナ報告�Eタン押下時の処琁E��モーダルを表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const customId = interaction.customId;

    // ボタンIDからUUIDを抽出�E�形弁E totsusuna_report_button_<UUID>�E�E
    const uuid = customId.split('_').slice(-1)[0];

    const modal = new ModalBuilder()
      .setCustomId(`totsusuna_modal_${uuid}`) // uuidを付与して特宁E
      .setTitle('📝 凸スナ報呁E);

    const groupInput = new TextInputBuilder()
      .setCustomId('group')
      .setLabel('何絁E)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('何名')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const table1 = new TextInputBuilder()
      .setCustomId('table1')
      .setLabel('十E�E�任意！E)
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const table2 = new TextInputBuilder()
      .setCustomId('table2')
      .setLabel('十E�E�任意！E)
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const detail = new TextInputBuilder()
      .setCustomId('detail')
      .setLabel('補足・詳細�E�任意！E)
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
