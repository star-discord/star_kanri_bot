const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('siyousyo')
    .setDescription('KPI Bot の仕様書を表示します'),

  async execute(interaction) {
    await interaction.reply({
      content: `
📌 **KPI申請Bot 仕様書（要点）**

🔧 /kpi_設定
- 店舗名の追加（モーダル）
- 店舗ごとの目標人数を設定

📩 /kpi_設置
- 店舗・人数を選んで報告スレッドに投稿
- 達成率も自動で計算されます

🗃️ データファイル（Render上の永続ディスク）
- \`data/kpi_shops.json\`: 店舗リスト
- \`data/kpi_ninzuu.json\`: KPI設定履歴

✅ Render 対応済み。Persistent Disk によって再起動後もデータ保持

📎 詳細は GitHub または管理者まで。
      `,
      ephemeral: true // ✅ 非公開メッセージ
    });
  },
};
