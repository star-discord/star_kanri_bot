// utils/star_config/admin.js
const fs = require('fs');
const path = require('path');

/**
 * 指定メンバーが /star管理bot設定 で設定された管理者ロールを持っているか確認する
 * @param {GuildMember|CommandInteraction} input - Discordのメンバーまたはinteractionオブジェクト
 * @returns {boolean}
 */
function isAdmin(input) {
  const member = input.member ?? input; // interaction または GuildMember
  const guildId = member.guild.id;
  const configPath = path.resolve(__dirname, `../../data/${guildId}/${guildId}.json`);

  try {
    if (!fs.existsSync(configPath)) return false;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const adminRoleId = config?.star_config?.adminRoleId;
    if (!adminRoleId) return false;

    return member.roles.cache.has(adminRoleId);
  } catch (err) {
    console.error(`❌ 管理者判定エラー (${guildId}):`, err);
    return false;
  }
}

module.exports = isAdmin;
