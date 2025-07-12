/**
 * 管琁E��E��限があるかチェチE��し、E * なければ拒否し、あれ�E次の処琁E��呼び出すミドルウェア
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
    
    // Discord サーバ�Eの管琁E��E��限をチェチE��
    if (member && member.permissions.has('Administrator')) {
      await next(interaction);
      return;
    }
    
    // Bot専用の管琁E��E��ールをチェチE��
    if (!member || !member.roles.cache.some(r => adminRoleIds.includes(r.id))) {
      return interaction.reply({
        content: '❁Eあなたには権限がありません、E,
        ephemeral: true
      });
    }

    await next(interaction);
  };
}

module.exports = requireAdmin;
