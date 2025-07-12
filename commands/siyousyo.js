const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot_仕様書')
    .setDescription('STAR管理bot の仕様書を表示します'),

  async execute(interaction) {
    await interaction.reply({
      content: `
📘 **STAR管理bot 仕様書の要点**

🛠️ **/star管理bot設定**
- 管理者ロールを選択・保存（複数対応）
- 保存先: \`data/<guildId>/<guildId>.json\` の \`star_config.adminRoleIds\`

📌 /凸スナ設置
- ボタン付き報告UIを指定チャンネルに設置
- 本斁E�E褁E��チャンネル・設置先を選択可能

⚡ /凸スナクイチE��設置
- モーダルで本斁E��即入劁EↁE報告UIを設置�E�簡易版�E�E

📁 保存形式とファイル構造
- \`data/<guildId>/<guildId>.json\` に全設定を雁E��E
- \`data/<guildId>/<年朁E-凸スナ報呁Ecsv\`�E�報告ログ�E�ESV�E�E
- 設定�E報告�E永続保存対応済み

🔐 管琁E��限�Eロールによって制御されまぁE

📎 詳しくは GitHub また�E開発老E��で、E
      `,
      flags: 1 << 6 // 非�E開メチE��ージ
    });
  },
};
