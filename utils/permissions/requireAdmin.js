/**
 * 管理者権限があるかチェックし、
 * なければ拒否し、あれば次の処理を呼び出すミドルウェア
 * @param {Function} next
 * @returns {Function}
 */
function requireAdmin(next) {
  return async function(interaction) {
    const { ensureGuildJSON, readJSON } = require('../fileHelper');
    const filePath = await ensureGuildJSON(interaction.guild.id);
    const data = await readJSON(filePath);
    const adminRoleIds = data.star_config?.adminRoleIds || [];

    const member = interaction.member;
    
    // Discord サーバーの管理者権限をチェック
    if (member && member.permissions.has('Administrator')) {
      await next(interaction);
      return;
    }
    
    // Bot専用の管理者ロールをチェック
    if (!member || !member.roles.cache.some(r => adminRoleIds.includes(r.id))) {
      return interaction.reply({
        content: '❌ あなたには権限がありません。',
        ephemeral: true
      });
    }

    await next(interaction);
  };
}

module.exports = requireAdmin;
