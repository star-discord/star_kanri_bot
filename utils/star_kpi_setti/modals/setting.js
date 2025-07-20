// utils/star_kpi_setti/modals/setting.js
const { kpiConfigManager } = require('../../kpiConfigManager');
const { logAndReplyError } = require('../../errorHelper');
const { createSuccessEmbed, createErrorEmbed } = require('../../embedHelper');

async function handle(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const { guildId, user } = interaction;

  const newShopInput = interaction.fields.getTextInputValue('newShop');
  const targetDate = interaction.fields.getTextInputValue('targetDate');
  const targetCount = interaction.fields.getTextInputValue('targetCount');

  // Basic validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return interaction.editReply({
      embeds: [createErrorEmbed('入力エラー', '日付は `YYYY-MM-DD` 形式で入力してください。')],
    });
  }
  if (isNaN(Number(targetCount))) {
    return interaction.editReply({
      embeds: [createErrorEmbed('入力エラー', '目標人数は半角数字で入力してください。')],
    });
  }

  try {
    const shopsToAdd = newShopInput.split(',').map((s) => s.trim()).filter(Boolean);
    const addedShops = [];
    const duplicateShops = [];

    if (shopsToAdd.length > 0) {
      for (const shop of shopsToAdd) {
        const result = await kpiConfigManager.addShop(guildId, shop);
        if (result.success) {
          addedShops.push(shop);
        } else if (result.reason === 'duplicate') {
          duplicateShops.push(shop);
        }
      }
    }

    const allShops = await kpiConfigManager.getShopList(guildId);
    if (allShops.length === 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed('店舗未登録', '目標を設定する店舗がありません。まず店舗を登録してください。')],
      });
    }

    await kpiConfigManager.addTargets(guildId, allShops, targetDate, targetCount, user.tag);

    let description = `**${targetDate}** の目標人数を **${targetCount}人** に設定しました。\n対象店舗: ${allShops.join(', ')}`;
    if (addedShops.length > 0) description += `\n\n**新規追加店舗:** ${addedShops.join(', ')}`;
    if (duplicateShops.length > 0) description += `\n**登録済みのためスキップ:** ${duplicateShops.join(', ')}`;

    await interaction.editReply({ embeds: [createSuccessEmbed('KPI目標設定完了', description)] });
  } catch (error) {
    await logAndReplyError(interaction, error, '❌ KPI目標の設定中にエラーが発生しました。');
  }
}

module.exports = {
  customId: 'kpi_setting_modal',
  handle,
};