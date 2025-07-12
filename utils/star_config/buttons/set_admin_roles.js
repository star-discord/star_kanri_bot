const path = require('path');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const { MessageFlags } = require('discord.js'); // 霑ｽ蜉

module.exports = {
  customId: 'star_config:set_admin_roles',

  /**
   * 繝懊ち繝ｳ: star_config:set_admin_roles
   * RoleSelect 縺ｧ驕ｸ謚槭＆繧後◆繝ｭ繝ｼ繝ｫ繧・JSON 縺ｫ菫晏ｭ假ｼ・tar_config.adminRoleIds・・   */
  async handle(interaction) {
    // RoleSelectMenu Interaction縺ｧ縺ゅｋ縺薙→繧呈Φ螳・    if (!interaction.isRoleSelectMenu()) {
      return interaction.reply({
        content: '笶・縺薙・謫堺ｽ懊・繝ｭ繝ｼ繝ｫ驕ｸ謚槭°繧峨・縺ｿ蜿ｯ閭ｽ縺ｧ縺吶・,
        flags: MessageFlags.Ephemeral
      });
    }

    const guildId = interaction.guild.id;
    const selectedRoles = interaction.values;

    if (!selectedRoles || selectedRoles.length === 0) {
      return interaction.reply({
        content: '笞・・繝ｭ繝ｼ繝ｫ縺碁∈謚槭＆繧後※縺・∪縺帙ｓ縲・,
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
        content: `笨・邂｡逅・・Ο繝ｼ繝ｫ繧剃ｻ･荳九・騾壹ｊ險ｭ螳壹＠縺ｾ縺励◆:\n${mentionText}`,
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.error(`笶・邂｡逅・・Ο繝ｼ繝ｫ菫晏ｭ倅ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ (${guildId}):`, err);
      await interaction.reply({
        content: '笶・邂｡逅・・Ο繝ｼ繝ｫ縺ｮ菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆縲・,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
