// utils/star_kpi_setti/buttons/reportStart.js
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');
const { kpiConfigManager } = require('../../kpiConfigManager');
const { createErrorEmbed } = require('../../embedHelper');

async function handle(interaction) {
  const { guildId } = interaction;

  try {
    // 報告の前に、少なくとも1つの店舗が登録されているか確認します。
    const shops = await kpiConfigManager.getShopList(guildId);
    if (shops.length === 0) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            '店舗未登録',
            'KPI報告を行う前に、まず `/star_KPI設定` コマンドか「KPI目標」ボタンで店舗を登録してください。'
          ),
        ],
        ephemeral: true,
      });
    }

    // 店舗を選択するためのセレクトメニューを作成します。
    const shopSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('kpi_report_shop_select')
      .setPlaceholder('報告対象の店舗を選択してください');

    const options = shops.map((shop) =>
      new StringSelectMenuOptionBuilder().setLabel(shop).setValue(shop)
    );
    shopSelectMenu.addOptions(options.slice(0, 25)); // 最大25件

    const row = new ActionRowBuilder().addComponents(shopSelectMenu);

    await interaction.reply({
      content: 'どの店舗の実績を報告しますか？',
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error('[reportStart.js] KPI報告開始ボタン処理エラー:', error);
    await interaction.reply({ embeds: [createErrorEmbed('処理エラー', '店舗リストの取得中にエラーが発生しました。')], ephemeral: true });
  }
}

module.exports = {
  customId: 'kpi_report_start_button',
  handle,
};