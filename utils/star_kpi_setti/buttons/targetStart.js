// utils/star_kpi_setti/buttons/targetStart.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

async function handle(interaction) {
  // このモーダルは /star_KPI設定 コマンドと同じものを表示します。
  const modal = new ModalBuilder().setCustomId('kpi_setting_modal').setTitle('KPI目標設定');

  const newShopInput = new TextInputBuilder()
    .setCustomId('newShop')
    .setLabel('店舗名（カンマ区切りで複数追加可能）')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const targetDateInput = new TextInputBuilder()
    .setCustomId('targetDate')
    .setLabel('対象日 (YYYY-MM-DD)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const targetCountInput = new TextInputBuilder()
    .setCustomId('targetCount')
    .setLabel('目標人数')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(newShopInput),
    new ActionRowBuilder().addComponents(targetDateInput),
    new ActionRowBuilder().addComponents(targetCountInput)
  );

  await interaction.showModal(modal);
}

module.exports = {
  customId: 'kpi_target_start_button',
  handle,
};