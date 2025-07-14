// utils/star_config/buttons/set_admin_roles.js

const path = require('path');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const { MessageFlagsBitField } = require('discord.js');

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
        flags: MessageFlagsBitField.Flags.Ephemeral
      });
    }

    const guildId = interaction.guild.id;
    const selectedRoles = interaction.values;

    if (!selectedRoles || selectedRoles.length === 0) {
      return interaction.reply({
        content: '⚠️ ロールが選択されていません。',
        flags: MessageFlagsBitField.Flags.Ephemeral
      });
    }

    try {
      const jsonPath = ensureGuildJSON(guildId);
      const data = readJSON(jsonPath);

      if (!data.star_config) data.star_config = {};

      const before = new Set(data.star_config.adminRoleIds || []);
      const after = new Set(selectedRoles);

      const added = selectedRoles.filter(id => !before.has(id));
      const removed = [...before].filter(id => !after.has(id));

      // 保存
      data.star_config.adminRoleIds = selectedRoles;
      writeJSON(jsonPath, data);

      // メッセージ生成
      let message = `✅ 管理者ロールを更新しました:\n${selectedRoles.map(id => `<@&${id}>`).join(', ')}`;
      if (added.length > 0) {
        message += `\n➕ **追加**: ${added.map(id => `<@&${id}>`).join(', ')}`;
      }
      if (removed.length > 0) {
        message += `\n➖ **削除**: ${removed.map(id => `<@&${id}>`).join(', ')}`;
      }

      await interaction.reply({
        content: message,
        flags: MessageFlagsBitField.Flags.Ephemeral
      });

    } catch (err) {
      console.error(`❌ 管理者ロール保存中にエラー (${guildId}):`, err);
      await interaction.reply({
        content: '❌ 管理者ロールの保存に失敗しました。',
        flags: MessageFlagsBitField.Flags.Ephemeral
      });
    }
  }
};
