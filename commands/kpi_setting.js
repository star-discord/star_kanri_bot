const { addShop, addTargets } = require('../utils/kpiFileUtil');

async function handleKpiSettingModal(interaction) {
  if (interaction.customId !== 'kpi_setting_modal') return false;

  try {
    const newShopRaw = interaction.fields.getTextInputValue('newShop').trim();
    const targetDate = interaction.fields.getTextInputValue('targetDate').trim();
    const targetCount = interaction.fields.getTextInputValue('targetCount').trim();

    if (!targetDate) {
      await interaction.reply({ content: '対象日は必須です。', ephemeral: true });
      return true;
    }

    if (!targetCount || isNaN(targetCount) || Number(targetCount) <= 0) {
      await interaction.reply({ content: '目標人数は正の数字で入力してください。', ephemeral: true });
      return true;
    }

    // 店舗名をカンマで分割・重複除去
    const newShops = [...new Set(
      newShopRaw.split(',').map(s => s.trim()).filter(s => s.length > 0)
    )];

    if (newShops.length === 0) {
      await interaction.reply({ content: '店舗名が入力されなかったため、目標設定は保存されませんでした。', ephemeral: true });
      return true;
    }

    // 並列で店舗追加
    const results = await Promise.all(newShops.map(shop => addShop(shop)));
    const failedShops = newShops.filter((_, i) => !results[i].success);

    if (failedShops.length > 0) {
      console.warn('⚠️ 一部店舗の追加に失敗:', failedShops.join(', '));
    }

    // KPI目標保存
    const targetResult = await addTargets(newShops, targetDate, targetCount, interaction.user.tag);

    if (!targetResult.success) {
      console.error('📛 KPI目標の保存失敗:', targetResult.reason, targetResult.error || '');
      await interaction.reply({
        content: `KPI目標の保存に失敗しました。\n理由: ${targetResult.reason}`,
        ephemeral: true,
      });
      return true;
    }

    // 成功レスポンス
    await interaction.reply({
      content: `✅ 以下の店舗に目標を設定しました。\n` +
               `店舗: ${newShops.join(', ')}\n` +
               `対象日: ${targetDate}\n` +
               `目標人数: ${targetCount}` +
               (failedShops.length > 0 ? `\n⚠️ 追加失敗: ${failedShops.join(', ')}` : ''),
      ephemeral: true,
    });

    return true;

  } catch (error) {
    console.error('モーダル処理で予期せぬエラー:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '処理中にエラーが発生しました。', ephemeral: true });
    }
    return true;
  }
}

module.exports = { handleKpiSettingModal };
