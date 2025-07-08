export async function handleKpiSettingModal(interaction) {
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

    let newShops = [];
    if (newShopRaw.length > 0) {
      newShops = [...new Set(newShopRaw.split(',').map(s => s.trim()).filter(s => s.length > 0))];
      for (const shop of newShops) {
        const result = await addShop(shop);
        if (!result.success) {
          console.warn(`⚠️ 店舗追加失敗: ${shop}（理由: ${result.reason || '不明'}）`, result.error || '');
        }
      }
    }

    if (newShops.length === 0) {
      await interaction.reply({ content: '店舗名が入力されなかったため、目標設定は保存されませんでした。', ephemeral: true });
      return true;
    }

    const targetResult = await addTargets(newShops, targetDate, targetCount, interaction.user.tag);
    if (!targetResult.success) {
      console.error('📛 KPI目標の保存失敗:', targetResult.reason, targetResult.error || '');
      await interaction.reply({
        content: `KPI目標の保存に失敗しました。\n理由: ${targetResult.reason}`,
        ephemeral: true,
      });
      return true;
    }

    await interaction.reply({
      content: `✅ 以下の店舗に目標を設定しました。\n店舗: ${newShops.join(', ')}\n対象日: ${targetDate}\n目標人数: ${targetCount}`,
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
