const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot_仕様書')
    .setDescription('STAR管理Bot の仕様書を表示します'),

  async execute(interaction) {
    await interaction.reply({
      content: `
📘 **STAR管理Bot 仕様書（要点）**

🛠️ /star管理bot設定
- 管理者ロールを選択・保存（複数対応）
- 保存先: \`data/<guildId>/<guildId>.json\` の \`star_config.adminRoleIds\`

📌 /凸スナ設置
- ボタン付き報告UIを指定チャンネルに設置
- 本文・複製チャンネル・設置先を選択可能

⚡ /凸スナクイック設置
- モーダルで本文を即入力 → 報告UIを設置（簡易版）

📁 保存形式とファイル構造
- \`data/<guildId>/<guildId>.json\` に全設定を集約
- \`data/<guildId>/<年月>-凸スナ報告.csv\`：報告ログ（CSV）
- 設定・報告の永続保存対応済み

🔐 管理権限はロールによって制御されます

📎 詳しくは GitHub または開発者まで。
      `,
      flags: 1 << 6 // 非公開メッセージ
    });
  },
};
