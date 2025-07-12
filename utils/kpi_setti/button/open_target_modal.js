const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = async (interaction) => {
  // モーダル作成
  const modal = new ModalBuilder()
    .setCustomId('kpi_target')
    .setTitle('KPI目標設定');

  // 各入力フィールド作成
  const startDateInput = new TextInputBuilder()
    .setCustomId('start_date')
    .setLabel('開始日 (例: 2025/07/13)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const endDateInput = new TextInputBuilder()
    .setCustomId('end_date')
    .setLabel('終了日 (例: 2025/07/18)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const visitorsInput = new TextInputBuilder()
    .setCustomId('visitors')
    .setLabel('来客数目標')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const shimeiCountInput = new TextInputBuilder()
    .setCustomId('shimei_count')
    .setLabel('指名本数目標')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const shimeiSalesInput = new TextInputBuilder()
    .setCustomId('shimei_sales')
    .setLabel('指名売上目標')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const freeSalesInput = new TextInputBuilder()
    .setCustomId('free_sales')
    .setLabel('フリー売上目標')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const totalSalesInput = new TextInputBuilder()
    .setCustomId('total_sales')
    .setLabel('純売上目標')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  // Discord モーダルは最大5個までのActionRowにしか入らないので2行に分割
  const firstRow = new ActionRowBuilder().addComponents(startDateInput, endDateInput, visitorsInput);
  const secondRow = new ActionRowBuilder().addComponents(shimeiCountInput, shimeiSalesInput, freeSalesInput, totalSalesInput);

  // ただしActionRowは5個までなので、ここは分けて実装するか、複数モーダル使うか検討してください
  // Discordでは1モーダルに5つのTextInputまでしか入らないため、分割必須です。

  // ここは簡単に3つずつに分割例で示します

  // モーダルに追加（5個まで）
  modal.addComponents(
    new ActionRowBuilder().addComponents(startDateInput),
    new ActionRowBuilder().addComponents(endDateInput),
    new ActionRowBuilder().addComponents(visitorsInput),
    new ActionRowBuilder().addComponents(shimeiCountInput),
    new ActionRowBuilder().addComponents(shimeiSalesInput)
  );

  // TODO: 6個目以降の入力は別モーダルや分割の設計が必要です

  await interaction.showModal(modal);
};
