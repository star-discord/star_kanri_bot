/**
 * 邂｡逅・・ｨｩ髯舌′縺ゅｋ縺九メ繧ｧ繝・け縺励・ * 縺ｪ縺代ｌ縺ｰ諡貞凄縺励√≠繧後・谺｡縺ｮ蜃ｦ逅・ｒ蜻ｼ縺ｳ蜃ｺ縺吶Α繝峨Ν繧ｦ繧ｧ繧｢
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
    
    // Discord 繧ｵ繝ｼ繝舌・縺ｮ邂｡逅・・ｨｩ髯舌ｒ繝√ぉ繝・け
    if (member && member.permissions.has('Administrator')) {
      await next(interaction);
      return;
    }
    
    // Bot蟆ら畑縺ｮ邂｡逅・・Ο繝ｼ繝ｫ繧偵メ繧ｧ繝・け
    if (!member || !member.roles.cache.some(r => adminRoleIds.includes(r.id))) {
      return interaction.reply({
        content: '笶・縺ゅ↑縺溘↓縺ｯ讓ｩ髯舌′縺ゅｊ縺ｾ縺帙ｓ縲・,
        ephemeral: true
      });
    }

    await next(interaction);
  };
}

module.exports = requireAdmin;
