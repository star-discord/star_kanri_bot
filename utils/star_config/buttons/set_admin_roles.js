const path = require('path');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const { MessageFlags } = require('discord.js'); // 追加

module.exports = {
  customId: 'star_config:set_admin_roles',

  /**
   * ボタン: star_config:set_admin_roles
   * RoleSelect で選択されたロールめEJSON に保存！Etar_config.adminRoleIds�E�E   */
  async handle(interaction) {
    // RoleSelectMenu Interactionであることを想宁E    if (!interaction.isRoleSelectMenu()) {
      return interaction.reply({
        content: '❁Eこ�E操作�Eロール選択から�Eみ可能です、E,
        flags: MessageFlags.Ephemeral
      });
    }

    const guildId = interaction.guild.id;
    const selectedRoles = interaction.values;

    if (!selectedRoles || selectedRoles.length === 0) {
      return interaction.reply({
        content: '⚠�E�Eロールが選択されてぁE��せん、E,
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
        content: `✁E管琁E��E��ールを以下�E通り設定しました:\n${mentionText}`,
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.error(`❁E管琁E��E��ール保存中にエラー (${guildId}):`, err);
      await interaction.reply({
        content: '❁E管琁E��E��ールの保存に失敗しました、E,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
