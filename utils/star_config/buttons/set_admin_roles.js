// star_config/buttons/set_admin_roles.js

const path = require('path');
const { MessageFlags } = require('discord-api-types/v10');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper'); // ← 共通ユーティリティ使用推奨

/**
 * ボタン: star_config:set_admin_roles
 * RoleSelect で選択されたロールを JSON に保存（star_config.adminRoleIds）
 */
module.exports = async function(interaction) {
  if (interaction.customId !== 'star_config:set_admin_roles') return;

  const guildId = interaction.guild.id;
  const selectedRoles = interaction.values;

  if (!selectedRoles || selectedRoles.length === 0) {
    return await interaction.reply({
      content: '⚠️ ロールが選択されていません。',
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
      content: `✅ 管理者ロールを以下の通り設定しました:\n${mentionText}`,
      flags: MessageFlags.Ephemeral
    });

  } catch (err) {
    console.error(`❌ 管理者ロール保存中にエラー (${guildId}):`, err);
    await interaction.reply({
      content: '❌ 管理者ロールの保存に失敗しました。',
      flags: MessageFlags.Ephemeral
    });
  }
};

