const kpiTarget = require('./modal/kpi_target');
const kpiInput = require('./modal/kpi_input');

/**
 * KPI関連のモーダル中継処理
 * @param {ModalSubmitInteraction} interaction
 */
module.exports = async (interaction) => {
  const id = interaction.customId;

  if (id === 'kpi_target') return kpiTarget(interaction);
  if (id === 'kpi_input') return kpiInput(interaction);

  // 必要に応じて他のkpiモーダルも追加可能
};
