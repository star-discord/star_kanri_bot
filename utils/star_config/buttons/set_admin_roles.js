// star_config/buttons/set_admin_roles.js
const path = require('path');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'star_config:set_admin_roles',

  /**
   * ボタン: star_config:set_admin_roles
   * RoleSelect で選択されたロールを JSON に保存（star_config.adminRoleIds）
   */
  async handle(interaction) {
    // RoleSelectMenu Interactionであることを想定
    if (!interaction.isRoleSelectMenu()) {
      return interaction.reply({
        content: '❌ この操作はロール選択からのみ可能です。',
        ephemeral: true
      });
    }

    const guildId = interaction.guild.id;
    const selectedRoles = interaction.values;

    if (!selectedRoles || selectedRoles.length === 0) {
      return interaction.reply({
        content: '⚠️ ロールが選択されていません。',
        ephemeral: true
      });
    }

    try {
      const jsonPath = ensureGuildJSON(guildId);
      const data = readJSON(jsonPath);

      if (!data.star_config) data.star_config = {};
      data.star_config.adminRoleIds = selectedRoles;

      writeJSON(jsonPath, data);

      const mentionText = selectedRoles.map(id => `<@&${id}>`).join(', ');

      await interaction.reply({
        content: `✅ 管理者ロールを以下の通り設定しました:\n${mentionText}`,
        ephemeral: true
      });

    } catch (err) {
      console.error(`❌ 管理者ロール保存中にエラー (${guildId}):`, err);
      await interaction.reply({
        content: '❌ 管理者ロールの保存に失敗しました。',
        ephemeral: true
      });
    }
  }
};


