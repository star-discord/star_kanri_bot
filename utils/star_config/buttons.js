// utils/star_config/buttons.js
const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord-api-types/v10');

/**
 * ボタン: set_admin_roles
 * ロール選択後、data/<guildId>/<guildId>.json に保存（star_config.adminRoleId）
 */
module.exports = async function(interaction) {
  const customId = interaction.customId;

  if (customId !== 'set_admin_roles') return;

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

    // 単一ロールを保存（必要に応じて複数対応も可）
    data.star_config.adminRoleId = selectedRoles[0];

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

    await interaction.reply({
      content: `✅ 管理者ロールを <@&${selectedRoles[0]}> に設定しました。`,
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
