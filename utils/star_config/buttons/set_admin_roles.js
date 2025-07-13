const path = require('path');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const { MessageFlags } = require('discord.js'); // 追加

module.exports = {
  customId: 'star_config:set_admin_roles',

  /**
   * ボタン: star_config:set_admin_roles
   * RoleSelect で選択されたロールをJSON に保存（star_config.adminRoleIds）
   */
  async handle(interaction) {
    // RoleSelectMenu Interactionであることを想定
    if (!interaction.isRoleSelectMenu()) {
      return interaction.reply({
        content: 'エラー: この操作はロール選択からのみ可能です。',
        flags: MessageFlags.Ephemeral
      });
    }

    const guildId = interaction.guild.id;
    const selectedRoles = interaction.values;

    if (!selectedRoles || selectedRoles.length === 0) {
      return interaction.reply({
        content: '警告: ロールが選択されていません。',
        flags: MessageFlags.Ephemeral
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
        content: `完了: 管理者ロールを以下の通り設定しました:\n${mentionText}`,
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.error(`エラー: 管理者ロール保存中にエラー (${guildId}):`, err);
      await interaction.reply({
        content: 'エラー: 管理者ロールの保存に失敗しました。',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
