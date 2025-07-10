// utils/star_config/buttons.js
module.exports = {
  set_admin_role: async (interaction) => {
    await interaction.deferUpdate();

    // ロール選択がされているか確認
    const selectedRoleId = interaction.values?.[0] || interaction.customId?.split(':')[1];
    if (!selectedRoleId) {
      return interaction.followUp({ content: 'ロールが選択されていません。', ephemeral: true });
    }

    // 設定保存処理（例: JSON ファイル書き換え）
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../../data', interaction.guildId, `${interaction.guildId}_config.json`);
    const config = fs.existsSync(configPath) ? require(configPath) : {};

    config.adminRole = selectedRoleId;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.followUp({ content: '✅ 管理者ロールを設定しました。', ephemeral: true });
  },

  // 他のボタンも必要に応じて追加
};
