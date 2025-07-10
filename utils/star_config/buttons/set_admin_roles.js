// star_config/buttons/set_admin_roles.js

const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord-api-types/v10);

/**
 * ボタン: star_config:set_admin_roles
 * RoleSelect で選択されたロールを JSON に保存（star_config.adminRoleIds）
 */
module.exports = async function(interaction) {
  const customId = interaction.customId;
  if (customId !== 'star_config:set_admin_roles') return;

  const guildId = interaction.guild.id;
  const selectedRoles = interaction.values;

  if (!selectedRoles || selectedRoles.length === 0) {
    return await interaction.reply({
      content: '⚠️ ロールが選択されていません。',
      flags: MessageFlags.Ephemeral
    });
  }

  const dataDir = path.join(__dirname, '../../../data', guildId);
  const jsonPath = path.join(dataDir, `${guildId}.json`);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let data = {};
    if (fs.existsSync(jsonPath)) {
      data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }

    if (!data.star_config) data.star_config = {};

    // ✅ 複数のロールIDを保存
    data.star_config.adminRoleIds = selectedRoles;

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

    // ロールメンションのリスト作成
    const mentionText = selectedRoles.map(id => `<@&${id}>`).join(', ');

    await interaction.reply({
      content: `✅ 管理者ロールを以下の通り設定しました:\n${mentionText}`,
      flags: MessageFlags.Ephemeral
    });

  } catch (err) {
    console.error('❌ 管理者ロール保存中にエラー:', err);
    await interaction.reply({
      content: '❌ 管理者ロールの保存に失敗しました。',
      flags: MessageFlags.Ephemeral
    });
  }
};
