// 例: utils/star_config/buttons.js に追加
const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    if (customId === 'set_admin_roles') {
      const guildId = interaction.guild.id;
      const selectedRoles = interaction.values;

      const dir = path.join(__dirname, '../../../data', guildId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filePath = path.join(dir, 'admin_roles.json');
      fs.writeFileSync(filePath, JSON.stringify(selectedRoles, null, 2), 'utf8');

      await interaction.reply({
        content: '✅ 管理者ロールを保存しました。',
        flags: InteractionResponseFlags.Ephemeral
      });
    }
  }
};
